import { json, type RequestHandler } from '@sveltejs/kit';
import { verifySolution } from '$lib/server/altcha';
import { markVerified, getClientKey } from '$lib/server/security';
import { clearRateLimit } from '$lib/server/search';

export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => null)) as { payload?: string } | null;
	const payload = body?.payload;

	if (!payload || typeof payload !== 'string' || !(await verifySolution(payload))) {
		return json({ ok: false }, { headers: { 'Cache-Control': 'no-store' }, status: 400 });
	}

	const ip = getClientKey(event);
	await markVerified(ip);
	clearRateLimit(ip);

	return json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
};
