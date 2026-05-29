import { loadSettings, buildSearchUrl } from '../settings.js';
import { applyTheme, cacheTheme } from '../theme.js';

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const tabNav = document.querySelector('nav[role="tablist"]');
const tabButtons = document.querySelectorAll('.tab');
const openSettingsBtn = document.getElementById('open-settings');

let activeTab = '';
let settings = null;

function positionIndicator(target) {
	if (!tabNav || !target) return;
	const navRect = tabNav.getBoundingClientRect();
	const tabRect = target.getBoundingClientRect();
	tabNav.style.setProperty('--tab-left', `${tabRect.left - navRect.left}px`);
	tabNav.style.setProperty('--tab-width', `${tabRect.width}px`);
	tabNav.setAttribute('data-ready', '');
}

function selectTab(tabValue) {
	activeTab = tabValue ?? '';
	let active = null;
	tabButtons.forEach((btn) => {
		const isActive = (btn.dataset.tab || '') === activeTab;
		btn.classList.toggle('is-active', isActive);
		btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
		if (isActive) active = btn;
	});
	positionIndicator(active);
}

tabButtons.forEach((btn) => {
	btn.addEventListener('click', () => {
		selectTab(btn.dataset.tab || '');
		input.focus();
	});
});

form.addEventListener('submit', (event) => {
	event.preventDefault();
	const query = input.value.trim();
	if (!query) {
		input.focus();
		return;
	}
	const url = buildSearchUrl(query, settings ?? {}, activeTab);
	if (settings?.openIn === 'currentTab') {
		chrome.tabs.update({ url });
	} else {
		chrome.tabs.create({ url, active: true });
	}
	window.close();
});

openSettingsBtn?.addEventListener('click', () => {
	if (chrome.runtime.openOptionsPage) {
		chrome.runtime.openOptionsPage();
	} else {
		chrome.tabs.create({ url: chrome.runtime.getURL('options/index.html') });
	}
	window.close();
});

// Reposition the indicator if the popup is ever resized (rare but cheap).
window.addEventListener('resize', () => {
	const active = document.querySelector('.tab.is-active');
	positionIndicator(active);
});

(async function init() {
	settings = await loadSettings();
	// Reconcile theme with chrome.storage in case the user changed it on
	// another device (localStorage cache may be stale).
	if (settings.theme) {
		applyTheme(settings.theme);
		cacheTheme(settings.theme);
	}
	// Wait one frame so layout is settled before measuring.
	requestAnimationFrame(() => {
		selectTab(settings.defaultTab || '');
	});
})();
