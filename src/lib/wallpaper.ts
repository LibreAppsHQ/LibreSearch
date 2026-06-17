const WALLPAPER_KEY = 'LibreSearch:wallpaper';

export function getWallpaper(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage.getItem(WALLPAPER_KEY);
	} catch {
		return null;
	}
}

export function setWallpaper(dataUrl: string): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(WALLPAPER_KEY, dataUrl);
	} catch {
		// quota exceeded
	}
}

export function clearWallpaper(): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.removeItem(WALLPAPER_KEY);
	} catch {
		// ignore
	}
}
