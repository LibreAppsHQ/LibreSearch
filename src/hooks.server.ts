import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { sentryHandle, handleErrorWithSentry } from '@sentry/sveltekit';
import { getUser } from '$lib/server/appwrite';
import { getPlan } from '$lib/server/plan';

Sentry.init({
	dsn: 'https://c6f76c27eb2b5e689b2b18fe208334b3@o4511459621011456.ingest.us.sentry.io/4511459622125568',
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
	'X-DNS-Prefetch-Control': 'off',
	'Content-Security-Policy': [
		"default-src 'self'",
		// va.vercel-scripts.com hosts the Speed Insights + Analytics scripts.
		"script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' https: data:",
		"font-src 'self' data:",
		// Web3Forms is the contact-form backend; vitals.vercel-insights.com is
		// the Speed Insights beacon endpoint.
		// *.ingest.us.sentry.io is the Sentry error/trace ingest endpoint.
		// *.cloud.appwrite.io is the Appwrite Cloud API (auth + databases).
		"connect-src 'self' https://api.web3forms.com https://vitals.vercel-insights.com https://*.ingest.us.sentry.io https://*.cloud.appwrite.io",
		'frame-src https:',
		"worker-src 'self' blob:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		'upgrade-insecure-requests'
	].join('; ')
};

// Resolve the logged-in user (if any) from the session cookie and attach it,
// plus their plan, to event.locals for downstream loaders and endpoints.
const authHandle: Handle = async ({ event, resolve }) => {
	const user = await getUser(event);
	event.locals.user = user;
	event.locals.plan = user ? await getPlan(user.id) : 'free';
	return resolve(event);
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

	const response = await resolve(event);

	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(header, value);
	}

	// Some SEO crawlers flag HTML responses whose `Content-Type` lacks an
	// explicit charset, even when a `<meta charset>` is present. Make sure
	// every HTML response declares utf-8 at the HTTP-header level too.
	const contentType = response.headers.get('content-type');
	if (contentType?.startsWith('text/html') && !/charset=/i.test(contentType)) {
		response.headers.set('content-type', `${contentType}; charset=utf-8`);
	}

	return response;
};

// Sentry's request handler runs first, then our security/header handler.
export const handle: Handle = sequence(sentryHandle(), authHandle, securityHandle);

// Reports unhandled server-side errors to Sentry.
export const handleError = handleErrorWithSentry();
