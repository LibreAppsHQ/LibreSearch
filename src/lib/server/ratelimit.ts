/**
 * Pure token-bucket math, kept free of any framework or environment imports so
 * it is trivially unit-testable. Used as the in-memory rate-limit fallback when
 * no shared Redis store is configured (see `kv.ts`).
 */

export type TokenBucketState = {
	tokens: number;
	lastRefillAt: number;
	updatedAt: number;
};

export type TokenBucketOptions = {
	capacity: number;
	refillIntervalMs: number;
};

export type RateLimitDecision = {
	allowed: boolean;
	retryAfterSeconds: number;
	state: TokenBucketState;
};

/**
 * Compute the next bucket state for a single request at time `now`.
 *
 * Tokens refill at one per `refillIntervalMs` up to `capacity`. Returns whether
 * the request is allowed, how long to wait before retrying when it is not, and
 * the new state the caller should persist.
 */
export function consumeTokenBucket(
	previous: TokenBucketState | undefined,
	options: TokenBucketOptions,
	now: number
): RateLimitDecision {
	const start = previous ?? { tokens: options.capacity, lastRefillAt: now, updatedAt: now };

	let tokens = start.tokens;
	let lastRefillAt = start.lastRefillAt;

	const refill = Math.floor((now - lastRefillAt) / options.refillIntervalMs);
	if (refill > 0) {
		tokens = Math.min(options.capacity, tokens + refill);
		lastRefillAt += refill * options.refillIntervalMs;
	}

	if (tokens <= 0) {
		const retryAfterSeconds = Math.max(
			1,
			Math.ceil((options.refillIntervalMs - (now - lastRefillAt)) / 1000)
		);
		return { allowed: false, retryAfterSeconds, state: { tokens, lastRefillAt, updatedAt: now } };
	}

	return {
		allowed: true,
		retryAfterSeconds: 0,
		state: { tokens: tokens - 1, lastRefillAt, updatedAt: now }
	};
}
