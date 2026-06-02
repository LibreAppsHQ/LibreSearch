import { env } from '$env/dynamic/private';

import {
	SEARCH_QUERY_ERROR,
	normalizeSearchQuery,
	type SearchResponse,
	type SearchResult,
	type NewsResult,
	type VideoResult,
	type ImageResult,
	type Infobox,
	type PlaceResult,
	type SearchTab
} from '$lib/search';
import { getRedis } from './kv';
import { consumeTokenBucket, type TokenBucketState } from './ratelimit';
import { getTorFetch } from './tor';

const RATE_LIMIT_BUCKET_CAPACITY = 20;
const RATE_LIMIT_REFILL_INTERVAL_MS = 5_000;
const RATE_LIMIT_STATE_TTL_MS = 5 * 60_000;
// Redis-backed limiter uses an equivalent fixed window: at most CAPACITY requests
// per (CAPACITY * REFILL_INTERVAL) burst window, shared across all instances.
const RATE_LIMIT_WINDOW_MS = RATE_LIMIT_BUCKET_CAPACITY * RATE_LIMIT_REFILL_INTERVAL_MS;
const REQUEST_TIMEOUT_MS = 8_000;
// Soft TTL: results are served from cache without revalidation until this elapses.
const CACHE_TTL_MS = 5 * 60_000;
// Hard TTL: how long a stale entry may still be served (stale-while-revalidate
// and stale-if-error) before it is dropped entirely.
const CACHE_HARD_TTL_MS = 60 * 60_000;
const CACHE_MAX_ENTRIES = 500;
const REDIS_CACHE_PREFIX = 'search:';
const REDIS_RATELIMIT_PREFIX = 'ratelimit:';

// Tabs backed directly by a Brave Search endpoint. `shopping` reuses the web
// endpoint; `maps` is served by Nominatim instead (see geocodePlaces).
type BraveEndpointTab = 'web' | 'news' | 'videos' | 'images';

const BRAVE_ENDPOINTS: Record<BraveEndpointTab, string> = {
	web: 'https://api.search.brave.com/res/v1/web/search',
	news: 'https://api.search.brave.com/res/v1/news/search',
	videos: 'https://api.search.brave.com/res/v1/videos/search',
	images: 'https://api.search.brave.com/res/v1/images/search'
};

// Shopping has no dedicated Brave endpoint. We bias the query toward retail
// intent so Brave returns store/product pages instead of articles, then rank
// known shopping domains to the top so the tab feels like product search.
const SHOPPING_QUERY_HINT = 'buy price for sale';
const SHOPPING_DOMAINS = [
	'amazon.',
	'ebay.',
	'etsy.',
	'walmart.',
	'target.',
	'bestbuy.',
	'newegg.',
	'aliexpress.',
	'wayfair.',
	'homedepot.',
	'lowes.',
	'costco.',
	'ikea.',
	'shopify.',
	'shop.',
	'store.',
	'macys.',
	'nordstrom.',
	'overstock.',
	'rakuten.'
];

function shoppingRank(url: string): number {
	let host: string;
	try {
		host = new URL(url).hostname.toLowerCase();
	} catch {
		return 1;
	}
	return SHOPPING_DOMAINS.some((d) => host.includes(d)) ? 0 : 1;
}

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

const rateLimitBuckets = new Map<string, TokenBucketState>();

// A cache envelope tracks two horizons: `staleAt` (after which we revalidate in
// the background) and the hard expiry enforced by `expiresAt` / the Redis TTL.
type CacheEnvelope = { response: SearchResponse; staleAt: number; storedAt: number };
type LocalCacheEntry = { envelope: CacheEnvelope; expiresAt: number };
const searchCache = new Map<string, LocalCacheEntry>();

async function cacheGet(key: string): Promise<CacheEnvelope | null> {
	const redis = getRedis();
	if (redis) {
		const hit = await redis.get<CacheEnvelope>(`${REDIS_CACHE_PREFIX}${key}`);
		return hit ?? null;
	}

	const entry = searchCache.get(key);
	if (!entry) return null;
	if (entry.expiresAt <= Date.now()) {
		searchCache.delete(key);
		return null;
	}
	return entry.envelope;
}

