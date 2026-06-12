import { json, type RequestHandler } from '@sveltejs/kit';

import { normalizeSearchQuery } from '$lib/search';
import { detectStockTerm } from '$lib/stock';
import { consumeRateLimit } from '$lib/server/search';
import { getClientKey, isVerified } from '$lib/server/security';
import { getStockQuote, isStockEnabled, type StockRange } from '$lib/server/stocks';

const NO_STORE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const EMPTY = { quote: null };

function parseRange(value: string | null): StockRange {
	return value === 'year' || value === '5y' ? value : 'month';
}

export const GET: RequestHandler = async (event) => {
	// Off unless a Finnhub key is configured — return an empty payload so the
	// client renders nothing.
	if (!isStockEnabled()) return json(EMPTY, { headers: NO_STORE });

	const query = normalizeSearchQuery(event.url.searchParams.get('q') ?? '');
	const match = query ? detectStockTerm(query) : null;
	if (!match) return json(EMPTY, { headers: NO_STORE });

	const range = parseRange(event.url.searchParams.get('range'));
	const ip = getClientKey(event);

	// Verified humans bypass the limit; everyone else shares the search budget.
	if (!(await isVerified(ip))) {
		const rateLimit = await consumeRateLimit(ip);
		if (!rateLimit.allowed) {
			return json(EMPTY, {
				headers: { ...NO_STORE, 'Retry-After': String(rateLimit.retryAfterSeconds) },
				status: 429
			});
		}
	}

	try {
		const quote = await getStockQuote(match.term, range, match.exact, event.fetch);
		return json({ quote }, { headers: NO_STORE });
	} catch {
		return json(EMPTY, { headers: NO_STORE });
	}
};
