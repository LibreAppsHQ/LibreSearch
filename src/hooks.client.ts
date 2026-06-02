import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry } from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://c6f76c27eb2b5e689b2b18fe208334b3@o4511459621011456.ingest.us.sentry.io/4511459622125568',
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

// Reports unhandled client-side errors to Sentry.
export const handleError = handleErrorWithSentry();
