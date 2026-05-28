import type { Handle } from '@sveltejs/kit';

const SECURITY_HEADERS: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'no-referrer',
	'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	'X-DNS-Prefetch-Control': 'off',
	'Content-Security-Policy': [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' https: data:",
		"font-src 'self' data:",
		"connect-src 'self'",
		'frame-src https:',
		"worker-src 'self' blob:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		'upgrade-insecure-requests'
	].join('; ')
};

export const handle: Handle = async ({ event, resolve }) => {
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
