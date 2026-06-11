export type AlternativeSlug = 'google' | 'duckduckgo' | 'startpage';

export type AlternativePage = {
	slug: AlternativeSlug;
	competitorName: string;
	logo: string;
	engineIndex: number;
	metaTitle: string;
	metaDescription: string;
	headline: string;
	subhead: string;
	reasons: string[];
};

export const alternatives: Record<AlternativeSlug, AlternativePage> = {
	google: {
		slug: 'google',
		competitorName: 'Google',
		logo: '/google.png',
		engineIndex: 1,
		metaTitle: 'LibreSearch — Private Google Alternative',
		metaDescription:
			'Replace Google with LibreSearch: real web results without tracking, profiles, or ads. Open-source, bang shortcuts, and no query logging.',
		headline: 'A private alternative to Google',
		subhead:
			'Google’s business is built on your search history. LibreSearch gives you the same kinds of results — web, images, video, news — without building a profile on you.',
		reasons: [
			'No query logging or ad targeting based on what you search.',
			'No filter bubble — the same query returns the same results for everyone.',
			'Bang shortcuts (!w, !gh, !yt) for fast site-specific searches.',
			'Open-source AGPL UI you can inspect and verify.',
			'Built-in tracker stripping on outbound links.',
			'Free, ad-free, and works without an account.'
		]
	},
	duckduckgo: {
		slug: 'duckduckgo',
		competitorName: 'DuckDuckGo',
		logo: '/ddg.svg',
		engineIndex: 3,
		metaTitle: 'LibreSearch — DuckDuckGo Alternative',
		metaDescription:
			'Looking beyond DuckDuckGo? LibreSearch offers private search with open-source code, bang shortcuts, built-in video player, and ad-blocklists at search time.',
		headline: 'An open alternative to DuckDuckGo',
		subhead:
			'DuckDuckGo proved people want private search. LibreSearch goes further with a fully open-source interface, tracker blocklists at search time, and a built-in video viewer.',
		reasons: [
			'Fully open-source search UI (AGPL) — verify claims in the code.',
			'Ad and tracker domain blocklists applied when you search.',
			'Built-in video player so you can watch results without leaving the page.',
			'Same bang shortcuts you already know (!g, !w, !yt, and more).',
			'Proof-of-work bot protection instead of privacy-invasive CAPTCHAs.',
			'Local-first settings — preferences stay on your device.'
		]
	},
	startpage: {
		slug: 'startpage',
		competitorName: 'Startpage',
		logo: '/startpage.svg',
		engineIndex: 5,
		metaTitle: 'LibreSearch — Startpage Alternative',
		metaDescription:
			'Switch from Startpage to LibreSearch for private search with bang shortcuts, open-source code, maps tab, and built-in video playback.',
		headline: 'A modern alternative to Startpage',
		subhead:
			'Startpage wraps Google results privately. LibreSearch is a privacy-first frontend with more features out of the box and source code you can read.',
		reasons: [
			'Bang shortcuts for one-tap searches on hundreds of sites.',
			'Built-in maps tab and inline video player.',
			'Open-source AGPL interface — not a closed proprietary frontend.',
			'Ad / tracker blocklists at search time on every query.',
			'Four themes plus compact results mode for faster scanning.',
			'Enterprise rollout guides for making LibreSearch the org default.'
		]
	}
};

export const alternativeSlugs = Object.keys(alternatives) as AlternativeSlug[];

export function getAlternative(slug: string): AlternativePage | undefined {
	return alternatives[slug as AlternativeSlug];
}
