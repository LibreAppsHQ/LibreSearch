import { derived } from 'svelte/store';
import { settingsStore, getToggle } from './settings';

export const reducedMotion = derived(settingsStore, ($settings) =>
	getToggle($settings, 'reduce-motion', false)
);

export function dur(ms: number, reduced: boolean): number {
	return reduced ? 0 : ms;
}
