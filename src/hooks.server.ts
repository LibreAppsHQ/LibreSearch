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
		// va.vercel-scripts.com hosts the Speed Insights + Analytics scripts.
		"script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' https: data:",
		"font-src 'self' data:",
		// Web3Forms is the contact-form backend; vitals.vercel-insights.com is
		// the Speed Insights beacon endpoint.
		"connect-src 'self' https://api.web3forms.com https://vitals.vercel-insights.com",
		'frame-src https:',
		"worker-src 'self' blob:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		'upgrade-insecure-requests'
	].join('; ')
};

export const handle: Handle = async ({ event, resolve }) => {
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
