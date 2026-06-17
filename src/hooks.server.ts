import crypto from 'node:crypto';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { sentryHandle, handleErrorWithSentry } from '@sentry/sveltekit';
import { getUser } from '$lib/server/appwrite';
import { getPlan } from '$lib/server/plan';
import { logger, createLogger } from '$lib/server/logger';
import {
	overwriteGetLocale,
	overwriteSetLocale,
	extractLocaleFromRequest,
	locales,
	baseLocale,
	cookieName as localeCookieName
} from '$lib/paraglide/runtime.js';

// Sentry only runs when a DSN is configured (the hosted libresearch.ca deploy).
// Self-hosted instances leave PUBLIC_SENTRY_DSN unset → no telemetry at all.
const SENTRY_DSN = process.env.PUBLIC_SENTRY_DSN?.trim() || '';

Sentry.init({
	dsn: SENTRY_DSN,
	enabled: Boolean(SENTRY_DSN),
	// Privacy: never send default PII (e.g. IP addresses) to Sentry.
	sendDefaultPii: false,
	tracesSampleRate: 0.1,
	// Strip any IP / user identifiers from the payload before it's sent.
	beforeSend(event) {
		if (event.user) {
			delete event.user.ip_address;
			delete event.user.email;
		}
		if (event.request?.headers) {
			delete event.request.headers['X-Forwarded-For'];
			delete event.request.headers['x-forwarded-for'];
		}
		return event;
	}
});

const SECURITY_HEADERS: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'no-referrer',
	// Disable powerful features, and opt out of ad-targeting APIs (Topics / legacy
	// FLoC) — important for a privacy-first search engine.
	'Permissions-Policy':
		'geolocation=(), microphone=(), camera=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'X-DNS-Prefetch-Control': 'off'
};

// Per-request CSP. Inline scripts (theme bootstrap, SvelteKit init, JSON-LD)
// are authorized via a nonce injected into every nonce-less inline <script>
// by transformPageChunk below. 'unsafe-inline' remains only as a fallback for
// legacy browsers — any nonce-aware browser ignores it, so injected inline
// scripts are blocked where it matters.
// Third-party CSP hosts are only allowed on the hosted deploy (Vercel) or when
// the corresponding service is configured — a self-hosted instance with no
// analytics/Sentry/Appwrite gets a strictly first-party policy.
const onVercel = Boolean(process.env.VERCEL);
const SCRIPT_HOSTS = onVercel
	? ' https://va.vercel-scripts.com https://cloud.umami.is https://challenges.cloudflare.com'
	: ' https://challenges.cloudflare.com';
const CONNECT_HOSTS = [
	'https://api.web3forms.com',
	...(onVercel ? ['https://vitals.vercel-insights.com', 'https://cloud.umami.is'] : []),
	...(SENTRY_DSN ? ['https://*.ingest.us.sentry.io'] : []),
	...(process.env.PUBLIC_APPWRITE_ENDPOINT || onVercel ? ['https://*.cloud.appwrite.io'] : [])
].join(' ');

function buildCsp(nonce: string, secure: boolean): string {
	return [
		"default-src 'self'",
		// va.vercel-scripts.com hosts Speed Insights; cloud.umami.is hosts Umami analytics.
		`script-src 'self' 'nonce-${nonce}' 'unsafe-inline'${SCRIPT_HOSTS}`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' https: data:",
		"font-src 'self' data:",
		// Web3Forms is the contact-form backend; vitals.vercel-insights.com is
		// the Speed Insights beacon endpoint.
		// *.ingest.us.sentry.io is the Sentry error/trace ingest endpoint.
		// *.cloud.appwrite.io is the Appwrite Cloud API (auth + databases).
		`connect-src 'self' ${CONNECT_HOSTS}`,
		// Only the embeds we actually render: privacy YouTube, Vimeo player, OSM maps.
		'frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.openstreetmap.org https://challenges.cloudflare.com',
		"worker-src 'self' blob:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		// Only meaningful on https. On a plain-http self-hosted/LAN instance it
		// makes the browser rewrite same-origin asset URLs to https://, which
		// fails and renders the page unstyled.
		...(secure ? ['upgrade-insecure-requests'] : [])
	].join('; ');
}

// Matches inline <script> openers (no src=) that don't already carry a nonce.
const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)(?![^>]*\bnonce=)([^>]*)>/g;

