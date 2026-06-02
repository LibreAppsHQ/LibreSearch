import { env } from '$env/dynamic/private';

import { getRedis } from './kv';

/**
 * Optional stock quote instant answers via Finnhub's REST API.
 *
 * Privacy note: when enabled, the resolved ticker (not the raw query) is sent to
 * Finnhub to fetch a quote, company profile, and price history. The feature is
 * OFF unless `FINNHUB_API_KEY` is configured, and it logs nothing. Callers fall
 * back to rendering no widget when this returns null.
 */
const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const REQUEST_TIMEOUT_MS = 8_000;

// Cache resolved quotes briefly so repeated searches don't re-bill the API or
// hammer the rate limit. Backed by Redis when configured; otherwise a small
// per-instance map. Quotes are intentionally short-lived so prices stay fresh.
const QUOTE_CACHE_TTL_MS = 60_000;
const RESOLVE_CACHE_TTL_MS = 24 * 60 * 60_000;
const CACHE_MAX_ENTRIES = 500;
const REDIS_PREFIX = 'stock:';

export type StockRange = 'month' | 'year' | '5y';
export type StockPoint = { t: number; c: number };

export type StockQuote = {
	symbol: string;
	name: string;
	exchange: string;
	currency: string;
	price: number;
	change: number;
	changePercent: number;
	open: number;
	high: number;
	low: number;
	prevClose: number;
	range: StockRange;
	points: StockPoint[];
};

type LocalEntry = { value: unknown; expiresAt: number };
const localCache = new Map<string, LocalEntry>();

/** Whether stock answers are configured (a Finnhub API key is present). */
export function isStockEnabled(): boolean {
	return Boolean(env.FINNHUB_API_KEY?.trim());
}

async function cacheGet<T>(key: string): Promise<T | null> {
	const redis = getRedis();
	if (redis) {
		try {
			const hit = await redis.get<T>(REDIS_PREFIX + key);
			return hit ?? null;
		} catch {
			return null;
		}
	}
	const entry = localCache.get(key);
	if (!entry) return null;
	if (entry.expiresAt < Date.now()) {
		localCache.delete(key);
		return null;
	}
	return entry.value as T;
}

async function cacheSet(key: string, value: unknown, ttlMs: number): Promise<void> {
	const redis = getRedis();
	if (redis) {
		try {
			await redis.set(REDIS_PREFIX + key, value, { px: ttlMs });
		} catch {
			/* ignore cache write failures */
		}
		return;
	}
	if (localCache.size >= CACHE_MAX_ENTRIES) {
		const oldest = localCache.keys().next().value;
		if (oldest) localCache.delete(oldest);
	}
	localCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null;
}

