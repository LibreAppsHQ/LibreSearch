import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Returns the caller's IP for the "what's my IP" instant answer. Nothing is
// logged or stored - it's read from the request and handed straight back.
//
// On Vercel / behind a proxy, `getClientAddress()` may return the loopback
// address (`::1` or `127.0.0.1`) because the upstream socket is the proxy.
// We prefer the standard forwarding headers and fall back to the raw address.

const LOOPBACK = new Set(['::1', '127.0.0.1', '0.0.0.0', '']);

function pickClientIp(event: Parameters<RequestHandler>[0]): string {
	const h = event.request.headers;

	// Order matters: Vercel-specific, Cloudflare, then generic.
	const candidates = [
		h.get('x-vercel-forwarded-for'),
		h.get('cf-connecting-ip'),
		h.get('x-real-ip'),
		// x-forwarded-for can be a comma-separated list; the left-most is the
		// originating client.
		h.get('x-forwarded-for')?.split(',')[0]
	]
		.map((v) => v?.trim())
		.filter((v): v is string => !!v && !LOOPBACK.has(v));

	if (candidates.length > 0) return candidates[0];

	// No forwarded headers - fall back to the socket address. This may be a
	// loopback (`::1` / `127.0.0.1`) in local dev, which is the right answer:
	// the visitor really is on this machine.
	try {
		return event.getClientAddress();
	} catch {
		return '';
	}
}

export const GET: RequestHandler = (event) => {
	const ip = pickClientIp(event);
	return json(
		{ ip },
		{ headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } }
	);
};
