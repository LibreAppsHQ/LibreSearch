interface Turnstile {
	render(
		container: HTMLElement,
		options: {
			sitekey: string;
			theme?: 'light' | 'dark' | 'auto';
			size?: 'normal' | 'compact';
			callback?: (token: string) => void;
			'error-callback'?: () => void;
			'expired-callback'?: () => void;
			'timeout-callback'?: () => void;
		}
	): string;
	reset(widgetId: string): void;
	remove(widgetId: string): void;
}

declare global {
	interface Window {
		turnstile: Turnstile | undefined;
	}
}

export {};
