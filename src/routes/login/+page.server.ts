import { fail, redirect, type Actions } from '@sveltejs/kit';
import { appwriteConfigured, createAdminClient, setSessionCookie } from '$lib/server/appwrite';
import { ensureProfile } from '$lib/server/plan';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/account');
	return { configured: appwriteConfigured() };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		if (!appwriteConfigured()) {
			return fail(503, { error: 'Accounts are not configured yet.' });
		}

		const data = await request.formData();
		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(data.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.', email });
		}

		const { account } = createAdminClient();
		try {
			const session = await account.createEmailPasswordSession(email, password);
			setSessionCookie(cookies, session.secret, session.expire);
			await ensureProfile(session.userId);
		} catch {
			// Don't leak whether the email exists.
			return fail(400, { error: 'Invalid email or password.', email });
		}

		redirect(303, '/account');
	}
};