async function cacheSet(key: string, envelope: CacheEnvelope): Promise<void> {
	const redis = getRedis();
	if (redis) {
		await redis.set(`${REDIS_CACHE_PREFIX}${key}`, envelope, { px: CACHE_HARD_TTL_MS });
		return;
	}

	// Hard size cap: evict the oldest entries first. Map preserves insertion order,
	// so the first key is the oldest.
	while (searchCache.size >= CACHE_MAX_ENTRIES) {
		const oldestKey = searchCache.keys().next().value;
		if (oldestKey === undefined) break;
		searchCache.delete(oldestKey);
	}
	searchCache.set(key, { envelope, expiresAt: envelope.storedAt + CACHE_HARD_TTL_MS });
}

/** Run a best-effort background task, tied to the platform's waitUntil when available. */
function scheduleBackground(
	task: () => Promise<unknown>,
	waitUntil?: (promise: Promise<unknown>) => void
): void {
	const settled = task().catch(() => {});
	if (waitUntil) waitUntil(settled);
}

function makeCacheKey(
	query: string,
	tab: SearchTab,
	safesearch: string,
	offset: number,
	freshness: string | undefined,
	country: string | undefined,
	filterAds: boolean,
	blockAds: boolean,
	blockTrackers: boolean,
	count: number
): string {
	return JSON.stringify({
		query,
		tab,
		safesearch,
		offset,
		freshness: freshness ?? '',
		country: country ?? '',
		filterAds,
		blockAds,
		blockTrackers,
		count
	});
}

const HTML_ENTITY_MAP: Record<string, string> = {
	amp: '&',
	apos: "'",
	gt: '>',
	lt: '<',
	nbsp: ' ',
	quot: '"'
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function readText(value: unknown): string {
	return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function decodeHtmlEntities(value: string): string {
	return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_match, entity: string) => {
		if (entity.startsWith('#x') || entity.startsWith('#X')) {
			const codePoint = Number.parseInt(entity.slice(2), 16);
			return Number.isNaN(codePoint) ? _match : String.fromCodePoint(codePoint);
		}
		if (entity.startsWith('#')) {
			const codePoint = Number.parseInt(entity.slice(1), 10);
			return Number.isNaN(codePoint) ? _match : String.fromCodePoint(codePoint);
		}
		return HTML_ENTITY_MAP[entity.toLowerCase()] ?? _match;
	});
}

function stripHtml(value: string): string {
	return decodeHtmlEntities(
		value
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
	);
}

function normalizeUrl(value: unknown): string | null {
	const candidate = decodeHtmlEntities(readText(value));
	if (!candidate) return null;
	try {
		const url = new URL(candidate);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
		return url.toString();
	} catch {
		return null;
	}
}

function getThumbnail(raw: Record<string, unknown>): string | undefined {
	return isRecord(raw.thumbnail) && typeof raw.thumbnail.src === 'string'
		? raw.thumbnail.src
		: undefined;
}

function getHostname(raw: Record<string, unknown>): string | undefined {
	return isRecord(raw.meta_url) && typeof raw.meta_url.hostname === 'string'
		? raw.meta_url.hostname || undefined
		: undefined;
}

function normalizeWebResult(raw: unknown): SearchResult | null {
	if (!isRecord(raw)) return null;
	const title = readText(raw.title);
	const url = normalizeUrl(raw.url);
	if (!title || !url) return null;

	const sitelinks: NonNullable<SearchResult['sitelinks']> = [];
	if (isRecord(raw.deep_results) && Array.isArray(raw.deep_results.buttons)) {
		for (const btn of raw.deep_results.buttons) {
			if (!isRecord(btn)) continue;
			const slTitle = readText(btn.title);
			const slUrl = normalizeUrl(btn.url);
			if (slTitle && slUrl) sitelinks.push({ title: slTitle, url: slUrl });
		}
	}

	return {
		title: stripHtml(title),
		url,
		snippet: stripHtml(readText(raw.description ?? raw.snippet ?? '')),
		siteName: isRecord(raw.profile) ? readText(raw.profile.name) || undefined : undefined,
		age: typeof raw.age === 'string' ? raw.age : undefined,
		thumbnail: getThumbnail(raw),
		sitelinks: sitelinks.length > 0 ? sitelinks : undefined
	};
}

