import { json, type RequestHandler } from '@sveltejs/kit';
import { verifyTurnstile } from '$lib/server/turnstile';
import { markVerified, getClientKey } from '$lib/server/security';
import { clearRateLimit } from '$lib/server/search';

export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => null)) as { token?: string } | null;
	const token = body?.token;

	if (!token || typeof token !== 'string' || !(await verifyTurnstile(token))) {
		return json({ ok: false }, { headers: { 'Cache-Control': 'no-store' }, status: 400 });
	}

	const ip = getClientKey(event);
	await markVerified(ip);
	clearRateLimit(ip);

	return json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
};
