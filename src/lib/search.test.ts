import { describe, it, expect } from 'vitest';

import { normalizeSearchQuery, formatDisplayUrl, MAX_SEARCH_QUERY_LENGTH } from './search';

describe('normalizeSearchQuery', () => {
	it('collapses runs of whitespace into single spaces and trims', () => {
		expect(normalizeSearchQuery('  hello   world\t\nfoo ')).toBe('hello world foo');
	});

	it('preserves search operators', () => {
		expect(normalizeSearchQuery('"exact phrase" -excluded +required site:example.com')).toBe(
			'"exact phrase" -excluded +required site:example.com'
		);
	});

	it('keeps hyphens inside words', () => {
		expect(normalizeSearchQuery('state-of-the-art')).toBe('state-of-the-art');
	});

	it('returns null for empty or whitespace-only input', () => {
		expect(normalizeSearchQuery('')).toBeNull();
		expect(normalizeSearchQuery('   \t\n ')).toBeNull();
	});

	it('returns null when the query exceeds the max length', () => {
		expect(normalizeSearchQuery('a'.repeat(MAX_SEARCH_QUERY_LENGTH + 1))).toBeNull();
	});

	it('accepts a query exactly at the max length', () => {
		const q = 'a'.repeat(MAX_SEARCH_QUERY_LENGTH);
		expect(normalizeSearchQuery(q)).toBe(q);
	});
});

describe('formatDisplayUrl', () => {
	it('strips the protocol and a trailing slash', () => {
		expect(formatDisplayUrl('https://example.com/')).toBe('example.com');
	});

	it('keeps the path and query string', () => {
		expect(formatDisplayUrl('https://example.com/a/b?c=d')).toBe('example.com/a/b?c=d');
	});

	it('returns the raw input when it is not a valid URL', () => {
		expect(formatDisplayUrl('not a url')).toBe('not a url');
	});
});
