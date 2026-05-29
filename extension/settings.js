// Shared settings module — used by both the popup and the options page.
// Backed by chrome.storage.sync so user prefs follow them across devices
// (with a graceful fallback to .local if sync is unavailable).

export const SETTINGS_KEYS = [
	'defaultTab',
	'safeSearch',
	'region',
	'openIn',
	'theme'
];

export const DEFAULTS = {
	defaultTab: '', // '' = web, 'images', 'videos', 'news'
	safeSearch: 'moderate', // 'strict' | 'moderate' | 'low'
	region: '', // '' = any
	openIn: 'newTab', // 'newTab' | 'currentTab'
	theme: 'dark' // 'auto' | 'dark' | 'light' | 'slate' | 'sand'
};

function storageArea() {
	// chrome.storage.sync isn't available in some hardened/managed contexts.
	return chrome.storage?.sync ?? chrome.storage.local;
}

export async function loadSettings() {
	return new Promise((resolve) => {
		storageArea().get(SETTINGS_KEYS, (stored) => {
			resolve({ ...DEFAULTS, ...stored });
		});
	});
}

export async function saveSettings(patch) {
	return new Promise((resolve) => {
		const clean = {};
		for (const k of SETTINGS_KEYS) {
			if (k in patch) clean[k] = patch[k];
		}
		storageArea().set(clean, resolve);
	});
}

export function buildSearchUrl(query, settings, tabOverride) {
	const tab = tabOverride !== undefined ? tabOverride : settings.defaultTab;
	const params = new URLSearchParams({ q: query });
	if (tab) params.set('t', tab);
	if (settings.safeSearch && settings.safeSearch !== 'moderate')
		params.set('safe', settings.safeSearch);
	if (settings.region) params.set('region', settings.region);
	return `https://libresearch.ca/search?${params.toString()}`;
}
