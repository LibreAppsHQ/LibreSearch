// Theme module - applies one of the LibreSearch themes by setting
// data-theme on <html>. Cached in localStorage so the popup can apply it
// synchronously on open (no flash), then reconciled with chrome.storage.

export const THEMES = ['auto', 'dark', 'light', 'slate', 'sand'];
export const DEFAULT_THEME = 'dark';
const CACHE_KEY = 'libresearch-ext-theme';

function effectiveTheme(name) {
	if (name === 'auto') {
		return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	}
	return name;
}

export function applyTheme(name) {
	const effective = effectiveTheme(name);
	document.documentElement.dataset.theme = effective;
	document.documentElement.style.colorScheme =
		effective === 'light' || effective === 'sand' ? 'light' : 'dark';
}

export function readCachedTheme() {
	try {
		return localStorage.getItem(CACHE_KEY) || DEFAULT_THEME;
	} catch {
		return DEFAULT_THEME;
	}
}

export function cacheTheme(name) {
	try {
		localStorage.setItem(CACHE_KEY, name);
	} catch {
		/* localStorage blocked */
	}
}

// Re-evaluate when the system preference changes - only relevant in 'auto'.
export function watchSystemPreference(getCurrentName) {
	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	const listener = () => {
		if (getCurrentName() === 'auto') applyTheme('auto');
	};
	mq.addEventListener('change', listener);
	return () => mq.removeEventListener('change', listener);
}
