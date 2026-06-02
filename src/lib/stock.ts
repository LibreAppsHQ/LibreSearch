/**
 * Detect whether a search query is asking for a stock quote and extract the term
 * to resolve (a ticker like "AAPL" or a company name like "apple").
 *
 * Three triggers, increasingly strict:
 *  - "$AAPL"            → explicit ticker, exact match required
 *  - "<term> stock" …   → keyword present, fuzzy name match allowed
 *  - a bare "tsla"      → candidate ticker, but only shown when it resolves to an
 *                         EXACT ticker so ordinary words never pop a card
 */
const STOCK_KEYWORD =
	/\b(stocks?|shares?|share\s+price|stock\s+price|ticker|nyse|nasdaq)\b/;

const STRIP =
	/\b(stock\s+price|share\s+price|stocks?|shares?|ticker|price|quote|of|the|for|on|nyse|nasdaq)\b/g;

// Common short words that happen to collide with real tickers — never treat
// these as a bare ticker lookup.
const STOPWORDS = new Set([
	'the',
	'and',
	'for',
	'you',
	'are',
	'who',
	'why',
	'how',
	'what',
	'when',
	'where',
	'free',
	'best',
	'near',
	'open',
	'time',
	'news',
	'maps',
	'home',
	'shop',
	'love',
	'game',
	'play',
	'song',
	'food',
	'porn',
	'sex',
	'app',
	'apps',
	'web',
	'cat',
	'dog',
	'car',
	'job',
	'jobs'
]);

export type StockMatch = { term: string; exact: boolean };

export function detectStockTerm(query: string): StockMatch | null {
	const q = query.trim();
	if (!q) return null;

	// "$AAPL" form — an explicit ticker.
	const dollar = /(?:^|\s)\$([A-Za-z]{1,6})(?:\s|$)/.exec(q);
	if (dollar) return { term: dollar[1].toUpperCase(), exact: true };

	const lower = q.toLowerCase();

	// Keyword form — "tesla stock", "share price of caterpillar".
	if (STOCK_KEYWORD.test(lower)) {
		const term = lower
			.replace(STRIP, ' ')
			.replace(/\$/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		if (term) return { term, exact: false };
	}

	// Bare token — a lone 1-5 letter word that might be a ticker (e.g. "tsla").
	if (/^[a-z]{1,5}$/.test(lower) && !STOPWORDS.has(lower)) {
		return { term: lower.toUpperCase(), exact: true };
	}

	return null;
}
