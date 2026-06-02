// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			// Vercel exposes waitUntil() for background work via platform.context.
			context?: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

export {};
