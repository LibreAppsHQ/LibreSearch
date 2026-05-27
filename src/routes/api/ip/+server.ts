import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Returns the caller's IP for the "what's my IP" instant answer. Nothing is
// logged or stored — it's read from the request and handed straight back.
export const GET: RequestHandler = (event) => {
	let ip = '';
	try {
		ip = event.getClientAddress();
	} catch {
		ip = '';
	}
	return json(
		{ ip },
		{ headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } }
	);
};
