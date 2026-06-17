import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry } from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';

// Sentry only runs when a DSN is configured (the hosted libresearch.ca deploy).
// Self-hosted instances leave PUBLIC_SENTRY_DSN unset → no telemetry at all.
const SENTRY_DSN = env.PUBLIC_SENTRY_DSN?.trim() || '';

Sentry.init({
	dsn: SENTRY_DSN,
	enabled: Boolean(SENTRY_DSN),
	// Privacy: never send default PII (e.g. IP addresses) to Sentry.
	sendDefaultPii: false,
	tracesSampleRate: 0.1,
	// Strip any IP / user identifiers from the payload before it leaves the browser.
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

// After a new deploy, an already-open page may still reference JS/CSS asset
// hashes from the previous build. Vite fires `vite:preloadError` when one of
// those stale chunks can't be fetched; reload once to pull the fresh HTML +
// asset graph. The timestamp guard prevents a reload loop when the asset is
// genuinely missing (e.g. CDN outage) instead of just stale, while still
// allowing a fresh reload for a later deploy in the same tab session.
if (typeof window !== 'undefined') {
	const reloadOnceForStaleAssets = () => {
		const RELOAD_KEY = 'preload-error-reloaded-at';
		const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
		if (Date.now() - last < 10_000) return;
		sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
		window.location.reload();
	};

	window.addEventListener('vite:preloadError', reloadOnceForStaleAssets);

	// Dynamic import() failures after a deploy don't always fire vite:preloadError.
	window.addEventListener('unhandledrejection', (event) => {
		const message =
			typeof event.reason === 'object' &&
			event.reason !== null &&
			'message' in event.reason &&
			typeof event.reason.message === 'string'
				? event.reason.message
				: String(event.reason ?? '');
		if (message.includes('Failed to fetch dynamically imported module')) {
			reloadOnceForStaleAssets();
		}
	});
}

// Reports unhandled client-side errors to Sentry.
export const handleError = handleErrorWithSentry();

// Register the service worker for offline caching and PWA installability.
// Skipped during dev (HMR + SW don't mix well) and on self-hosted instances
// where `PUBLIC_SENTRY_DSN` is absent (we use that as a hosted-deploy signal).
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
	const hostedDeploy = /(^|\.)libresearch\.ca$/.test(window.location.hostname);
	const shouldRegister = hostedDeploy || Boolean(import.meta.env.PUBLIC_SENTRY_DSN);

	if (shouldRegister && 'serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => {
				// Fail silently — offline support is a progressive enhancement.
			});
		});
	}
}
