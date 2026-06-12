import type { RequestEvent } from '@sveltejs/kit';
import { getRedis } from './kv';

// Tracks which clients have tripped abuse signals (rate limit / honeypot) and
// must solve an ALTCHA challenge before searching again — and who has recently
// passed one. Keyed by client IP, mirroring the rate limiter. Backed by Redis
// when configured (required for correctness on serverless, where each request
// can land on a fresh instance); otherwise an in-memory Map for local dev.

const FLAG_WINDOW_MS = 5 * 60_000; // how long a flagged client must verify for
const VERIFY_WINDOW_MS = 15 * 60_000; // how long a solved challenge stays valid
const STATE_TTL_MS = 30 * 60_000;
const REDIS_PREFIX = 'abuse:';

type Entry = { flaggedUntil: number; verifiedUntil: number; updatedAt: number };

const clients = new Map<string, Entry>();

function prune(now: number): void {
	for (const [ip, entry] of clients) {
		if (now - entry.updatedAt > STATE_TTL_MS) clients.delete(ip);
	}
}

function get(ip: string): Entry {
	return clients.get(ip) ?? { flaggedUntil: 0, verifiedUntil: 0, updatedAt: 0 };
}

async function loadEntry(ip: string): Promise<Entry> {
	const redis = getRedis();
	if (redis) {
		const hit = await redis.get<Entry>(`${REDIS_PREFIX}${ip}`);
		return hit ?? { flaggedUntil: 0, verifiedUntil: 0, updatedAt: 0 };
	}
	return get(ip);
}

async function storeEntry(ip: string, entry: Entry): Promise<void> {
	const redis = getRedis();
	if (redis) {
		await redis.set(`${REDIS_PREFIX}${ip}`, entry, { px: STATE_TTL_MS });
		return;
	}
	clients.set(ip, entry);
}

/**
 * Derive a stable client key (IP) from the request.
 *
 * Only proxy-set headers are trusted. Raw `x-forwarded-for` is client-spoofable
 * (an attacker can rotate fake IPs to bypass rate limiting and challenge flags),
 * so it is deliberately NOT consulted here. On Vercel, `x-vercel-forwarded-for`
 * is overwritten by the platform; `getClientAddress()` is the adapter's trusted
 * resolution everywhere else.
 */
export function getClientKey(event: RequestEvent): string {
	// Only trust the Vercel header when actually running on Vercel — anywhere
	// else it is client-spoofable. Self-hosted deploys behind a reverse proxy
	// should set adapter-node's ADDRESS_HEADER/XFF_DEPTH env vars instead, which
	// feed getClientAddress() below.
	if (process.env.VERCEL) {
		const vercelIp = event.request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
		if (vercelIp) return vercelIp;
	}
	try {
		return event.getClientAddress() || 'unknown';
	} catch {
		return 'unknown';
	}
}

/** Mark a client as suspicious — future searches require a solved challenge. */
export async function flagSuspicious(ip: string): Promise<void> {
	const now = Date.now();
	prune(now);
	const entry = await loadEntry(ip);
	entry.flaggedUntil = now + FLAG_WINDOW_MS;
	entry.updatedAt = now;
	await storeEntry(ip, entry);
}

/** Record a successfully solved challenge, granting a verified window. */
export async function markVerified(ip: string): Promise<void> {
	const now = Date.now();
	const entry = await loadEntry(ip);
	entry.verifiedUntil = now + VERIFY_WINDOW_MS;
	entry.flaggedUntil = 0;
	entry.updatedAt = now;
	await storeEntry(ip, entry);
}

export async function isVerified(ip: string): Promise<boolean> {
	return Date.now() < (await loadEntry(ip)).verifiedUntil;
}

/** True when the client is flagged and hasn't verified — show the challenge. */
export async function challengeRequired(ip: string): Promise<boolean> {
	const now = Date.now();
	const entry = await loadEntry(ip);
	return entry.flaggedUntil > now && now >= entry.verifiedUntil;
}