function normalizeNewsResult(raw: unknown): NewsResult | null {
	if (!isRecord(raw)) return null;
	const title = readText(raw.title);
	const url = normalizeUrl(raw.url);
	if (!title || !url) return null;

	return {
		title: stripHtml(title),
		url,
		snippet: stripHtml(readText(raw.description ?? '')),
		siteName: getHostname(raw),
		age: typeof raw.age === 'string' ? raw.age : undefined,
		thumbnail: getThumbnail(raw)
	};
}

function normalizeVideoResult(raw: unknown): VideoResult | null {
	if (!isRecord(raw)) return null;
	const title = readText(raw.title);
	const url = normalizeUrl(raw.url);
	if (!title || !url) return null;

	const videoMeta = isRecord(raw.video) ? raw.video : null;

	return {
		title: stripHtml(title),
		url,
		description: stripHtml(readText(raw.description ?? '')),
		thumbnail: getThumbnail(raw),
		age: typeof raw.age === 'string' ? raw.age : undefined,
		duration: videoMeta && typeof videoMeta.duration === 'string' ? videoMeta.duration : undefined,
		views: videoMeta && typeof videoMeta.views === 'string' ? videoMeta.views : undefined,
		publisher: getHostname(raw)
	};
}

function normalizeImageResult(raw: unknown): ImageResult | null {
	if (!isRecord(raw)) return null;
	const title = readText(raw.title);
	const pageUrl = normalizeUrl(raw.url);
	if (!title || !pageUrl) return null;

	const imageUrl = isRecord(raw.properties) ? normalizeUrl(raw.properties.url) : null;
	const thumbnail =
		isRecord(raw.thumbnail) && typeof raw.thumbnail.src === 'string' ? raw.thumbnail.src : null;

	if (!imageUrl && !thumbnail) return null;

	return {
		title: stripHtml(title),
		url: pageUrl,
		imageUrl: imageUrl ?? thumbnail ?? '',
		thumbnail: thumbnail ?? imageUrl ?? '',
		source: getHostname(raw),
		width:
			isRecord(raw.properties) && typeof raw.properties.width === 'number'
				? raw.properties.width
				: undefined,
		height:
			isRecord(raw.properties) && typeof raw.properties.height === 'number'
				? raw.properties.height
				: undefined
	};
}

// Brave nests the infobox as `{ type: 'graph', results: [ {...} ] }`; pull the
// first result out before normalizing.
function unwrapInfobox(raw: unknown): unknown {
	if (isRecord(raw) && Array.isArray(raw.results)) return raw.results[0];
	return raw;
}

function getInfoboxImage(raw: Record<string, unknown>): string | undefined {
	// `images` is the entity gallery; prefer Brave's proxied `src`, fall back to original.
	// Skip entries Brave marks as logos — they're tiny favicons, not the hero photo.
	if (Array.isArray(raw.images)) {
		for (const img of raw.images) {
			if (!isRecord(img) || img.logo === true) continue;
			const src = typeof img.src === 'string' ? img.src : undefined;
			const original = typeof img.original === 'string' ? img.original : undefined;
			if (src || original) return src ?? original;
		}
	}
	// Older/other shapes expose a single thumbnail object.
	if (isRecord(raw.img) && typeof raw.img.src === 'string') return raw.img.src;
	return getThumbnail(raw);
}

function normalizeInfobox(raw: unknown): Infobox | null {
	if (!isRecord(raw)) return null;
	const title = readText(raw.title);
	if (!title) return null;

	let attributes: Array<[string, string]> | undefined;
	if (Array.isArray(raw.attributes)) {
		const parsed = (raw.attributes as unknown[])
			.filter((a): a is unknown[] => Array.isArray(a) && a.length >= 2)
			.map(([k, v]) => [stripHtml(readText(k)), stripHtml(readText(v))] as [string, string])
			.filter(([k, v]) => k && v);
		if (parsed.length > 0) attributes = parsed;
	}

	let profiles: Infobox['profiles'];
	if (Array.isArray(raw.profiles)) {
		const parsed = (raw.profiles as unknown[])
			.filter(isRecord)
			.map((p) => ({
				network: readText(p.name ?? p.network ?? ''),
				url: normalizeUrl(p.url) ?? '',
				// Brave gives the profile favicon as a plain string in `img`.
				imageUrl:
					typeof p.img === 'string'
						? p.img
						: isRecord(p.img) && typeof p.img.src === 'string'
							? p.img.src
							: undefined
			}))
			.filter((p) => p.network && p.url);
		if (parsed.length > 0) profiles = parsed;
	}

	// `description` is a short subtitle; `long_desc` is the full overview paragraph.
	const subtitle = typeof raw.description === 'string' ? stripHtml(readText(raw.description)) : '';
	const longDesc = typeof raw.long_desc === 'string' ? stripHtml(readText(raw.long_desc)) : '';

	return {
		title: stripHtml(title),
		subtitle: subtitle || undefined,
		description: longDesc || subtitle || undefined,
		url: typeof raw.url === 'string' ? (normalizeUrl(raw.url) ?? undefined) : undefined,
		imageUrl: getInfoboxImage(raw),
		attributes,
		profiles
	};
}

