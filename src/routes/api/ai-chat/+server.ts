import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isAiAnswerEnabled } from '$lib/server/ai';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = env.GROQ_MODEL?.trim() || 'meta-llama/llama-4-scout-17b-16e-instruct';
const REQUEST_TIMEOUT_MS = 30_000;

export const POST: RequestHandler = async ({ request, fetch }) => {
	if (!isAiAnswerEnabled()) {
		return json({ error: 'AI chat is not enabled' }, { status: 503 });
	}

	const apiKey = env.GROQ_API_KEY?.trim();
	if (!apiKey) {
		return json({ error: 'AI service not configured' }, { status: 503 });
	}

	let body: { messages?: Array<{ role: string; content: string }> };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const messages = body.messages?.filter(
		(m): m is { role: 'user' | 'assistant' | 'system'; content: string } =>
			typeof m === 'object' &&
			m !== null &&
			typeof m.content === 'string' &&
			['user', 'assistant', 'system'].includes(m.role)
	);

	if (!messages || messages.length === 0) {
		return json({ error: 'No messages provided' }, { status: 400 });
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(GROQ_ENDPOINT, {
			method: 'POST',
			cache: 'no-store',
			signal: controller.signal,
			headers: {
				authorization: `Bearer ${apiKey}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				model: GROQ_MODEL,
				temperature: 0.7,
				max_tokens: 2048,
				messages: [
					{
						role: 'system',
						content:
							'You are a helpful AI assistant. Answer the user\'s questions concisely and accurately. ' +
							'When providing information, cite sources if they were provided in the context. ' +
							'If you\'re unsure about something, say so rather than making up information.'
					},
					...messages
				]
			})
		});

		if (!response.ok) {
			const error = await response.text().catch(() => 'Unknown error');
			return json({ error: `AI service error: ${error}` }, { status: 502 });
		}

		const data = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};

		const answer = data.choices?.[0]?.message?.content?.trim();

		if (!answer) {
			return json({ error: 'Empty response from AI' }, { status: 502 });
		}

		return json({ answer, sources: [] });
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') {
			return json({ error: 'Request timed out' }, { status: 504 });
		}
		return json({ error: 'Failed to process request' }, { status: 500 });
	} finally {
		clearTimeout(timeout);
	}
};
