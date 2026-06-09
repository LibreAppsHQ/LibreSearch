import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/** Legacy path — the feed lives at /feed.xml */
export const GET: RequestHandler = () => {
	redirect(308, '/feed.xml');
};
