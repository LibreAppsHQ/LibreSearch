import { describe, it, expect } from 'vitest';

import { resolveBang } from './bangs';

describe('resolveBang', () => {
	it('returns null when no bang prefix is present', () => {
		expect(resolveBang('hello world')).toBeNull();
	});

	it('resolves a leading bang and URL-encodes the terms', () => {
		expect(resolveBang('!w albert einstein')?.redirectUrl).toBe(
			'https://en.wikipedia.org/wiki/Special:Search?search=albert%20einstein'
		);
	});

	it('resolves a trailing bang', () => {
		expect(resolveBang('cats !yt')?.redirectUrl).toBe(
			'https://www.youtube.com/results?search_query=cats'
		);
	});

	it('matches the bang token case-insensitively', () => {
		expect(resolveBang('!GH sveltekit')?.redirectUrl).toBe('https://github.com/search?q=sveltekit');
	});

	it('returns the bang name alongside the redirect', () => {
		expect(resolveBang('!w einstein')?.bangName).toBe('Wikipedia');
	});

	it('returns null for an unknown bang', () => {
		expect(resolveBang('!zzz foo')).toBeNull();
	});
});