function normalizePlaceResult(raw: unknown): PlaceResult | null {
	if (!isRecord(raw)) return null;
	const lat = Number(raw.lat);
	const lon = Number(raw.lon);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

	const displayName = readText(raw.display_name);
	if (!displayName) return null;

	const boundingBox =
		Array.isArray(raw.boundingbox) && raw.boundingbox.length === 4
			? (raw.boundingbox.map((v) => readText(v)) as [string, string, string, string])
			: undefined;

	const osmId =
		typeof raw.osm_id === 'number'
			? raw.osm_id
			: typeof raw.osm_id === 'string' && raw.osm_id
				? Number(raw.osm_id)
				: undefined;

	return {
		name: readText(raw.name) || displayName.split(',')[0].trim(),
		displayName,
		lat,
		lon,
		category: typeof raw.category === 'string' ? raw.category : undefined,
		type: typeof raw.type === 'string' ? raw.type : undefined,
		boundingBox,
		osmType: typeof raw.osm_type === 'string' ? raw.osm_type : undefined,
		osmId: Number.isFinite(osmId) ? osmId : undefined
	};
}

/**
 * Geocode a free-text query into places via OpenStreetMap's Nominatim service.
 * Brave has no maps endpoint, so the Maps tab is served from here instead.
 */
async function geocodePlaces(query: string, fetchImpl: typeof fetch): Promise<SearchResponse> {
	const url = new URL(NOMINATIM_ENDPOINT);
	url.searchParams.set('q', query);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('limit', '10');
	url.searchParams.set('addressdetails', '0');

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetchImpl(url, {
			cache: 'no-store',
			credentials: 'omit',
			headers: {
				accept: 'application/json',
				// Nominatim's usage policy requires an identifying User-Agent.
				'user-agent': 'LibreSearch/1.0 (privacy-respecting metasearch)'
			},
			signal: controller.signal
		});

		if (!response.ok) throw new Error(`Nominatim responded with ${response.status}`);

		const payload: unknown = await response.json();
		const raw = Array.isArray(payload) ? payload : [];
		const placeResults = raw.map(normalizePlaceResult).filter((p): p is PlaceResult => p !== null);

		return { query, tab: 'maps', results: [], placeResults };
	} finally {
		clearTimeout(timeout);
	}
}

function pruneRateLimitBuckets(now: number): void {
	for (const [identifier, bucket] of rateLimitBuckets) {
		if (now - bucket.updatedAt > RATE_LIMIT_STATE_TTL_MS) {
			rateLimitBuckets.delete(identifier);
		}
	}
}

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/** Reset a client's rate-limit budget — used after they solve a challenge. */
export async function clearRateLimit(identifier: string): Promise<void> {
	const redis = getRedis();
	if (redis) {
		await redis.del(`${REDIS_RATELIMIT_PREFIX}${identifier}`);
		return;
	}
	rateLimitBuckets.delete(identifier);
}

export async function consumeRateLimit(identifier: string): Promise<RateLimitResult> {
	const redis = getRedis();
	if (redis) return consumeRateLimitRedis(redis, identifier);

	const now = Date.now();
	pruneRateLimitBuckets(now);
	const decision = consumeTokenBucket(
		rateLimitBuckets.get(identifier),
		{ capacity: RATE_LIMIT_BUCKET_CAPACITY, refillIntervalMs: RATE_LIMIT_REFILL_INTERVAL_MS },
		now
	);
	rateLimitBuckets.set(identifier, decision.state);
	return { allowed: decision.allowed, retryAfterSeconds: decision.retryAfterSeconds };
}

