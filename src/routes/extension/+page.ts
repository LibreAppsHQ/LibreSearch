import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const product = url.searchParams.get('product');
	return { initialProduct: product === 'guard' ? 'guard' : 'search' };
};
