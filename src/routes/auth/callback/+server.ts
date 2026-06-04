import { redirect, type RequestHandler } from '@sveltejs/kit';
import { createAdminClient, setSessionCookie } from '$lib/server/appwrite';
import { ensureProfile } from '$lib/server/plan';

// GET /auth/callback?userId=&secret= — Appwrite redirects here after OAuth.
// Exchange the one-time token for a real session and store it.
export const GET: RequestHandler = async ({ url, cookies }) => {
	const userId = url.searchParams.get('userId');
	const secret = url.searchParams.get('secret');
	if (!userId || !secret) redirect(303, '/login?error=oauth');

	try {
		const { account } = createAdminClient();
		const session = await account.createSession(userId, secret);
		setSessionCookie(cookies, session.secret, session.expire);
		await ensureProfile(userId);
	} catch {
		redirect(303, '/login?error=oauth');
	}

	redirect(303, '/account');
};