// Distributed fixed-window limiter: one INCR per request, with the window TTL set
// when the counter is first created. Shared across all serverless instances.
async function consumeRateLimitRedis(
	redis: NonNullable<ReturnType<typeof getRedis>>,
	identifier: string
): Promise<RateLimitResult> {
	const key = `${REDIS_RATELIMIT_PREFIX}${identifier}`;
	const count = await redis.incr(key);
	if (count === 1) await redis.pexpire(key, RATE_LIMIT_WINDOW_MS);

	if (count > RATE_LIMIT_BUCKET_CAPACITY) {
		const ttl = await redis.pttl(key);
		const retryAfterSeconds = Math.max(1, Math.ceil((ttl > 0 ? ttl : RATE_LIMIT_WINDOW_MS) / 1000));
		return { allowed: false, retryAfterSeconds };
	}

	return { allowed: true, retryAfterSeconds: 0 };
}

const AD_DOMAINS = new Set([
	'doubleclick.net',
	'googlesyndication.com',
	'googleadservices.com',
	'amazon-adsystem.com',
	'advertising.com',
	'adnxs.com',
	'adsrvr.org',
	'outbrain.com',
	'taboola.com',
	'revcontent.com',
	'media.net',
	'criteo.com',
	'rubiconproject.com',
	'pubmatic.com',
	'openx.net',
	'casalemedia.com',
	'moatads.com',
	'adroll.com',
	'sharethrough.com',
	'contextweb.com',
	'lijit.com',
	'yieldmo.com',
	'triplelift.com'
]);

const TRACKER_DOMAINS = new Set([
	'google-analytics.com',
	'analytics.google.com',
	'hotjar.com',
	'mixpanel.com',
	'segment.com',
	'heap.io',
	'fullstory.com',
	'clarity.ms',
	'scorecardresearch.com',
	'quantserve.com',
	'chartbeat.com',
	'mouseflow.com',
	'crazyegg.com',
	'kissmetrics.com',
	'optimizely.com',
	'newrelic.com',
	'datadog-browser-agent.com',
	'marketo.com',
	'pardot.com',
	'hubspot.com',
	'intercom.io'
]);

function isBlockedDomain(url: string, blocklist: Set<string>): boolean {
	try {
		const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
		return [...blocklist].some((d) => hostname === d || hostname.endsWith('.' + d));
	} catch {
		return false;
	}
}

// The full set of country codes Brave Search accepts for the `country` param.
const VALID_COUNTRIES = new Set([
	'AR',
	'AU',
	'AT',
	'BE',
	'BR',
	'CA',
	'CL',
	'DK',
	'FI',
	'FR',
	'DE',
	'HK',
	'IN',
	'ID',
	'IT',
	'JP',
	'KR',
	'MY',
	'MX',
	'NL',
	'NZ',
	'NO',
	'CN',
	'PL',
	'PT',
	'PH',
	'RU',
	'SA',
	'ZA',
	'ES',
	'SE',
	'CH',
	'TW',
	'TR',
	'GB',
	'US'
]);

function getBraveSearchUrl(
	query: string,
	tab: SearchTab,
	safesearch: 'strict' | 'moderate' | 'off',
	offset: number,
	freshness?: string,
	country?: string,
	count = 10
): URL {
	// Shopping has no dedicated Brave endpoint — it runs against web search, but
	// with a retail-intent hint appended so results lean toward stores/products.
	const endpointTab: BraveEndpointTab = tab === 'shopping' ? 'web' : (tab as BraveEndpointTab);
	const searchUrl = new URL(BRAVE_ENDPOINTS[endpointTab]);
	const effectiveQuery = tab === 'shopping' ? `${query} ${SHOPPING_QUERY_HINT}` : query;
	searchUrl.searchParams.set('q', effectiveQuery);
	// Brave caps `count` at 20 for web/news/videos, but up to 100 for images.
	const maxCount = endpointTab === 'images' ? 100 : 20;
	searchUrl.searchParams.set('count', String(Math.min(Math.max(count, 1), maxCount)));
	if (endpointTab === 'images') {
		// Brave's image endpoint only supports `off` / `strict`; map moderate → strict
		// so picking Moderate in the UI still gives some filtering on images.
		searchUrl.searchParams.set('safesearch', safesearch === 'off' ? 'off' : 'strict');
	} else {
		searchUrl.searchParams.set('safesearch', safesearch);
	}
	if (endpointTab === 'web') {
		searchUrl.searchParams.set('search_lang', 'en');
		const resolvedCountry =
			country && VALID_COUNTRIES.has(country.toUpperCase()) ? country.toUpperCase() : 'us';
		searchUrl.searchParams.set('country', resolvedCountry);
	}
	if (offset > 0) searchUrl.searchParams.set('offset', String(offset));
	if (freshness) searchUrl.searchParams.set('freshness', freshness);
	return searchUrl;
}

