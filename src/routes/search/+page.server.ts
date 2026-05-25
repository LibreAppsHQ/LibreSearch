import { redirect } from '@sveltejs/kit';
import {
	normalizeSearchQuery,
	SEARCH_QUERY_ERROR,
	VALID_TABS,
	VALID_FRESHNESS,
	type SearchTab
} from '$lib/search';
import { resolveBang } from '$lib/bangs';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, url }) => {
	// Honeypot - bots fill this field, humans don't
	if (url.searchParams.get('website')) {
		return {
			query: '',
			tab: 'web' as const,
			freshness: undefined,
			region: '',
			safe: false,
			page: 1,
			error: '',
			results: [],
			newsResults: undefined,
			videoResults: undefined,
			imageResults: undefined,
			infobox: undefined,
			didYouMean: undefined
		};
	}

	const rawQuery = url.searchParams.get('q') ?? '';

	// Bang redirect — must happen before normalisation so short/special queries work
	if (rawQuery.trim()) {
		const bang = resolveBang(rawQuery.trim());
		if (bang) redirect(302, bang.redirectUrl);
	}

	const query = normalizeSearchQuery(rawQuery);
	const safe = url.searchParams.get('safe') === '1';
	const region = url.searchParams.get('region') || '';
	const rawPage = parseInt(url.searchParams.get('p') ?? '1', 10);
	// Brave caps `offset` at 9, so page 10 is the highest reachable page.
	const page = isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 10);
	const enableCache = url.searchParams.get('enablecache') === '1';
	const rawTab = url.searchParams.get('t') ?? 'web';
	const tab: SearchTab = VALID_TABS.has(rawTab as SearchTab) ? (rawTab as SearchTab) : 'web';
	const rawFreshness = url.searchParams.get('f') ?? '';
	const freshness = VALID_FRESHNESS.has(rawFreshness) ? rawFreshness : undefined;

	if (!rawQuery) {
		return {
			query: '',
			tab,
			freshness,
			region,
			safe,
			page,
			error: '',
			results: [],
			newsResults: undefined,
			videoResults: undefined,
			imageResults: undefined,
			infobox: undefined,
			didYouMean: undefined
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
			error: SEARCH_QUERY_ERROR,
			results: [],
			newsResults: undefined,
			videoResults: undefined,
			imageResults: undefined,
			infobox: undefined,
			didYouMean: undefined
		};
	}

	const filterAds = url.searchParams.get('filterads') === '1';
	const blockAds = url.searchParams.get('blockads') === '1';
	const blockTrackers = url.searchParams.get('blocktrackers') === '1';

	const apiParams = new URLSearchParams({ q: query, t: tab });
	// Brave's `offset` is a page index (skips offset × count results), max 9.
	if (page > 1) apiParams.set('offset', String(page - 1));
	if (safe) apiParams.set('safe', '1');
	if (freshness) apiParams.set('f', freshness);
	if (region) apiParams.set('region', region);
	if (filterAds) apiParams.set('filterads', '1');
	if (blockAds) apiParams.set('blockads', '1');
	if (blockTrackers) apiParams.set('blocktrackers', '1');
	if (enableCache) apiParams.set('enablecache', '1');

	try {
		const response = await fetch(`/api/search?${apiParams}`);
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
			infobox?: {
				title: string;
				description?: string;
				url?: string;
				imageUrl?: string;
				attributes?: Array<[string, string]>;
				profiles?: Array<{ network: string; url: string; imageUrl?: string }>;
			};
			didYouMean?: string;
		} | null;

		if (!response.ok) throw new Error(payload?.error ?? 'Search backend unavailable.');

		return {
			query: payload?.query?.trim() || query,
			tab,
			freshness,
			region,
			safe,
			page,
			error: payload?.error || '',
			results: Array.isArray(payload?.results) ? payload.results : [],
			newsResults: payload?.newsResults,
			videoResults: payload?.videoResults,
			imageResults: payload?.imageResults,
			infobox: payload?.infobox,
			didYouMean: payload?.didYouMean
		};
	} catch {
		return {
			query,
			tab,
			freshness,
			region,
			safe,
			page,
			error: 'Search backend unavailable.',
			results: [],
			newsResults: undefined,
			videoResults: undefined,
			imageResults: undefined,
			infobox: undefined,
			didYouMean: undefined
		};
	}
}) satisfies PageServerLoad;
