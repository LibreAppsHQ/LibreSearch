import { redirect } from '@sveltejs/kit';
import {
	normalizeSearchQuery,
	SEARCH_QUERY_ERROR,
	VALID_TABS,
	VALID_FRESHNESS,
	type SearchTab
} from '$lib/search';
import { resolveBang } from '$lib/bangs';
import { challengeRequired, flagSuspicious, getClientKey } from '$lib/server/security';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

type ParamGetter = (key: string) => string | null;

// Shared search resolver used by both the GET `load` (params from the URL) and
// the POST form action (params from the request body, so the query stays out of
// the URL when the user picks the POST request method in settings).
async function runSearch(event: RequestEvent, get: ParamGetter) {
	const ip = getClientKey(event);

	// Empty payload shape reused for blocked/challenge states.
	const blocked = (challenge: boolean) => ({
		query: '',
		tab: 'web' as const,
		freshness: undefined,
		region: '',
		safe: 'moderate' as const,
		page: 1,
		count: 10,
		error: '',
		results: [],
		newsResults: undefined,
		videoResults: undefined,
		imageResults: undefined,
		placeResults: undefined,
		infobox: undefined,
		challengeRequired: challenge
	});

	// Honeypot — bots fill this field, humans don't
	if (get('website')) {
		flagSuspicious(ip);
		return blocked(false);
	}

	const rawQuery = get('q') ?? '';

	// Bang redirect — must happen before normalisation so short/special queries work
	if (rawQuery.trim()) {
		const bang = resolveBang(rawQuery.trim());
		if (bang) redirect(302, bang.redirectUrl);
	}

	const query = normalizeSearchQuery(rawQuery);
	const rawSafe = get('safe');
	const safe: 'strict' | 'moderate' | 'low' =
		rawSafe === 'strict' ? 'strict' : rawSafe === 'low' ? 'low' : 'moderate';
	const region = get('region') || '';
	const rawPage = parseInt(get('p') ?? '1', 10);
	// Brave caps `offset` at 9, so page 10 is the highest reachable page.
	const page = isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 10);
	const enableCache = get('enablecache') === '1';
	const rawTab = get('t') ?? 'web';
	const tab: SearchTab = VALID_TABS.has(rawTab as SearchTab) ? (rawTab as SearchTab) : 'web';
	// The images grid loads a full page of results; other tabs honor the setting.
	const count = tab === 'images' ? 100 : get('count') === '20' ? 20 : 10;
	const rawFreshness = get('f') ?? '';
	const freshness = VALID_FRESHNESS.has(rawFreshness) ? rawFreshness : undefined;

	if (!rawQuery) {
		return {
			query: '',
			tab,
			freshness,
			region,
			safe,
			page,
			count,
			challengeRequired: false,
			error: '',
			results: [],
			newsResults: undefined,
			videoResults: undefined,
			imageResults: undefined,
			placeResults: undefined,
			infobox: undefined
		};
	}

	if (!query) {
		return {
			query: '',
			tab,
			freshness,
			region,
			safe,
			page,
			count,
			challengeRequired: false,
			error: SEARCH_QUERY_ERROR,
			results: [],
			newsResults: undefined,
			videoResults: undefined,
			imageResults: undefined,
			placeResults: undefined,
			infobox: undefined
		};
	}

	// Adaptive ALTCHA gate: a flagged client must solve a challenge before searching.
	if (challengeRequired(ip)) {
		return { ...blocked(true), query };
	}

	const filterAds = get('filterads') === '1';
	const blockAds = get('blockads') === '1';
	const blockTrackers = get('blocktrackers') === '1';

	const apiParams = new URLSearchParams({ q: query, t: tab });
	// Brave's `offset` is a page index (skips offset × count results), max 9.
	if (page > 1) apiParams.set('offset', String(page - 1));
	if (safe !== 'moderate') apiParams.set('safe', safe);
	if (freshness) apiParams.set('f', freshness);
	if (region) apiParams.set('region', region);
	if (filterAds) apiParams.set('filterads', '1');
	if (blockAds) apiParams.set('blockads', '1');
	if (blockTrackers) apiParams.set('blocktrackers', '1');
	if (enableCache) apiParams.set('enablecache', '1');
	if (count !== 10) apiParams.set('count', String(count));

	try {
		const response = await event.fetch(`/api/search?${apiParams}`);

		// Rate-limited → the client has been flagged; show a challenge instead of an error.
		if (response.status === 429) {
			flagSuspicious(ip);
			return { ...blocked(true), query };
		}

		const payload = (await response.json().catch(() => null)) as {
			error?: string;
			query?: string;
			tab?: SearchTab;
			results?: Array<{
				title: string;
				url: string;
				snippet: string;
				siteName?: string;
				age?: string;
				thumbnail?: string;
				sitelinks?: Array<{ title: string; url: string }>;
			}>;
			newsResults?: Array<{
				title: string;
				url: string;
				snippet: string;
				siteName?: string;
				age?: string;
				thumbnail?: string;
			}>;
			videoResults?: Array<{
				title: string;
				url: string;
				description?: string;
				thumbnail?: string;
				age?: string;
				duration?: string;
				views?: string;
				publisher?: string;
			}>;
			imageResults?: Array<{
				title: string;
				url: string;
				imageUrl: string;
				thumbnail: string;
				source?: string;
				width?: number;
				height?: number;
			}>;
			placeResults?: Array<{
				name: string;
				displayName: string;
				lat: number;
				lon: number;
				category?: string;
				type?: string;
				boundingBox?: [string, string, string, string];
				osmType?: string;
				osmId?: number;
			}>;
			infobox?: {
				title: string;
				subtitle?: string;
				description?: string;
				url?: string;
				imageUrl?: string;
				attributes?: Array<[string, string]>;
				profiles?: Array<{ network: string; url: string; imageUrl?: string }>;
			};
		} | null;

		if (!response.ok) throw new Error(payload?.error ?? 'Search backend unavailable.');

		return {
			query: payload?.query?.trim() || query,
			tab,
			freshness,
			region,
			safe,
			page,
			count,
			challengeRequired: false,
			error: payload?.error || '',
			results: Array.isArray(payload?.results) ? payload.results : [],
			newsResults: payload?.newsResults,
			videoResults: payload?.videoResults,
			imageResults: payload?.imageResults,
			placeResults: payload?.placeResults,
			infobox: payload?.infobox
		};
	} catch {
		return {
			query,
			tab,
			freshness,
			region,
			safe,
			page,
			count,
			challengeRequired: false,
			error: 'Search backend unavailable.',
			results: [],
			newsResults: undefined,
			videoResults: undefined,
			imageResults: undefined,
			placeResults: undefined,
			infobox: undefined
		};
	}
}

export const load = (async (event) => {
	return runSearch(event, (key) => event.url.searchParams.get(key));
}) satisfies PageServerLoad;

export const actions = {
	// POST search: the query travels in the request body, so it never appears in
	// the URL or browser history. Returns the same shape `load` does; the page
	// renders from the `form` prop in that case.
	default: async (event) => {
		const data = await event.request.formData();
		return runSearch(event, (key) => {
			const value = data.get(key);
			return typeof value === 'string' ? value : null;
		});
	}
} satisfies Actions;
