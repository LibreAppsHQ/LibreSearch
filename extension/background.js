// Background service worker.
//
// Handles three integration points:
//   1. Omnibox keyword `libre <query>` - search from the address bar.
//   2. Context menu - right-click any selected text → search LibreSearch.
//   3. First-install action - open the welcome page once.

const SEARCH_URL = 'https://libresearch.ca/search?q=';
const CONTEXT_MENU_ID = 'libresearch-search-selection';

function searchUrlFor(text) {
	return SEARCH_URL + encodeURIComponent(text.trim());
}

// ── Omnibox ───────────────────────────────────────────────
chrome.omnibox.setDefaultSuggestion({
	description: 'Search LibreSearch for "%s" - private, no tracking'
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
	const url = searchUrlFor(text);
	switch (disposition) {
		case 'currentTab':
			chrome.tabs.update({ url });
			break;
		case 'newForegroundTab':
			chrome.tabs.create({ url, active: true });
			break;
		case 'newBackgroundTab':
			chrome.tabs.create({ url, active: false });
			break;
	}
});

// ── Context menu ──────────────────────────────────────────
// Created on install AND on browser startup, since service workers can
// terminate and we want the menu to survive.
function ensureContextMenu() {
	chrome.contextMenus.removeAll(() => {
		chrome.contextMenus.create({
			id: CONTEXT_MENU_ID,
			title: 'Search LibreSearch for "%s"',
			contexts: ['selection']
		});
	});
}

chrome.runtime.onInstalled.addListener(ensureContextMenu);
chrome.runtime.onStartup?.addListener(ensureContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId !== CONTEXT_MENU_ID) return;
	const selection = (info.selectionText || '').trim();
	if (!selection) return;
	const url = searchUrlFor(selection);
	chrome.tabs.create({ url, active: true, index: tab ? tab.index + 1 : undefined });
});
