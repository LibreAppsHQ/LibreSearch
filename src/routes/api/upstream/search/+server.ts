import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';

import {
	SEARCH_QUERY_ERROR,
	normalizeSearchQuery,
	VALID_TABS,
	VALID_FRESHNESS,
	type SearchTab
} from '$lib/search';
import { consumeRateLimit, searchBrave } from '$lib/server/search';

// Upstream search proxy for self-hosted LibreSearch instances.
//
// The hosted deploy holds the Brave API key; self-hosted instances that don't
// have their own key authenticate here with a bearer token (issued by the
// operator via UPSTREAM_SEARCH_TOKENS) and get normalized SearchResponse JSON
// back. Each token is rate limited independently, on top of the per-IP limits
// the calling instance applies to its own users.

function timingSafeIncludes(tokens: string[], candidate: string): boolean {
	const candidateBuf = Buffer.from(candidate);
	let found = false;
	for (const token of tokens) {
		const tokenBuf = Buffer.from(token);
		if (tokenBuf.length === candidateBuf.length && crypto.timingSafeEqual(tokenBuf, candidateBuf)) {
			found = true;
		}
	}
	return found;
}

export const GET: RequestHandler = async (event) => {
	const tokens = (env.UPSTREAM_SEARCH_TOKENS ?? '')
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);

	if (tokens.length === 0) {
		return json(
			{ error: 'Upstream search is not enabled on this instance.' },
			{ headers: { 'Cache-Control': 'no-store' }, status: 404 }
		);
	}

	const auth = event.request.headers.get('authorization') ?? '';
	const presented = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
	if (!presented || !timingSafeIncludes(tokens, presented)) {
		return json(
			{ error: 'Invalid or missing upstream token.' },
			{ headers: { 'Cache-Control': 'no-store' }, status: 401 }
		);
	}

	// Rate limit per token (not per IP — one instance serves many users).
	const tokenKey = `upstream:${crypto.createHash('sha256').update(presented).digest('hex').slice(0, 16)}`;
	const rateLimit = await consumeRateLimit(tokenKey);
	if (!rateLimit.allowed) {
		return json(
			{ error: 'Upstream rate limit exceeded.' },
			{
				headers: {
					'Cache-Control': 'no-store',
					'Retry-After': String(rateLimit.retryAfterSeconds)
				},
				status: 429
			}
		);
	}

	const query = normalizeSearchQuery(event.url.searchParams.get('q') ?? '');
	if (!query) {
		return json({ error: SEARCH_QUERY_ERROR }, { headers: { 'Cache-Control': 'no-store' }, status: 400 });
	}

	const rawSafe = event.url.searchParams.get('safe');
	const safe: 'strict' | 'moderate' | 'off' =
		rawSafe === 'strict' ? 'strict' : rawSafe === 'off' ? 'off' : 'moderate';
	const rawOffset = parseInt(event.url.searchParams.get('offset') ?? '0', 10);
	const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
	const rawTab = event.url.searchParams.get('t') ?? 'web';
	const tab: SearchTab = VALID_TABS.has(rawTab as SearchTab) ? (rawTab as SearchTab) : 'web';
	const rawFreshness = event.url.searchParams.get('f') ?? '';
	const freshness = VALID_FRESHNESS.has(rawFreshness) ? rawFreshness : undefined;
	const country = event.url.searchParams.get('region') || undefined;
	const rawCount = parseInt(event.url.searchParams.get('count') ?? '', 10);
	const maxCount = tab === 'images' ? 100 : 20;
	const count = isNaN(rawCount) ? 10 : Math.min(Math.max(rawCount, 1), maxCount);

	try {
		const payload = await searchBrave(
			query,
			{
				safesearch: safe,
				offset,
				tab,
				freshness,
				country,
				// Always cache upstream queries — many instances share this pool.
				useCache: true,
				count,
				waitUntil: event.platform?.context?.waitUntil
			},
			event.fetch
		);
		return json(payload, { headers: { 'Cache-Control': 'no-store' } });
	} catch {
		return json(
			{ query, tab, results: [], error: 'Upstream search failed.' },
			{ headers: { 'Cache-Control': 'no-store' }, status: 502 }
		);
	}
};
