import { writable } from 'svelte/store';

export interface Theme {
	name: string;
	description: string;
	background: string;
	panel: string;
	accent: string;
	text: string;
}

export const themes = {
	dark: {
		name: 'Dark',
		description: 'Low-light default with strong contrast.',
		background: '#171b25',
		panel: '#474747',
		accent: '#8ab4f8',
		text: '#fafafa'
	},
	light: {
		name: 'Light',
		description: 'Clean and bright with soft neutrals.',
		background: '#f5f5f2',
		panel: '#ffffff',
		accent: '#5d7cff',
		text: '#111111'
	},
	slate: {
		name: 'Slate',
		description: 'Cool gray theme with a blue accent.',
		background: '#16181d',
		panel: '#23262d',
		accent: '#7dd3fc',
		text: '#f8fafc'
	},
	sand: {
		name: 'Sand',
		description: 'Warm neutral palette with calm contrast.',
		background: '#f2ede4',
		panel: '#fffaf1',
		accent: '#c38b4d',
		text: '#201a15'
	}
} as const;

type ThemeKey = keyof typeof themes;

function createThemeStore() {
	let initialized = false;
	const { subscribe, set } = writable<ThemeKey>('dark');

	function applyThemeStyles(themeKey: ThemeKey) {
		if (typeof document === 'undefined') return;
		const palette = themes[themeKey];
		const root = document.documentElement;
		root.style.setProperty('--app-background', palette.background);
		root.style.setProperty('--app-panel', palette.panel);
		root.style.setProperty('--app-accent', palette.accent);
		root.style.setProperty('--app-text', palette.text);
		root.style.setProperty(
			'--app-muted',
			themeKey === 'light' || themeKey === 'sand' ? '#5f5b55' : '#9ca3af'
		);
		const isLight = themeKey === 'light' || themeKey === 'sand';
		// Elevated surfaces (inputs, dropdowns, pills). Must track the theme so
		// near-black text stays readable on light themes instead of dark-on-dark.
		root.style.setProperty(
			'--app-elevated',
			isLight ? palette.panel : themeKey === 'slate' ? '#272c39' : '#2e3443'
		);
		root.style.setProperty('--app-secondary', isLight ? '#3f3b36' : '#d4d4d8');
		root.style.setProperty('--app-border', isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)');
		root.style.setProperty(
			'--app-surface',
			isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.025)'
		);
		root.style.setProperty('--app-hover', isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)');
		root.style.setProperty(
			'--app-skeleton',
			isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'
		);
		root.style.setProperty(
			'--app-skeleton-shine',
			isLight ? 'rgba(0,0,0,0.11)' : 'rgba(255,255,255,0.12)'
		);
		root.dataset.theme = themeKey;
	}

	return {
		subscribe,
		load: () => {
			if (initialized || typeof window === 'undefined') return;
			initialized = true;

			const stored = window.localStorage.getItem('LibreSearch:theme');
			if (stored && stored in themes) {
				const themeKey = stored as ThemeKey;
				set(themeKey);
				applyThemeStyles(themeKey);
			} else {
				applyThemeStyles('dark');
			}
		},
		setTheme: (themeKey: ThemeKey) => {
			set(themeKey);
			applyThemeStyles(themeKey);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem('LibreSearch:theme', themeKey);
			}
		}
	};
}

export const themeStore = createThemeStore();
export const themeKeys = Object.keys(themes) as ThemeKey[];
