import { env } from '$env/dynamic/private';

import { getRedis } from './kv';

/**
 * Optional AI answer generation via Groq's OpenAI-compatible chat API.
 *
 * Privacy note: when enabled, the user's query and the top result snippets are
 * sent to Groq to synthesise a short answer. The feature is therefore OFF unless
 * `GROQ_API_KEY` is configured, and it logs nothing. Callers fall back to showing
 * no answer when this returns null.
 */
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = env.GROQ_MODEL?.trim() || 'meta-llama/llama-4-scout-17b-16e-instruct';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_SOURCES = 5;

// Cache generated answers so repeated queries don't re-bill the model. Backed by
// Redis when configured; otherwise a small per-instance LRU map.
const ANSWER_CACHE_TTL_MS = 60 * 60_000;
const ANSWER_CACHE_MAX_ENTRIES = 500;
const REDIS_ANSWER_PREFIX = 'answer:';

export type AnswerSource = { title: string; snippet: string; url: string };
/** A citation shown beneath the answer so users can verify it. */
export type AnswerCitation = { title: string; url: string };
export type AnswerResult = { answer: string | null; sources: AnswerCitation[] };

type LocalAnswerEntry = { result: AnswerResult; expiresAt: number };
const answerCache = new Map<string, LocalAnswerEntry>();

/** Whether AI answers are configured (an API key is present). */
export function isAiAnswerEnabled(): boolean {
	return Boolean(env.GROQ_API_KEY?.trim());
}

/** Read a cached answer for `query`, or null on a miss. */
export async function getCachedAnswer(query: string): Promise<AnswerResult | null> {
	const redis = getRedis();
	if (redis) {
		const hit = await redis.get<AnswerResult>(`${REDIS_ANSWER_PREFIX}${query}`);
		return hit ?? null;
	}

	const entry = answerCache.get(query);
	if (!entry) return null;
	if (entry.expiresAt <= Date.now()) {
		answerCache.delete(query);
		return null;
	}
	return entry.result;
}

/** Persist a generated answer for `query`. */
export async function setCachedAnswer(query: string, result: AnswerResult): Promise<void> {
	const redis = getRedis();
	if (redis) {
		await redis.set(`${REDIS_ANSWER_PREFIX}${query}`, result, { px: ANSWER_CACHE_TTL_MS });
		return;
	}

	// Insertion-ordered map: drop the oldest entries once the cap is reached.
	while (answerCache.size >= ANSWER_CACHE_MAX_ENTRIES) {
		const oldestKey = answerCache.keys().next().value;
		if (oldestKey === undefined) break;
		answerCache.delete(oldestKey);
	}
	answerCache.set(query, { result, expiresAt: Date.now() + ANSWER_CACHE_TTL_MS });
}

/**
 * Summarise the supplied search snippets into a short, direct answer.
 * Returns null when disabled, when there is nothing to summarise, or on any error.
 */
export async function summarizeResults(
	query: string,
	sources: AnswerSource[],
	fetchImpl: typeof fetch = fetch
): Promise<string | null> {
	const apiKey = env.GROQ_API_KEY?.trim();
	if (!apiKey || sources.length === 0) return null;

	const context = sources
		.slice(0, MAX_SOURCES)
		.map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}`)
		.join('\n\n');

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetchImpl(GROQ_ENDPOINT, {
			method: 'POST',
			cache: 'no-store',
			signal: controller.signal,
			headers: {
				authorization: `Bearer ${apiKey}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				model: GROQ_MODEL,
				temperature: 0.2,
				max_tokens: 350,
				messages: [
					{
						role: 'system',
						content:
							'You are a concise search assistant. Using ONLY the numbered search snippets ' +
							'provided, write a direct answer of 2-4 sentences to the user query. If the ' +
							'snippets lack enough information, say so briefly. Never invent facts, URLs, or ' +
							'citations, and do not mention the snippets themselves.'
					},
					{ role: 'user', content: `Query: ${query}\n\nSnippets:\n${context}` }
				]
			})
		});

		if (!response.ok) return null;

		const payload = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};
		const text = payload.choices?.[0]?.message?.content?.trim();
		return text || null;
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}