function getBraveApiKey(): string {
	const apiKey = env.BRAVE_SEARCH_API_KEY?.trim();
	if (!apiKey) throw new Error('BRAVE_SEARCH_API_KEY is not configured');
	return apiKey;
}

async function fetchBraveSearch(
	query: string,
	tab: SearchTab,
	safesearch: 'strict' | 'moderate' | 'off',
	offset: number,
	freshness: string | undefined,
	fetchImpl: typeof fetch,
	country?: string,
	filterAds?: boolean,
	blockAds?: boolean,
	blockTrackers?: boolean,
	count?: number
): Promise<SearchResponse> {
	// Maps is served by Nominatim, not Brave.
	if (tab === 'maps') return geocodePlaces(query, fetchImpl);

	const searchUrl = getBraveSearchUrl(query, tab, safesearch, offset, freshness, country, count);
	const apiKey = getBraveApiKey();
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetchImpl(searchUrl, {
			cache: 'no-store',
			credentials: 'omit',
			headers: {
				accept: 'application/json',
				'X-Subscription-Token': apiKey,
				'user-agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 LibreSearch/1.0'
			},
			signal: controller.signal
		});

		if (!response.ok) throw new Error(`Brave Search responded with ${response.status}`);

		const payload: unknown = await response.json();
		const queryValue =
			isRecord(payload) && isRecord(payload.query)
				? readText(payload.query.original ?? payload.query.alt ?? payload.query.q)
				: '';

		if (tab === 'shopping') {
			// Shopping runs against the web endpoint with a retail-biased query, then
			// promotes known shopping domains so the tab surfaces stores, not articles.
			const rawWeb =
				isRecord(payload) && isRecord(payload.web) && Array.isArray(payload.web.results)
					? payload.web.results
					: [];
			const results = rawWeb
				.filter((r) => !filterAds || !isRecord(r) || r['type'] !== 'ad')
				.filter(
					(r) => !blockAds || !isRecord(r) || !isBlockedDomain(String(r.url ?? ''), AD_DOMAINS)
				)
				.filter(
					(r) =>
						!blockTrackers || !isRecord(r) || !isBlockedDomain(String(r.url ?? ''), TRACKER_DOMAINS)
				)
				.map(normalizeWebResult)
				.filter((r): r is SearchResult => r !== null)
				// Stable sort: retail domains first, original order preserved within groups.
				.map((r, i) => ({ r, i }))
				.sort((a, b) => shoppingRank(a.r.url) - shoppingRank(b.r.url) || a.i - b.i)
				.map(({ r }) => r);

			// Echo the user's original query, not the retail-hinted one sent to Brave.
			return { query, tab: 'shopping', results };
		}

		if (tab === 'web') {
			const rawWeb =
				isRecord(payload) && isRecord(payload.web) && Array.isArray(payload.web.results)
					? payload.web.results
					: [];
			const results = rawWeb
				.filter((r) => !filterAds || !isRecord(r) || r['type'] !== 'ad')
				.filter(
					(r) => !blockAds || !isRecord(r) || !isBlockedDomain(String(r.url ?? ''), AD_DOMAINS)
				)
				.filter(
					(r) =>
						!blockTrackers || !isRecord(r) || !isBlockedDomain(String(r.url ?? ''), TRACKER_DOMAINS)
				)
				.map(normalizeWebResult)
				.filter((r): r is SearchResult => r !== null)
				.slice(0, count ?? 10);

			const rawNews =
				isRecord(payload) && isRecord(payload.news) && Array.isArray(payload.news.results)
					? payload.news.results
					: [];
			const newsResults = rawNews
				.map(normalizeNewsResult)
				.filter((r): r is NewsResult => r !== null)
				.slice(0, 4);

			const rawVideos =
				isRecord(payload) && isRecord(payload.videos) && Array.isArray(payload.videos.results)
					? payload.videos.results
					: [];
			const videoResults = rawVideos
				.map(normalizeVideoResult)
				.filter((r): r is VideoResult => r !== null)
				.slice(0, 3);

			const infobox = isRecord(payload)
				? (normalizeInfobox(unwrapInfobox(payload.infobox)) ?? undefined)
				: undefined;

			const resolvedQuery = queryValue || query;

			return {
				query: resolvedQuery,
				tab: 'web',
				results,
				newsResults: newsResults.length > 0 ? newsResults : undefined,
				videoResults: videoResults.length > 0 ? videoResults : undefined,
				infobox
			};
		}

		// news / videos / images: top-level results array
		const rawResults = isRecord(payload) && Array.isArray(payload.results) ? payload.results : [];

		if (tab === 'news') {
			return {
				query: queryValue || query,
				tab: 'news',
				results: [],
				newsResults: rawResults.map(normalizeNewsResult).filter((r): r is NewsResult => r !== null)
			};
		}

		if (tab === 'videos') {
			return {
				query: queryValue || query,
				tab: 'videos',
				results: [],
				videoResults: rawResults
					.map(normalizeVideoResult)
					.filter((r): r is VideoResult => r !== null)
			};
		}

		return {
			query: queryValue || query,
			tab: 'images',
			results: [],
			imageResults: rawResults.map(normalizeImageResult).filter((r): r is ImageResult => r !== null)
		};
	} finally {
		clearTimeout(timeout);
	}
}

