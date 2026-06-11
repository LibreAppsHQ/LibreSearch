export type BrowserKey = 'chrome' | 'edge' | 'firefox' | 'safari' | 'other';

export function detectBrowser(): BrowserKey {
	if (typeof navigator === 'undefined') return 'other';
	const ua = navigator.userAgent;
	if (/Edg\//.test(ua)) return 'edge';
	if (/Firefox\//.test(ua)) return 'firefox';
	if (/Chrome\//.test(ua) || /Chromium\//.test(ua)) return 'chrome';
	if (/Safari\//.test(ua) && /Apple/.test(navigator.vendor)) return 'safari';
	return 'other';
}

export function getSearchUrlTemplate(origin: string): string {
	return `${origin}/search?q=%s`;
}

export function getDefaultSearchSteps(
	browser: BrowserKey,
	origin: string
): { name: string; steps: string[] } {
	const searchUrlTemplate = getSearchUrlTemplate(origin);

	return {
		chrome: {
			name: 'Chrome',
			steps: [
				'Go to chrome://settings/searchEngines.',
				'Next to “Site search”, click Add.',
				`Name it “LibreSearch”, set a shortcut (e.g. libre), and set the URL to ${searchUrlTemplate}.`,
				'Click the ⋮ next to the new entry and choose “Make default”.'
			]
		},
		edge: {
			name: 'Edge',
			steps: [
				'Go to edge://settings/searchEngines.',
				'Next to “Manage search engines”, click Add.',
				`Name it “LibreSearch”, set a shortcut (e.g. libre), and set the URL to ${searchUrlTemplate}.`,
				'Click the ⋯ next to the new entry and choose “Make default”.'
			]
		},
		firefox: {
			name: 'Firefox',
			steps: [
				'Click the search bar, then the magnifying-glass/options icon.',
				'Choose “Add LibreSearch” to install it as a search engine.',
				'Open Settings → Search and pick LibreSearch as your Default Search Engine.'
			]
		},
		safari: {
			name: 'Safari',
			steps: [
				'Safari only allows a fixed list of default search engines, so it can’t be set as the system default.',
				'Bookmark LibreSearch instead, or add it to your Favorites for one-tap access.'
			]
		},
		other: {
			name: 'your browser',
			steps: [
				'Open your browser’s search engine settings.',
				'Look for “LibreSearch” among the discovered engines (most browsers add it after your first visit).',
				`If it isn’t there, click Add and set the URL to ${searchUrlTemplate}, then select it.`
			]
		}
	}[browser];
}
