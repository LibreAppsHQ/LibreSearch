import { loadSettings, saveSettings, DEFAULTS } from '../settings.js';
import { applyTheme, cacheTheme, watchSystemPreference } from '../theme.js';

const form = document.getElementById('settings-form');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');

function applyToForm(settings) {
	for (const [key, value] of Object.entries(settings)) {
		const radios = form.querySelectorAll(`input[name="${key}"]`);
		if (radios.length > 0) {
			radios.forEach((r) => {
				r.checked = r.value === value;
			});
			continue;
		}
		const select = form.elements.namedItem(key);
		if (select && 'value' in select) select.value = value;
	}
}

function readFromForm() {
	const data = new FormData(form);
	return {
		defaultTab: data.get('defaultTab') ?? '',
		safeSearch: data.get('safeSearch') ?? 'moderate',
		region: data.get('region') ?? '',
		openIn: data.get('openIn') ?? 'newTab',
		theme: data.get('theme') ?? 'dark'
	};
}

let currentTheme = 'dark';

function applyAndCacheTheme(name) {
	currentTheme = name;
	applyTheme(name);
	cacheTheme(name);
}

let statusTimeout;
function flashSaved() {
	statusEl.classList.add('is-visible');
	clearTimeout(statusTimeout);
	statusTimeout = setTimeout(() => {
		statusEl.classList.remove('is-visible');
	}, 1600);
}

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	const next = readFromForm();
	await saveSettings(next);
	applyAndCacheTheme(next.theme);
	flashSaved();
});

resetBtn.addEventListener('click', async () => {
	applyToForm(DEFAULTS);
	await saveSettings(DEFAULTS);
	applyAndCacheTheme(DEFAULTS.theme);
	flashSaved();
});

// Auto-save when a radio tile changes — saving feels more responsive than
// a click-then-save dance.
form.addEventListener('change', async (event) => {
	const isRadio = event.target instanceof HTMLInputElement && event.target.type === 'radio';
	const isSelect = event.target instanceof HTMLSelectElement;
	if (!isRadio && !isSelect) return;

	const next = readFromForm();
	await saveSettings(next);
	// Theme change is the one place where we apply *immediately* so the user
	// can preview their choice.
	if (event.target.name === 'theme') applyAndCacheTheme(next.theme);
	flashSaved();
});

(async function init() {
	const settings = await loadSettings();
	applyToForm(settings);
	applyAndCacheTheme(settings.theme || 'dark');
	watchSystemPreference(() => currentTheme);
})();
