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
		description: 'Keep ArcSearch open while you browse a result.',
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
		type: 'toggle',
		checked: true
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
		description: "Don't tell sites you came from ArcSearch when you open a result.",
		category: 'privacy',
		type: 'toggle',
		checked: false
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
			{ label: 'United States', value: 'US' },
			{ label: 'United Kingdom', value: 'GB' },
			{ label: 'Canada', value: 'CA' },
			{ label: 'Australia', value: 'AU' },
			{ label: 'Germany', value: 'DE' },
			{ label: 'France', value: 'FR' },
			{ label: 'Japan', value: 'JP' },
			{ label: 'India', value: 'IN' },
			{ label: 'Brazil', value: 'BR' }
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
				const raw = window.localStorage.getItem('arcsearch:settings');
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
					window.localStorage.setItem('arcsearch:settings', JSON.stringify(updated));
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
					window.localStorage.setItem('arcsearch:settings', JSON.stringify(updated));
				}
				return updated;
			});
		},
		save: (updatedSettings: Setting[]) => {
			set(updatedSettings);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem('arcsearch:settings', JSON.stringify(updatedSettings));
			}
		},
		reset: () => {
			set(defaultSettings);
			if (typeof window !== 'undefined') {
				window.localStorage.removeItem('arcsearch:settings');
			}
		},
		import: (raw: unknown): boolean => {
			if (!Array.isArray(raw)) return false;
			try {
				const merged = mergeWithDefaults(raw as unknown[]);
				set(merged);
				if (typeof window !== 'undefined') {
					window.localStorage.setItem('arcsearch:settings', JSON.stringify(merged));
				}
				return true;
			} catch {
				return false;
			}
		}
	};
}

export const settingsStore = createSettingsStore();
