import type { RequestEvent } from '@sveltejs/kit';

// Tracks which clients have tripped abuse signals (rate limit / honeypot) and
// must solve an ALTCHA challenge before searching again — and who has recently
// passed one. In-memory, keyed by client IP, mirroring the rate limiter.

const FLAG_WINDOW_MS = 5 * 60_000; // how long a flagged client must verify for
const VERIFY_WINDOW_MS = 15 * 60_000; // how long a solved challenge stays valid
const STATE_TTL_MS = 30 * 60_000;

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

/** Derive a stable client key (IP) from the request. */
export function getClientKey(event: RequestEvent): string {
	return (
		event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		event.getClientAddress() ||
		'unknown'
	);
}

/** Mark a client as suspicious — future searches require a solved challenge. */
export function flagSuspicious(ip: string): void {
	const now = Date.now();
	prune(now);
	const entry = get(ip);
	entry.flaggedUntil = now + FLAG_WINDOW_MS;
	entry.updatedAt = now;
	clients.set(ip, entry);
}

/** Record a successfully solved challenge, granting a verified window. */
export function markVerified(ip: string): void {
	const now = Date.now();
	const entry = get(ip);
	entry.verifiedUntil = now + VERIFY_WINDOW_MS;
	entry.flaggedUntil = 0;
	entry.updatedAt = now;
	clients.set(ip, entry);
}

export function isVerified(ip: string): boolean {
	return Date.now() < get(ip).verifiedUntil;
}

/** True when the client is flagged and hasn't verified — show the challenge. */
export function challengeRequired(ip: string): boolean {
	const now = Date.now();
	const entry = get(ip);
	return entry.flaggedUntil > now && now >= entry.verifiedUntil;
}
