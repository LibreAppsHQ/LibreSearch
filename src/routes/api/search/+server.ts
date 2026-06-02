import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import {
	SEARCH_QUERY_ERROR,
	normalizeSearchQuery,
	VALID_TABS,
	VALID_FRESHNESS,
	type SearchTab
} from '$lib/search';
import { consumeRateLimit, searchBrave } from '$lib/server/search';
import { flagSuspicious, isVerified, getClientKey } from '$lib/server/security';

export const GET: RequestHandler = async (event) => {
	const ip = getClientKey(event);

	// Honeypot — silently drop requests where the bot-trap field is filled,
	// and flag the client so it must solve a challenge to continue.
	if (event.url.searchParams.get('website')) {
		flagSuspicious(ip);
		return json(
			{ query: '', tab: 'web', results: [] },
			{ headers: { 'Cache-Control': 'no-store' }, status: 200 }
		);
	}

	const query = normalizeSearchQuery(event.url.searchParams.get('q') ?? '');

	if (!query) {
		return json(
			{ error: SEARCH_QUERY_ERROR },
			{ headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }, status: 400 }
		);
	}

	// Verified humans bypass the rate limit; everyone else is throttled, and
	// tripping the limit flags them for a challenge.
	if (!isVerified(ip)) {
		const rateLimit = await consumeRateLimit(ip);
		if (!rateLimit.allowed) {
			flagSuspicious(ip);
			return json(
				{ error: 'Too many searches. Please wait a moment.' },
				{
					headers: {
						'Cache-Control': 'no-store',
						'Retry-After': String(rateLimit.retryAfterSeconds),
						'X-Robots-Tag': 'noindex, nofollow'
					},
					status: 429
				}
			);
		}
	}

	const rawSafe = event.url.searchParams.get('safe');
	const safe: 'strict' | 'moderate' | 'off' =
		rawSafe === 'strict' ? 'strict' : rawSafe === 'low' ? 'off' : 'moderate';
	const rawOffset = parseInt(event.url.searchParams.get('offset') ?? '0', 10);
	const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
	const rawTab = event.url.searchParams.get('t') ?? 'web';
	const tab: SearchTab = VALID_TABS.has(rawTab as SearchTab) ? (rawTab as SearchTab) : 'web';
	const rawFreshness = event.url.searchParams.get('f') ?? '';
	const freshness = VALID_FRESHNESS.has(rawFreshness) ? rawFreshness : undefined;
	const country = event.url.searchParams.get('region') || undefined;
	const filterAds = event.url.searchParams.get('filterads') === '1';
	const blockAds = event.url.searchParams.get('blockads') === '1';
	const blockTrackers = event.url.searchParams.get('blocktrackers') === '1';
	const useCache = event.url.searchParams.get('enablecache') === '1';
	const rawCount = parseInt(event.url.searchParams.get('count') ?? '', 10);
	// Images can return up to 100; other tabs are capped at 20 by Brave.
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
				filterAds,
				blockAds,
				blockTrackers,
				useCache,
				count,
				waitUntil: event.platform?.context?.waitUntil
			},
			event.fetch
		);
		return json(payload, {
			headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }
		});
	} catch (error) {
		if (!env.BRAVE_SEARCH_API_KEY) {
			return json(
				{ query, tab, results: [], error: 'Search backend not configured yet.' },
				{
					headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
					status: 200
				}
			);
		}
		if (error instanceof Error && /BRAVE_SEARCH_API_KEY/i.test(error.message)) {
			return json(
				{ query, tab, results: [], error: error.message },
				{
					headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
					status: 200
				}
			);
		}
		if (error instanceof Error && /429/i.test(error.message)) {
			return json(
				{
					query,
					tab,
					results: [],
					error: 'Too many requests to the search backend. Please wait a moment.'
				},
				{
					headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
					status: 200
				}
			);
		}
		if (error instanceof Error && /40[13]/i.test(error.message)) {
			return json(
				{
					query,
					tab,
					results: [],
					error: 'This search type is not available with your current Brave API subscription.'
				},
				{
					headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
					status: 200
				}
			);
		}
		if (error instanceof Error && /4\d\d/i.test(error.message)) {
			return json(
				{
					query,
					tab,
					results: [],
					error: 'Search backend rejected the request. Try a different query.'
				},
				{
					headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
					status: 200
				}
			);
		}
		return json(
			{ query, tab, results: [], error: 'Search backend unavailable.' },
			{ headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }, status: 200 }
		);
	}
};
