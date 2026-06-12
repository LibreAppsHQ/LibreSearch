import { json, type RequestHandler } from '@sveltejs/kit';

import { normalizeSearchQuery } from '$lib/search';
import { consumeRateLimit, searchBrave } from '$lib/server/search';
import { getClientKey, isVerified } from '$lib/server/security';
import {
	getCachedAnswer,
	isAiAnswerEnabled,
	setCachedAnswer,
	summarizeResults,
	type AnswerResult
} from '$lib/server/ai';

const NO_STORE = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const EMPTY: AnswerResult = { answer: null, sources: [] };

export const GET: RequestHandler = async (event) => {
	// Feature is off unless a Groq key is configured — return an empty answer so
	// the client simply renders nothing.
	if (!isAiAnswerEnabled()) {
		return json(EMPTY, { headers: NO_STORE });
	}

	const query = normalizeSearchQuery(event.url.searchParams.get('q') ?? '');
	if (!query) return json(EMPTY, { headers: NO_STORE });

	// Serve a previously generated answer without spending a model call or any
	// rate-limit budget — identical queries are common and answers are stable.
	const cached = await getCachedAnswer(query);
	if (cached) return json(cached, { headers: NO_STORE });

	const ip = getClientKey(event);

	// Verified humans bypass the limit; everyone else shares the search budget.
	if (!(await isVerified(ip))) {
		const rateLimit = await consumeRateLimit(ip);
		if (!rateLimit.allowed) {
			return json(EMPTY, {
				headers: { ...NO_STORE, 'Retry-After': String(rateLimit.retryAfterSeconds) },
				status: 429
			});
		}
	}

	try {
		// Reuse the cached web results so this rarely costs an extra Brave call.
		const results = await searchBrave(
			query,
			{ tab: 'web', useCache: true, waitUntil: event.platform?.context?.waitUntil },
			event.fetch
		);
		const top = results.results.slice(0, 5);
		const sources = top.map((r) => ({ title: r.title, snippet: r.snippet, url: r.url }));
		const answer = await summarizeResults(query, sources, event.fetch);
		const result: AnswerResult = {
			answer,
			// Only surface citations when we actually produced an answer to cite.
			sources: answer ? top.map((r) => ({ title: r.title, url: r.url })) : []
		};
		if (answer) await setCachedAnswer(query, result);
		return json(result, { headers: NO_STORE });
	} catch {
		return json(EMPTY, { headers: NO_STORE });
	}
};
