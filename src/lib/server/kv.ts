import { env } from '$env/dynamic/private';
import { Redis } from '@upstash/redis';

/**
 * A shared Redis client used for cross-instance rate limiting and search caching.
 *
 * On serverless platforms (Vercel) each request can land on a fresh instance, so
 * in-process Maps make rate limiting ineffective and caching nearly useless. When
 * Upstash / Vercel KV credentials are present we back both with Redis instead.
 *
 * Credentials are optional: with none configured `getRedis()` returns null and
 * callers transparently fall back to their in-memory implementations, so local
 * development and unconfigured deploys keep working unchanged.
 */
let cachedClient: Redis | null | undefined;

export function getRedis(): Redis | null {
	if (cachedClient !== undefined) return cachedClient;

	// Accept both Upstash's native variable names and Vercel KV's aliases.
	const url = env.UPSTASH_REDIS_REST_URL?.trim() || env.KV_REST_API_URL?.trim();
	const token = env.UPSTASH_REDIS_REST_TOKEN?.trim() || env.KV_REST_API_TOKEN?.trim();

	cachedClient = url && token ? new Redis({ url, token }) : null;
	return cachedClient;
}
