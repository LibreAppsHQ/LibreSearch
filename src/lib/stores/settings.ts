import { writable } from 'svelte/store';

export type SettingCategory = 'general' | 'appearance' | 'privacy';

export interface ToggleSetting {
	id: string;
	name: string;
	description: string;
	category: SettingCategory;
	type: 'toggle';
	checked: boolean;
}

export interface SelectSetting {
	id: string;
	name: string;
	description: string;
	category: SettingCategory;
	type: 'select';
	value: string;
	options: Array<{ label: string; value: string }>;
}

export type Setting = ToggleSetting | SelectSetting;

const defaultSettings: Setting[] = [
	// ── General ──────────────────────────────────────────────────
	{
		id: 'open-new-tab',
		name: 'Open results in new tab',
		description: 'Keep LibreSearch open while you browse a result.',
		category: 'general',
		type: 'toggle',
		checked: false
	},
	{
		id: 'autocomplete',
		name: 'Show autocomplete',
		description: 'Display query suggestions as you type.',
		category: 'general',
		type: 'toggle',
		checked: true
	},
	{
		id: 'keyboard-shortcut',
		name: 'Press / to focus search',
		description: 'Jump to the search bar from anywhere by pressing /.',
		category: 'general',
		type: 'toggle',
		checked: true
	},
	{
		id: 'instant-answers',
		name: 'Instant answers',
		description: 'Show built-in tools like the calculator, unit converter, and password generator.',
		category: 'general',
		type: 'toggle',
		checked: true
	},
	{
		id: 'enable-cache',
		name: 'Cache search results',
		description: 'Speed up repeated searches by reusing results for up to 5 minutes.',
		category: 'general',
		type: 'toggle',
		checked: false
	},
	{
		id: 'default-tab',
		name: 'Default search type',
		description: 'Which tab opens when you start a new search.',
		category: 'general',
		type: 'select',
		value: 'web',
		options: [
			{ label: 'All', value: 'web' },
			{ label: 'Images', value: 'images' },
			{ label: 'Videos', value: 'videos' },
			{ label: 'News', value: 'news' }
		]
	},

	// ── Appearance ───────────────────────────────────────────────
	{
		id: 'show-favicons',
		name: 'Show site favicons',
		description: 'Display the website icon next to each result.',
		category: 'appearance',
		type: 'toggle',
		checked: true
	},
	{
		id: 'show-sitelinks',
		name: 'Show quick links',
		description: 'Show sub-links below top results when available.',
		category: 'appearance',
		type: 'toggle',
		checked: true
	},
	{
		id: 'show-age',
		name: 'Show result date',
		description: 'Display the age or publication date of each result.',
		category: 'appearance',
		type: 'toggle',
		checked: true
	},
	{
		id: 'show-suggestion-icons',
		name: 'Show suggestion icons',
		description: 'Display the small clock and search icons in the autocomplete dropdown.',
		category: 'appearance',
		type: 'toggle',
		checked: false
	},
	{
		id: 'compact-results',
		name: 'Compact results',
		description: 'Use a denser layout with less spacing between cards.',
		category: 'appearance',
		type: 'toggle',
		checked: false
	},
	{
		id: 'reduce-motion',
		name: 'Reduce motion',
		description: 'Minimize transitions and animated UI changes.',
		category: 'appearance',
		type: 'toggle',
		checked: false
	},
	{
		id: 'results-per-page',
		name: 'Results per page',
		description: 'Select between 10 or 20 results per page.',
		category: 'appearance',
		type: 'select',
		value: '10',
		options: [
			{ label: '10', value: '10' },
			{ label: '20', value: '20' }
		]
	},
	{
		id: 'temperature-unit',
		name: 'Unit of temperature',
		description: 'Show temperature in Celsius or Fahrenheit.',
		category: 'appearance',
		type: 'select',
		value: 'celsius',
		options: [
			{ label: 'Celsius', value: 'celsius' },
			{ label: 'Fahrenheit', value: 'fahrenheit' }
		]
	},
	{
		id: 'show-clock',
		name: 'Show clock on homepage',
		description: 'Display a live clock in the top-left of the homepage.',
		category: 'appearance',
		type: 'toggle',
		checked: false
	},
	{
		id: 'datetime-format',
		name: 'Date and time format',
		description: 'Choose how the homepage clock displays the date and time.',
		category: 'appearance',
		type: 'select',
		value: 'mdy12',
		options: [
			{ label: 'M/D/Y 12-hour', value: 'mdy12' },
			{ label: 'M/D/Y 24:00', value: 'mdy24' },
			{ label: 'D/M/Y 12-hour', value: 'dmy12' },
			{ label: 'D/M/Y 24:00', value: 'dmy24' },
			{ label: 'Y-M-D 24:00', value: 'ymd24' }
		]
	},
	{
		id: 'clock-show-date',
		name: 'Show date on clock',
		description: 'Include the date alongside the time on the homepage clock.',
		category: 'appearance',
		type: 'toggle',
		checked: true
	},
	{
		id: 'clock-show-seconds',
		name: 'Show seconds on clock',
		description: 'Display ticking seconds on the homepage clock.',
		category: 'appearance',
		type: 'toggle',
		checked: false
	},

	// ── Privacy ──────────────────────────────────────────────────
	{
		id: 'block-ads',
		name: 'Built-in ad blocker',
		description: 'Block results from known advertising networks and domains.',
		category: 'privacy',
		type: 'toggle',
		checked: true
	},
	{
		id: 'block-trackers',
		name: 'Built-in tracker protection',
		description: 'Block results from known data brokers and tracking services.',
		category: 'privacy',
		type: 'toggle',
		checked: true
	},
	{
		id: 'safe-search',
		name: 'Safe search',
		description: 'Filter explicit content from search results.',
		category: 'privacy',
		type: 'select',
		value: 'moderate',
		options: [
			{ label: 'Strict', value: 'strict' },
			{ label: 'Moderate', value: 'moderate' },
			{ label: 'Off', value: 'low' }
		]
	},
	{
		id: 'ai-answers',
		name: 'AI answers',
		description:
			'Show a short AI-written summary above web results. When on, your query and the top result snippets are sent to our AI provider to generate the answer. Off by default.',
		category: 'privacy',
		type: 'toggle',
		checked: false
	},
	{
		id: 'filter-ads',
		name: 'Filter sponsored results',
		description: 'Hide promoted and ad-labelled results from the page.',
		category: 'privacy',
		type: 'toggle',
		checked: true
	},
	{
		id: 'strip-tracking',
		name: 'Strip tracking parameters',
		description: 'Remove utm_*, fbclid, and other tracking tags from result URLs.',
		category: 'privacy',
		type: 'toggle',
		checked: false
	},
	{
		id: 'no-referrer',
		name: 'Hide referrer on clicks',
		description: "Don't tell sites you came from LibreSearch when you open a result.",
		category: 'privacy',
		type: 'toggle',
		checked: false
	},
	{
		id: 'request-method',
		name: 'HTTP request method',
		description: 'POST hides your query from the URL and browser tab. GET includes them.',
		category: 'privacy',
		type: 'select',
		value: 'GET',
		options: [
			{ label: 'GET', value: 'GET' },
			{ label: 'POST', value: 'POST' }
		]
	},
	{
		id: 'save-history',
		name: 'Save search history',
		description: 'Remember recent searches for autocomplete suggestions.',
		category: 'privacy',
		type: 'toggle',
		checked: true
	},
	{
		id: 'history-retention',
		name: 'History retention',
		description: 'How long recent searches are kept in your browser.',
		category: 'privacy',
		type: 'select',
		value: 'forever',
		options: [
			{ label: 'This session only', value: 'session' },
			{ label: '7 days', value: '7d' },
			{ label: '30 days', value: '30d' },
			{ label: 'Forever', value: 'forever' }
		]
	},
	{
		id: 'search-region',
		name: 'Search region',
		description: 'Localise results to a specific country.',
		category: 'privacy',
		type: 'select',
		value: '',
		options: [
			{ label: 'All regions', value: '' },
			{ label: 'Argentina', value: 'AR' },
			{ label: 'Australia', value: 'AU' },
			{ label: 'Austria', value: 'AT' },
			{ label: 'Belgium', value: 'BE' },
			{ label: 'Brazil', value: 'BR' },
			{ label: 'Canada', value: 'CA' },
			{ label: 'Chile', value: 'CL' },
			{ label: 'China', value: 'CN' },
			{ label: 'Denmark', value: 'DK' },
			{ label: 'Finland', value: 'FI' },
			{ label: 'France', value: 'FR' },
			{ label: 'Germany', value: 'DE' },
			{ label: 'Hong Kong', value: 'HK' },
			{ label: 'India', value: 'IN' },
			{ label: 'Indonesia', value: 'ID' },
			{ label: 'Italy', value: 'IT' },
			{ label: 'Japan', value: 'JP' },
			{ label: 'Malaysia', value: 'MY' },
			{ label: 'Mexico', value: 'MX' },
			{ label: 'Netherlands', value: 'NL' },
			{ label: 'New Zealand', value: 'NZ' },
			{ label: 'Norway', value: 'NO' },
			{ label: 'Philippines', value: 'PH' },
			{ label: 'Poland', value: 'PL' },
			{ label: 'Portugal', value: 'PT' },
			{ label: 'Russia', value: 'RU' },
			{ label: 'Saudi Arabia', value: 'SA' },
			{ label: 'South Africa', value: 'ZA' },
			{ label: 'South Korea', value: 'KR' },
			{ label: 'Spain', value: 'ES' },
			{ label: 'Sweden', value: 'SE' },
			{ label: 'Switzerland', value: 'CH' },
			{ label: 'Taiwan', value: 'TW' },
			{ label: 'Turkey', value: 'TR' },
			{ label: 'United Kingdom', value: 'GB' },
			{ label: 'United States', value: 'US' }
		]
	}
];