async function finnhub(
	path: string,
	params: Record<string, string>,
	fetchFn: typeof fetch
): Promise<unknown> {
	const apiKey = env.FINNHUB_API_KEY?.trim();
	if (!apiKey) throw new Error('FINNHUB_API_KEY is not configured');

	const url = new URL(FINNHUB_BASE + path);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	url.searchParams.set('token', apiKey);

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const res = await fetchFn(url, { signal: controller.signal });
		if (!res.ok) throw new Error(`Finnhub ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Resolve a free-text term (a ticker like "AAPL" or a name like "apple") to a
 * concrete symbol, preferring common stock with the closest description match.
 */
async function resolveSymbol(
	term: string,
	exact: boolean,
	fetchFn: typeof fetch
): Promise<string | null> {
	const key = `sym:${exact ? 'x:' : ''}${term.toLowerCase()}`;
	const cached = await cacheGet<string | null>(key);
	if (cached !== null) return cached || null;

	const data = await finnhub('/search', { q: term }, fetchFn);
	const rows = isRecord(data) && Array.isArray(data.result) ? data.result : [];
	const upper = term.toUpperCase();

	let best: string | null = null;
	let bestScore = -1;
	for (const row of rows) {
		if (!isRecord(row)) continue;
		const symbol = typeof row.symbol === 'string' ? row.symbol : '';
		const type = typeof row.type === 'string' ? row.type : '';
		if (!symbol) continue;
		const isExact = symbol.toUpperCase() === upper;
		// In exact mode (bare ticker / $TICKER) only an exact ticker counts, so a
		// stray word never resolves to some loosely related listing.
		if (exact && !isExact) continue;
		// Score: exact ticker match wins, then common stock, then plain tickers.
		let score = 0;
		if (isExact) score += 100;
		if (type === 'Common Stock') score += 10;
		// Prefer plain tickers (no exchange suffix) so "AAPL" beats "AAPL.MX".
		if (!symbol.includes('.')) score += 5;
		if (score > bestScore) {
			bestScore = score;
			best = symbol;
		}
	}

	await cacheSet(key, best ?? '', RESOLVE_CACHE_TTL_MS);
	return best;
}

const RANGE_CONFIG: Record<StockRange, { range: string; interval: string }> = {
	month: { range: '1mo', interval: '1d' },
	year: { range: '1y', interval: '1wk' },
	'5y': { range: '5y', interval: '1mo' }
};

const YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart/';

/**
 * Fetch historical close points for the chart from Yahoo's free chart endpoint.
 *
 * Finnhub's own candle endpoint is premium-only, so we use Yahoo (no key) just
 * for the price history while keeping Finnhub for the live quote and profile.
 * Returns [] when unavailable so the card degrades to quote-only.
 */
async function getPoints(
	symbol: string,
	range: StockRange,
	fetchFn: typeof fetch
): Promise<StockPoint[]> {
	const cfg = RANGE_CONFIG[range];
	const url = new URL(YAHOO_CHART + encodeURIComponent(symbol));
	url.searchParams.set('range', cfg.range);
	url.searchParams.set('interval', cfg.interval);

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const res = await fetchFn(url, {
			signal: controller.signal,
			headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' }
		});
		if (!res.ok) return [];
		const data = await res.json();
		const result =
			isRecord(data) &&
			isRecord(data.chart) &&
			Array.isArray(data.chart.result) &&
			isRecord(data.chart.result[0])
				? (data.chart.result[0] as Record<string, unknown>)
				: null;
		if (!result) return [];

		const ts = Array.isArray(result.timestamp) ? result.timestamp : [];
		const indicators = isRecord(result.indicators) ? result.indicators : {};
		const quoteArr = Array.isArray(indicators.quote) ? indicators.quote : [];
		const closeBlock = isRecord(quoteArr[0]) ? (quoteArr[0] as Record<string, unknown>) : {};
		const close = Array.isArray(closeBlock.close) ? closeBlock.close : [];

		const points: StockPoint[] = [];
		for (let i = 0; i < ts.length; i++) {
			const t = Number(ts[i]);
			const c = Number(close[i]);
			// Yahoo emits nulls for gaps (holidays) — skip them.
			if (Number.isFinite(t) && Number.isFinite(c)) points.push({ t, c });
		}
		return points;
	} catch {
		return [];
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Resolve `term` to a symbol and return its current quote, company profile, and
 * price history for `range`. Returns null when stocks are disabled, the term
 * can't be resolved, or the symbol has no live quote.
 */
export async function getStockQuote(
	term: string,
	range: StockRange,
	exact: boolean = false,
	fetchFn: typeof fetch = fetch
): Promise<StockQuote | null> {
	if (!isStockEnabled()) return null;
	const cleaned = term.trim();
	if (!cleaned) return null;

	const symbol = await resolveSymbol(cleaned, exact, fetchFn);
	if (!symbol) return null;

	const quoteKey = `quote:${symbol}:${range}`;
	const cached = await cacheGet<StockQuote>(quoteKey);
	if (cached) return cached;

	const [quoteRaw, profileRaw, points] = await Promise.all([
		finnhub('/quote', { symbol }, fetchFn),
		finnhub('/stock/profile2', { symbol }, fetchFn).catch(() => ({})),
		getPoints(symbol, range, fetchFn)
	]);

	if (!isRecord(quoteRaw)) return null;
	const price = Number(quoteRaw.c);
	const prevClose = Number(quoteRaw.pc);
	// A zero current price means Finnhub has no quote for this symbol.
	if (!Number.isFinite(price) || price === 0) return null;

	const profile = isRecord(profileRaw) ? profileRaw : {};
	const quote: StockQuote = {
		symbol,
		name: typeof profile.name === 'string' && profile.name ? profile.name : symbol,
		exchange: typeof profile.exchange === 'string' ? profile.exchange : '',
		currency: typeof profile.currency === 'string' ? profile.currency : 'USD',
		price,
		change: Number(quoteRaw.d) || 0,
		changePercent: Number(quoteRaw.dp) || 0,
		open: Number(quoteRaw.o) || 0,
		high: Number(quoteRaw.h) || 0,
		low: Number(quoteRaw.l) || 0,
		prevClose: Number.isFinite(prevClose) ? prevClose : 0,
		range,
		points
	};

	await cacheSet(quoteKey, quote, QUOTE_CACHE_TTL_MS);
	return quote;
}
