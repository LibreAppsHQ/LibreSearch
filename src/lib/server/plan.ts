import { ID, Permission, Role } from 'node-appwrite';
import { createAdminClient } from './appwrite';
import { env as pub } from '$env/dynamic/public';

// A user's plan lives in the `profiles` collection, keyed by their Appwrite
// user id. Free is the default for any user without a profile doc. This module
// is the single source of truth for "is this user Pro?".

export type Plan = 'free' | 'pro';

export const DB_ID = pub.PUBLIC_APPWRITE_DB_ID ?? 'main';
export const PROFILES = 'profiles';

/** Look up a user's plan. Missing profile / any error → 'free' (fail closed). */
export async function getPlan(userId: string): Promise<Plan> {
	try {
		const { databases } = createAdminClient();
		const doc = await databases.getDocument(DB_ID, PROFILES, userId);
		return (doc as unknown as { plan?: string }).plan === 'pro' ? 'pro' : 'free';
	} catch {
		return 'free';
	}
}

/**
 * Ensure a profile doc exists for a freshly authenticated user. Idempotent:
 * a duplicate-create (user already has one) is swallowed. The doc is readable
 * only by its owner.
 */
export async function ensureProfile(userId: string): Promise<void> {
	try {
		const { databases } = createAdminClient();
		await databases.createDocument(DB_ID, PROFILES, userId, { userId, plan: 'free' }, [
			Permission.read(Role.user(userId)),
			Permission.update(Role.user(userId))
		]);
	} catch {
		// Already exists (409) or collection unreachable — non-fatal.
	}
}

// Re-export for callers that create profiles with a generated id elsewhere.
export { ID };
