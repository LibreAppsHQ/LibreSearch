import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ID } from 'node-appwrite';
import { appwriteConfigured, createAdminClient, setSessionCookie } from '$lib/server/appwrite';
import { ensureProfile } from '$lib/server/plan';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Already signed in → no reason to be here.
	if (locals.user) redirect(303, '/account');
	return { configured: appwriteConfigured() };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		if (!appwriteConfigured()) {
			return fail(503, { error: 'Accounts are not configured yet.' });
		}

		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(data.get('password') ?? '');

		// Validate at the boundary.
		if (!name || !email || !password) {
			return fail(400, { error: 'All fields are required.', name, email });
		}
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return fail(400, { error: 'Enter a valid email address.', name, email });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.', name, email });
		}

		const { account } = createAdminClient();
		try {
			const user = await account.create(ID.unique(), email, password, name);
			const session = await account.createEmailPasswordSession(email, password);
			setSessionCookie(cookies, session.secret, session.expire);
			await ensureProfile(user.$id);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Could not create account.';
			// Appwrite returns 409 when the email already exists.
			const friendly = /already exists|409/i.test(msg)
				? 'An account with that email already exists.'
				: 'Could not create account. Please try again.';
			return fail(400, { error: friendly, name, email });
		}

		redirect(303, '/account');
	}
};
