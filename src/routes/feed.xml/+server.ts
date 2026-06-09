import { buildBlogRssFeed } from '$lib/blog/rss';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ url }) => {
	const feedUrl = `${url.origin}/feed.xml`;
	const xml = buildBlogRssFeed(feedUrl, url.origin);

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
