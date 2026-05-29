import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/blog/posts';
import type { PageLoad } from './$types';

// Let SvelteKit prerender one entry per known post.
export const entries = () => posts.map((p) => ({ slug: p.slug }));

export const load = (({ params }) => {
	const post = getPost(params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}
	return { post };
}) satisfies PageLoad;
