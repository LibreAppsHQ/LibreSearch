import { redirect, type RequestHandler } from '@sveltejs/kit';
import { OAuthProvider } from 'node-appwrite';
import { appwriteConfigured, createAdminClient } from '$lib/server/appwrite';

// GET /auth/github — kick off the GitHub OAuth flow. Appwrite returns a URL we
// bounce the user to; on completion GitHub → Appwrite → /auth/callback.
export const GET: RequestHandler = async ({ url }) => {
	if (!appwriteConfigured()) redirect(303, '/login?error=oauth');

	const { account } = createAdminClient();
	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Github,
		`${url.origin}/auth/callback`,
		`${url.origin}/login?error=oauth`
	);
	redirect(302, redirectUrl);
};
