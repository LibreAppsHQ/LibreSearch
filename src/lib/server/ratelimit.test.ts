import { describe, it, expect } from 'vitest';

import { consumeTokenBucket, type TokenBucketState } from './ratelimit';

const OPTIONS = { capacity: 3, refillIntervalMs: 1000 };

describe('consumeTokenBucket', () => {
	it('starts full and allows the first request', () => {
		const decision = consumeTokenBucket(undefined, OPTIONS, 0);
		expect(decision.allowed).toBe(true);
		expect(decision.state.tokens).toBe(OPTIONS.capacity - 1);
	});

	it('blocks once the bucket is drained', () => {
		let state: TokenBucketState | undefined;
		for (let i = 0; i < OPTIONS.capacity; i++) {
			const decision = consumeTokenBucket(state, OPTIONS, 0);
			expect(decision.allowed).toBe(true);
			state = decision.state;
		}

		const blocked = consumeTokenBucket(state, OPTIONS, 0);
		expect(blocked.allowed).toBe(false);
		expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
	});

	it('refills one token per interval, capped at capacity', () => {
		const drained: TokenBucketState = { tokens: 0, lastRefillAt: 0, updatedAt: 0 };

		// One interval later, exactly one token is available again.
		const afterOne = consumeTokenBucket(drained, OPTIONS, OPTIONS.refillIntervalMs);
		expect(afterOne.allowed).toBe(true);

		// A long idle period never exceeds capacity.
		const afterLongIdle = consumeTokenBucket(
			afterOne.state,
			OPTIONS,
			OPTIONS.refillIntervalMs * 100
		);
		expect(afterLongIdle.allowed).toBe(true);
		expect(afterLongIdle.state.tokens).toBeLessThanOrEqual(OPTIONS.capacity);
	});
});
