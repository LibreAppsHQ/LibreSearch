import { writable } from 'svelte/store';

const MAX_HISTORY = 8;
const STORAGE_KEY = 'Launchpad:history';

function createHistoryStore() {
	const { subscribe, set, update } = writable<string[]>([]);

	return {
		subscribe,
		load: () => {
			if (typeof window === 'undefined') return;
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				set(raw ? (JSON.parse(raw) as string[]) : []);
			} catch {
				set([]);
			}
		},
		add: (query: string) => {
			const q = query.trim();
			if (!q) return;
			update((prev) => {
				const next = [q, ...prev.filter((h) => h.toLowerCase() !== q.toLowerCase())].slice(
					0,
					MAX_HISTORY
				);
				if (typeof window !== 'undefined') {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				}
				return next;
			});
		},
		remove: (query: string) => {
			update((prev) => {
				const next = prev.filter((h) => h !== query);
				if (typeof window !== 'undefined') {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				}
				return next;
			});
		},
		clear: () => {
			set([]);
			if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
		}
	};
}

export const historyStore = createHistoryStore();
