import { normalizeSearchQuery, SEARCH_QUERY_ERROR } from '$lib/search';

import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, url }) => {
	const rawQuery = url.searchParams.get('q') ?? '';
	const query = normalizeSearchQuery(rawQuery);

	if (!rawQuery) {
		return {
			activeQuery: '',
			error: '',
			results: []
		};
	}

	if (!query) {
		return {
			activeQuery: '',
			error: SEARCH_QUERY_ERROR,
			results: []
		};
	}

	try {
		const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
		const payload = (await response.json().catch(() => null)) as {
			error?: string;
			query?: string;
			results?: Array<{ title: string; url: string; snippet: string }>;
		} | null;

		if (!response.ok) {
			throw new Error(payload?.error ?? 'Search backend unavailable.');
		}

		return {
			activeQuery: payload?.query?.trim() || query,
			error: '',
			results: Array.isArray(payload?.results) ? payload.results : []
		};
	} catch {
		return {
			activeQuery: query,
			error: 'Search backend unavailable.',
			results: []
		};
	}
}) satisfies PageServerLoad;