// Resolve the logged-in user (if any) from the session cookie and attach it,
// plus their plan, to event.locals for downstream loaders and endpoints.
const authHandle: Handle = async ({ event, resolve }) => {
	const user = await getUser(event);
	event.locals.user = user;
	event.locals.plan = user ? await getPlan(user.id) : 'free';
	return resolve(event);
};

// Detect the user's locale from cookie or Accept-Language header using
// paraglide-js strategies, then set it for the request duration on the
// server and attach the resolved locale to event.locals.
const i18nHandle: Handle = async ({ event, resolve }) => {
	const locale = extractLocaleFromRequest(event.request);
	const validLocale: string = (locales as readonly string[]).includes(locale) ? locale : baseLocale;
	event.locals.locale = validLocale;

	let currentLocale = validLocale;
	overwriteGetLocale(() => currentLocale as typeof baseLocale);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(overwriteSetLocale as any)((newLocale: string) => {
		currentLocale = (locales as readonly string[]).includes(newLocale) ? newLocale : currentLocale;
	});

	const response = await resolve(event);

	const proto = event.request.headers.get('x-forwarded-proto');
	const secureCookie = proto ? proto === 'https' : event.url.protocol === 'https:';
	const cookieValue = `${localeCookieName}=${currentLocale}; Path=/; Max-Age=${60 * 60 * 24 * 400}; SameSite=Lax${secureCookie ? '; Secure' : ''}`;
	if (response.headers.has('set-cookie')) {
		response.headers.append('set-cookie', cookieValue);
	} else {
		response.headers.set('set-cookie', cookieValue);
	}

	return response;
};

const securityHandle: Handle = async ({ event, resolve }) => {
	// Browsers and crawlers still probe /favicon.ico even when the page declares
	// an SVG icon. We don't ship a .ico, so without this we'd 500/404 on every
	// such probe. Redirect to the SVG we do have.
	if (event.url.pathname === '/favicon.ico') {
		return new Response(null, {
			status: 301,
			headers: { location: '/favicon.svg', 'cache-control': 'public, max-age=86400' }
		});
	}

	const nonce = crypto.randomBytes(16).toString('base64');

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace(INLINE_SCRIPT_RE, `<script nonce="${nonce}"$1>`)
	});

	// Trust the proxy's protocol header if present (TLS usually terminates there).
	const proto = event.request.headers.get('x-forwarded-proto');
	const secure = proto ? proto === 'https' : event.url.protocol === 'https:';

	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		// HSTS over plain http is ignored by browsers and can poison LAN hosts
		// that are later served over https by something else — skip it.
		if (header === 'Strict-Transport-Security' && !secure) continue;
		response.headers.set(header, value);
	}
	response.headers.set('Content-Security-Policy', buildCsp(nonce, secure));

	// Some SEO crawlers flag HTML responses whose `Content-Type` lacks an
	// explicit charset, even when a `<meta charset>` is present. Make sure
	// every HTML response declares utf-8 at the HTTP-header level too.
	const contentType = response.headers.get('content-type');
	if (contentType?.startsWith('text/html') && !/charset=/i.test(contentType)) {
		response.headers.set('content-type', `${contentType}; charset=utf-8`);
	}

	return response;
};

const requestLogger = createLogger('http');

const logHandle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const response = await resolve(event);
	const duration = Date.now() - start;
	const url = event.url.pathname + event.url.search;

	if (response.status >= 500) {
		requestLogger.error(
			{ method: event.request.method, url, status: response.status, duration },
			'request error'
		);
	} else if (response.status >= 400 && response.status < 500) {
		requestLogger.warn(
			{ method: event.request.method, url, status: response.status, duration },
			'request warn'
		);
	} else {
		requestLogger.info(
			{ method: event.request.method, url, status: response.status, duration },
			'request'
		);
	}

	return response;
};

// Sentry's request handler runs first, then auth, locale detection, logging, and security headers.
export const handle: Handle = sequence(
	sentryHandle(),
	authHandle,
	i18nHandle,
	logHandle,
	securityHandle
);

// Reports unhandled server-side errors to Sentry and structured logs.
const sentryErrorHandler = handleErrorWithSentry();

export const handleError = (async (input: {
	error: unknown;
	event: import('@sveltejs/kit').RequestEvent;
	status: number;
	message: string;
}) => {
	const err = input.error instanceof Error ? input.error : new Error(String(input.error));
	logger.error({ err, url: input.event.url.pathname }, 'unhandled server error');
	return sentryErrorHandler(input);
}) satisfies import('@sveltejs/kit').HandleServerError;
