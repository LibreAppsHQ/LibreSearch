<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Browsers that support PWA install fire this with a deferred prompt.
	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	// Prefixed so the Wipe button (which clears every `LibreSearch:` key) removes it too.
	const DISMISS_KEY = 'LibreSearch:install-dismissed';
	// Don't pester someone who dismissed for ~30 days.
	const DISMISS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

	let deferred = $state<BeforeInstallPromptEvent | null>(null);
	let visible = $state(false);
	let installing = $state(false);

	function recentlyDismissed(): boolean {
		try {
			const ts = localStorage.getItem(DISMISS_KEY);
			if (!ts) return false;
			return Date.now() - Number(ts) < DISMISS_WINDOW_MS;
		} catch {
			return false;
		}
	}

	function captureEvent(event: Event) {
		event.preventDefault();
		deferred = event as BeforeInstallPromptEvent;
		// Hold off a few seconds so it doesn't appear at the same instant the
		// page is still painting.
		if (!recentlyDismissed()) {
			setTimeout(() => {
				if (deferred) visible = true;
			}, 3000);
		}
	}

	function onInstalled() {
		visible = false;
		deferred = null;
	}

	async function install() {
		if (!deferred) return;
		installing = true;
		try {
			await deferred.prompt();
			const choice = await deferred.userChoice;
			if (choice.outcome === 'dismissed') {
				try {
					localStorage.setItem(DISMISS_KEY, String(Date.now()));
				} catch {
					/* localStorage blocked */
				}
			}
		} finally {
			installing = false;
			deferred = null;
			visible = false;
		}
	}

	function dismiss() {
		visible = false;
		try {
			localStorage.setItem(DISMISS_KEY, String(Date.now()));
		} catch {
			/* localStorage blocked */
		}
	}

	onMount(() => {
		window.addEventListener('beforeinstallprompt', captureEvent);
		window.addEventListener('appinstalled', onInstalled);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		window.removeEventListener('beforeinstallprompt', captureEvent);
		window.removeEventListener('appinstalled', onInstalled);
	});
</script>

{#if visible && deferred}
	<div
		class="fixed right-4 bottom-4 z-40 flex w-[calc(100%-2rem)] max-w-sm items-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-background)]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md animate-slide-up"
		role="dialog"
		aria-labelledby="install-prompt-title"
	>
		<div
			class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)]"
		>
			<i class="fa-solid fa-download text-lg"></i>
		</div>
		<div class="min-w-0 flex-1">
			<p id="install-prompt-title" class="text-sm font-semibold text-[var(--app-text)]">
				Install LibreSearch
			</p>
			<p class="mt-0.5 text-xs leading-5 text-[var(--app-muted)]">
				Add it to your home screen for one-tap, full-screen access.
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<button
				type="button"
				onclick={install}
				disabled={installing}
				class="rounded-lg bg-[var(--app-accent)] px-3 py-1.5 text-xs font-semibold text-[#0d1019] transition hover:opacity-90 disabled:opacity-60"
			>
				{installing ? 'Installing…' : 'Install'}
			</button>
			<button
				type="button"
				onclick={dismiss}
				aria-label="Dismiss install prompt"
				class="rounded-lg p-1.5 text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>
	</div>
{/if}
