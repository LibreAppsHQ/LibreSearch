import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Lightweight liveness probe - the /status page pings this without burning
// upstream API quota. Returns a small JSON payload that includes server-side
// timestamp so the client can measure round-trip latency itself.

const STARTED_AT = Date.now();

export const GET: RequestHandler = () => {
	return json(
		{
			status: 'ok',
			now: Date.now(),
			uptimeMs: Date.now() - STARTED_AT
		},
		{
			headers: {
				'cache-control': 'no-store',
				'x-robots-tag': 'noindex, nofollow'
			}
		}
	);
};
