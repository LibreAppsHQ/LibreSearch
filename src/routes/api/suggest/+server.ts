import { json, type RequestHandler } from '@sveltejs/kit';
import { consumeRateLimit } from '$lib/server/search';
import { getClientKey } from '$lib/server/security';

export const GET: RequestHandler = async (event) => {
	const { url, fetch } = event;
	const clientKey = getClientKey(event);

	const rateLimit = await consumeRateLimit(clientKey);
	if (!rateLimit.allowed) {
		return json([], {
			headers: { 'Cache-Control': 'no-store', 'Retry-After': String(rateLimit.retryAfterSeconds) },
			status: 429
		});
	}

	const q = url.searchParams.get('q')?.trim().slice(0, 200);

	if (!q) {
		return json([], { headers: { 'Cache-Control': 'no-store' } });
	}

	try {
		const response = await fetch(
			`https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`,
			{
				headers: { 'User-Agent': 'LibreSearch/1.0' },
				signal: AbortSignal.timeout(3000)
			}
		);

		if (!response.ok) {
			return json([], { headers: { 'Cache-Control': 'no-store' } });
		}

		const payload = (await response.json()) as unknown;
		const suggestions =
			Array.isArray(payload) && Array.isArray(payload[1]) ? (payload[1] as string[]) : [];

		return json(suggestions, { headers: { 'Cache-Control': 'no-store' } });
	} catch {
		return json([], { headers: { 'Cache-Control': 'no-store' } });
	}
};
