import { error, redirect } from '@sveltejs/kit';
import { getPost, posts } from '$lib/blog/posts';
import type { PageLoad } from './$types';

// Let SvelteKit prerender one entry per known post.
export const entries = () => posts.map((p) => ({ slug: p.slug }));

export const load = (({ params }) => {
	if (params.slug === 'rss.xml' || params.slug === 'rss') {
		redirect(308, '/feed.xml');
	}

	const post = getPost(params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}
	return { post };
}) satisfies PageLoad;
