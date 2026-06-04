import { redirect, type RequestHandler } from '@sveltejs/kit';
import {
	SESSION_COOKIE,
	clearSessionCookie,
	createSessionClient
} from '$lib/server/appwrite';

// POST /logout — delete the Appwrite session and clear the cookie.
export const POST: RequestHandler = async ({ cookies }) => {
	const secret = cookies.get(SESSION_COOKIE);
	if (secret) {
		try {
			const { account } = createSessionClient(secret);
			await account.deleteSession('current');
		} catch {
			// Session already gone server-side — clearing the cookie is enough.
		}
	}
	clearSessionCookie(cookies);
	redirect(303, '/');
};
