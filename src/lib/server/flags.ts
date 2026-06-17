import { getRedis } from './kv';
import { createLogger } from './logger';

const log = createLogger('flags');

const FLAG_PREFIX = 'flag:';
const FLAG_CACHE_TTL_MS = 30_000;
const FLAG_CACHE_MAX = 50;

type FlagRecord = { enabled: boolean; percentage?: number; updatedAt: number };

const localCache = new Map<string, FlagRecord>();

function flagEnabledByPercentage(percentage: number): boolean {
	if (percentage >= 100) return true;
	if (percentage <= 0) return false;
	return Math.random() * 100 < percentage;
}

async function readFlag(name: string): Promise<FlagRecord | null> {
	const redis = getRedis();
	if (redis) {
		const raw = await redis.get<FlagRecord>(`${FLAG_PREFIX}${name}`);
		return raw ?? null;
	}
	return localCache.get(name) ?? null;
}

async function writeFlag(name: string, record: FlagRecord): Promise<void> {
	const redis = getRedis();
	if (redis) {
		await redis.set(`${FLAG_PREFIX}${name}`, record, { px: FLAG_CACHE_TTL_MS });
		return;
	}
	while (localCache.size >= FLAG_CACHE_MAX) {
		const oldest = localCache.keys().next().value;
		if (oldest === undefined) break;
		localCache.delete(oldest);
	}
	localCache.set(name, record);
}

export async function setFlag(name: string, enabled: boolean, percentage?: number): Promise<void> {
	const record: FlagRecord = { enabled, percentage, updatedAt: Date.now() };
	await writeFlag(name, record);
	log.info({ flag: name, enabled, percentage }, 'flag updated');
}

export async function isEnabled(name: string, forceCheck = false): Promise<boolean> {
	if (!forceCheck) {
		const cached = localCache.get(name);
		if (cached && Date.now() - cached.updatedAt < FLAG_CACHE_TTL_MS) {
			return resolveFlag(cached);
		}
	}

	const record = await readFlag(name);
	if (!record) return false;

	localCache.set(name, record);
	return resolveFlag(record);
}

function resolveFlag(record: FlagRecord): boolean {
	if (!record.enabled) return false;
	if (record.percentage != null) return flagEnabledByPercentage(record.percentage);
	return true;
}

export async function isAiAnswerEnabled(): Promise<boolean> {
	return isEnabled('ai-answer');
}

export async function isProFeatureEnabled(feature: string): Promise<boolean> {
	return isEnabled(`pro:${feature}`);
}

export type FlagName =
	| 'ai-answer'
	| 'ai-answer-shopping'
	| 'eco-mode-default'
	| 'compact-results-default'
	| 'search-suggestions-v2'
	| `pro:${string}`;
