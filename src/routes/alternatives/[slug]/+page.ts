import { error } from '@sveltejs/kit';
import { alternativeSlugs, getAlternative } from '$lib/alternatives';
import type { PageLoad } from './$types';

export const entries = () => alternativeSlugs.map((slug) => ({ slug }));

export const load = (({ params }) => {
	const page = getAlternative(params.slug);
	if (!page) throw error(404, 'Alternative page not found');
	return { page };
}) satisfies PageLoad;