export async function searchBrave(
	query: string,
	options: {
		safesearch?: 'strict' | 'moderate' | 'off';
		offset?: number;
		tab?: SearchTab;
		freshness?: string;
		country?: string;
		filterAds?: boolean;
		blockAds?: boolean;
		blockTrackers?: boolean;
		useCache?: boolean;
		useTor?: boolean;
		count?: number;
		waitUntil?: (promise: Promise<unknown>) => void;
	} = {},
	fetchImpl: typeof fetch = fetch
): Promise<SearchResponse> {
	const normalizedQuery = normalizeSearchQuery(query);
	if (!normalizedQuery) throw new Error(SEARCH_QUERY_ERROR);

	const tab = options.tab ?? 'web';
	const safesearch = options.safesearch ?? 'moderate';
	const offset = Math.max(0, options.offset ?? 0);
	const {
		freshness,
		country,
		filterAds = false,
		blockAds = false,
		blockTrackers = false
	} = options;
	const count = Math.min(Math.max(options.count ?? 10, 1), tab === 'images' ? 100 : 20);

	// When Tor is requested, swap in a SOCKS5-dispatched fetch. If no proxy is
	// configured the helper returns null and we fall back to the direct fetch, so
	// search keeps working (just not anonymised).
	const effectiveFetch = options.useTor ? (getTorFetch() ?? fetchImpl) : fetchImpl;

	const runFetch = () =>
		fetchBraveSearch(
			normalizedQuery,
			tab,
			safesearch,
			offset,
			freshness,
			effectiveFetch,
			country,
			filterAds,
			blockAds,
			blockTrackers,
			count
		);

	if (options.useCache) {
		const key = makeCacheKey(
			normalizedQuery,
			tab,
			safesearch,
			offset,
			freshness,
			country,
			filterAds,
			blockAds,
			blockTrackers,
			count
		);
		const cached = await cacheGet(key);

		if (cached) {
			// Fresh enough — serve directly.
			if (Date.now() < cached.staleAt) return cached.response;

			// Stale but usable: serve immediately and refresh in the background
			// (stale-while-revalidate). A failed refresh leaves the stale entry in
			// place until its hard TTL, which doubles as stale-if-error behaviour.
			scheduleBackground(async () => {
				const fresh = await runFetch();
				await cacheSet(key, {
					response: fresh,
					staleAt: Date.now() + CACHE_TTL_MS,
					storedAt: Date.now()
				});
			}, options.waitUntil);

			return cached.response;
		}

		// Cold cache: fetch synchronously and store before returning.
		const result = await runFetch();
		const storedAt = Date.now();
		await cacheSet(key, { response: result, staleAt: storedAt + CACHE_TTL_MS, storedAt });
		return result;
	}

	return await runFetch();
}
