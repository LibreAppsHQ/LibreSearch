import { json, type RequestHandler } from '@sveltejs/kit';
import { createChallenge } from '$lib/server/altcha';

export const GET: RequestHandler = async () => {
	return json(createChallenge(), {
		headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }
	});
};
