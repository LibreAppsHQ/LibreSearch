import { Client, Account, Databases } from 'node-appwrite';
import { env } from '$env/dynamic/private';
import { env as pub } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';

// Server-side Appwrite access.
//
// Auth is fully server-side (SSR): the browser never sees the Appwrite session
// secret or the admin API key. We hold the session secret in an httpOnly cookie
// and hand it to node-appwrite's `.setSession()` per request.
//
//  - createAdminClient()   → privileged, uses APPWRITE_API_KEY (signup, profile writes)
//  - createSessionClient() → acts AS the logged-in user, scoped by their session
//  - getUser(event)        → resolve the current user from the session cookie, or null

export const SESSION_COOKIE = 'ls_session';

const endpoint = pub.PUBLIC_APPWRITE_ENDPOINT ?? '';
const project = pub.PUBLIC_APPWRITE_PROJECT_ID ?? '';

/** True when the Appwrite env vars are present. Lets auth degrade gracefully. */
export function appwriteConfigured(): boolean {
	return Boolean(endpoint && project && env.APPWRITE_API_KEY);
}

function baseClient(): Client {
	return new Client().setEndpoint(endpoint).setProject(project);
}

/** Privileged client — server-only, uses the admin API key. */
export function createAdminClient() {
	const client = baseClient().setKey(env.APPWRITE_API_KEY ?? '');
	return {
		client,
		get account() {
			return new Account(client);
		},
		get databases() {
			return new Databases(client);
		}
	};
}

/** Client scoped to a single user's session secret. */
export function createSessionClient(secret: string) {
	const client = baseClient().setSession(secret);
	return {
		client,
		get account() {
			return new Account(client);
		},
		get databases() {
			return new Databases(client);
		}
	};
}

/** Persist an Appwrite session secret in an httpOnly cookie. */
export function setSessionCookie(
	cookies: RequestEvent['cookies'],
	secret: string,
	expire: string
): void {
	cookies.set(SESSION_COOKIE, secret, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: new Date(expire)
	});
}

/** Remove the session cookie (logout). */
export function clearSessionCookie(cookies: RequestEvent['cookies']): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export type SessionUser = { id: string; email: string; name: string };

/** Resolve the current user from the session cookie, or null if unauthenticated. */
export async function getUser(event: RequestEvent): Promise<SessionUser | null> {
	if (!appwriteConfigured()) return null;
	const secret = event.cookies.get(SESSION_COOKIE);
	if (!secret) return null;
	try {
		const { account } = createSessionClient(secret);
		const user = await account.get();
		return { id: user.$id, email: user.email, name: user.name };
	} catch {
		// Expired / invalid session — treat as logged out.
		return null;
	}
}