export function getToggle(settings: Setting[], id: string, defaultValue = true): boolean {
	const s = settings.find((s) => s.id === id);
	if (!s || s.type !== 'toggle') return defaultValue;
	return s.checked;
}

export function getSelect(settings: Setting[], id: string, defaultValue = ''): string {
	const s = settings.find((s) => s.id === id);
	if (!s || s.type !== 'select') return defaultValue;
	return s.value;
}

function mergeWithDefaults(stored: unknown[]): Setting[] {
	return defaultSettings.map((def) => {
		const found = (stored as Setting[]).find((s) => s.id === def.id);
		if (!found) return def;
		if (def.type === 'toggle' && found.type === 'toggle') {
			return { ...def, checked: found.checked };
		}
		if (def.type === 'select' && found.type === 'select') {
			return { ...def, value: found.value };
		}
		return def;
	});
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<Setting[]>(defaultSettings);

	return {
		subscribe,
		load: () => {
			if (typeof window === 'undefined') return;
			try {
				const raw = window.localStorage.getItem('LibreSearch:settings');
				if (raw) {
					const parsed = JSON.parse(raw) as unknown[];
					set(mergeWithDefaults(parsed));
				}
			} catch {
				set(defaultSettings);
			}
		},
		toggle: (id: string) => {
			update((settings) => {
				const updated = settings.map((s) =>
					s.id === id && s.type === 'toggle' ? { ...s, checked: !s.checked } : s
				);
				if (typeof window !== 'undefined') {
					window.localStorage.setItem('LibreSearch:settings', JSON.stringify(updated));
				}
				return updated;
			});
		},
		select: (id: string, value: string) => {
			update((settings) => {
				const updated = settings.map((s) =>
					s.id === id && s.type === 'select' ? { ...s, value } : s
				);
				if (typeof window !== 'undefined') {
					window.localStorage.setItem('LibreSearch:settings', JSON.stringify(updated));
				}
				return updated;
			});
		},
		save: (updatedSettings: Setting[]) => {
			set(updatedSettings);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem('LibreSearch:settings', JSON.stringify(updatedSettings));
			}
		},
		reset: () => {
			set(defaultSettings);
			if (typeof window !== 'undefined') {
				window.localStorage.removeItem('LibreSearch:settings');
			}
		},
		import: (raw: unknown): boolean => {
			if (!Array.isArray(raw)) return false;
			try {
				const merged = mergeWithDefaults(raw as unknown[]);
				set(merged);
				if (typeof window !== 'undefined') {
					window.localStorage.setItem('LibreSearch:settings', JSON.stringify(merged));
				}
				return true;
			} catch {
				return false;
			}
		}
	};
}

export const settingsStore = createSettingsStore();
