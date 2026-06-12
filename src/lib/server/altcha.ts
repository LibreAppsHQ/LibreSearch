import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { getRedis } from './kv';

// Self-hosted, privacy-friendly proof-of-work challenge (ALTCHA-compatible scheme).
// No third-party service is contacted — challenges are signed with a server secret.

const ALGORITHM = 'SHA-256';
const DEFAULT_MAX_NUMBER = 50_000;
const CHALLENGE_TTL_MS = 5 * 60_000;

function getSecret(): string {
	const secret = env.ALTCHA_SECRET?.trim();
	if (secret) return secret;
	// Never silently fall back to a known secret in production — that would make
	// every challenge forgeable. Only allow the dev placeholder locally.
	if (!dev)
		throw new Error('ALTCHA_SECRET is not set — refusing to sign challenges in production.');
	return 'dev-insecure-altcha-secret-change-me';
}

function sha256Hex(input: string): string {
	return crypto.createHash('sha256').update(input).digest('hex');
}

function hmacHex(input: string): string {
	return crypto.createHmac('sha256', getSecret()).update(input).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	try {
		return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
	} catch {
		return false;
	}
}

export interface Challenge {
	algorithm: string;
	challenge: string;
	salt: string;
	signature: string;
	maxnumber: number;
}

export function createChallenge(maxnumber = DEFAULT_MAX_NUMBER): Challenge {
	const expires = Date.now() + CHALLENGE_TTL_MS;
	// The expiry is embedded in the salt so it's covered by the signature.
	const salt = `${crypto.randomBytes(12).toString('hex')}.${expires}`;
	const secretNumber = crypto.randomInt(0, maxnumber + 1);
	const challenge = sha256Hex(salt + secretNumber);
	const signature = hmacHex(challenge);
	return { algorithm: ALGORITHM, challenge, salt, signature, maxnumber };
}

// Prevent a solved challenge from being replayed. Redis-backed when configured
// (required on serverless, where each instance has its own memory); in-memory
// Map otherwise for local dev.
const REDIS_USED_PREFIX = 'altcha-used:';
const usedSignatures = new Map<string, number>();
function pruneUsed(now: number): void {
	for (const [sig, expiresAt] of usedSignatures) {
		if (expiresAt <= now) usedSignatures.delete(sig);
	}
}

/**
 * Atomically mark a signature as used. Returns false if it was already used
 * (i.e. this is a replay).
 */
async function claimSignature(signature: string, expiresAt: number): Promise<boolean> {
	const now = Date.now();
	const redis = getRedis();
	if (redis) {
		// NX = only set if absent → atomic first-use claim across instances.
		const result = await redis.set(`${REDIS_USED_PREFIX}${signature}`, 1, {
			nx: true,
			px: Math.max(expiresAt - now, 1000)
		});
		return result === 'OK';
	}
	pruneUsed(now);
	if (usedSignatures.has(signature)) return false;
	usedSignatures.set(signature, expiresAt);
	return true;
}

/** Verify a base64-encoded ALTCHA solution payload. */
export async function verifySolution(payloadB64: string): Promise<boolean> {
	try {
		const decoded = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8')) as {
			algorithm?: string;
			challenge?: string;
			number?: number;
			salt?: string;
			signature?: string;
		};

		if (!decoded.salt || !decoded.challenge || !decoded.signature) return false;
		if (typeof decoded.number !== 'number' || !Number.isFinite(decoded.number)) return false;
		if (decoded.algorithm && decoded.algorithm !== ALGORITHM) return false;

		const expires = Number(decoded.salt.split('.')[1]);
		const now = Date.now();
		if (!Number.isFinite(expires) || now > expires) return false;

		const challenge = sha256Hex(decoded.salt + decoded.number);
		if (!safeEqualHex(challenge, decoded.challenge)) return false;

		const signature = hmacHex(challenge);
		if (!safeEqualHex(signature, decoded.signature)) return false;

		return await claimSignature(decoded.signature, expires);
	} catch {
		return false;
	}
}
