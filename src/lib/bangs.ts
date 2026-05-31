// Bang redirects — type !bang before or after your query to search a specific site.
// Only common, widely-used bangs are included.

export type BangEntry = { name: string; url: string };

/** URL template — %s is replaced with the URI-encoded search term. */
export const BANGS: Record<string, BangEntry> = {
	// ── General search ────────────────────────────────────────────────
	g: { name: 'Google', url: 'https://www.google.com/search?q=%s' },
	b: { name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
	d: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
	ddg: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
	brave: { name: 'Brave Search', url: 'https://search.brave.com/search?q=%s' },
	bs: { name: 'Brave Search', url: 'https://search.brave.com/search?q=%s' },
	ecosia: { name: 'Ecosia', url: 'https://www.ecosia.org/search?method=index&q=%s' },

	// ── Knowledge / reference ─────────────────────────────────────────
	w: { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search=%s' },
	wiki: { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search=%s' },
	wa: { name: 'Wolfram|Alpha', url: 'https://www.wolframalpha.com/input/?i=%s' },
	mdn: { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/search?q=%s' },

	// ── Video ─────────────────────────────────────────────────────────
	yt: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' },
	twitch: { name: 'Twitch', url: 'https://www.twitch.tv/search?term=%s' },

	// ── Code / development ────────────────────────────────────────────
	gh: { name: 'GitHub', url: 'https://github.com/search?q=%s' },
	so: { name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q=%s' },
	npm: { name: 'npm', url: 'https://www.npmjs.com/search?q=%s' },
	pypi: { name: 'PyPI', url: 'https://pypi.org/search/?q=%s' },

	// ── Social ────────────────────────────────────────────────────────
	r: { name: 'Reddit', url: 'https://www.reddit.com/search/?q=%s' },
	tw: { name: 'X (Twitter)', url: 'https://twitter.com/search?q=%s' },
	li: { name: 'LinkedIn', url: 'https://www.linkedin.com/search/results/all/?keywords=%s' },

	// ── Shopping ──────────────────────────────────────────────────────
	a: { name: 'Amazon', url: 'https://www.amazon.com/s?k=%s' },
	amz: { name: 'Amazon', url: 'https://www.amazon.com/s?k=%s' },
	ebay: { name: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=%s' },

	// ── Images / media ────────────────────────────────────────────────
	gi: { name: 'Google Images', url: 'https://www.google.com/search?tbm=isch&q=%s' },
	sp: { name: 'Spotify', url: 'https://open.spotify.com/search/%s' },

	// ── Maps ──────────────────────────────────────────────────────────
	maps: { name: 'Google Maps', url: 'https://www.google.com/maps/search/%s' },
	gm: { name: 'Google Maps', url: 'https://www.google.com/maps/search/%s' }
};

/**
 * Detect a !bang in a query and return the redirect URL and bang name.
 * Supports prefix form ("!g cats") and suffix form ("cats !g").
 * Returns null if no recognised bang is found.
 */
export function resolveBang(query: string): { redirectUrl: string; bangName: string } | null {
	const q = query.trim();

	// Prefix form: !bang [terms…]
	const prefix = q.match(/^!([a-z0-9]+)(?:\s+(.+))?$/i);
	if (prefix) {
		const key = prefix[1].toLowerCase();
		const term = (prefix[2] ?? '').trim();
		const entry = BANGS[key];
		if (entry) {
			return {
				redirectUrl: entry.url.replace('%s', encodeURIComponent(term)),
				bangName: entry.name
			};
		}
	}

	// Suffix form: [terms…] !bang
	const suffix = q.match(/^(.+?)\s+!([a-z0-9]+)$/i);
	if (suffix) {
		const term = suffix[1].trim();
		const key = suffix[2].toLowerCase();
		const entry = BANGS[key];
		if (entry) {
			return {
				redirectUrl: entry.url.replace('%s', encodeURIComponent(term)),
				bangName: entry.name
			};
		}
	}

	return null;
}
