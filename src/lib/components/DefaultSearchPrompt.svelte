<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { detectBrowser, getDefaultSearchSteps, type BrowserKey } from '$lib/defaultSearch';

	let {
		showWhen = false,
		showLink = false
	}: {
		/** When true and not recently dismissed, the banner may appear. */
		showWhen?: boolean;
		/** Compact text link that opens the setup dialog (e.g. on the homepage). */
		showLink?: boolean;
	} = $props();

	const DISMISS_KEY = 'LibreSearch:default-search-dismissed';
	const DISMISS_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

	let bannerVisible = $state(false);
	let showModal = $state(false);
	let browserKey = $state<BrowserKey>('other');
	let origin = $state('https://libresearch.ca');
	let dialogEl = $state<HTMLDialogElement | null>(null);

	let steps = $derived(getDefaultSearchSteps(browserKey, origin));

	function recentlyDismissed(): boolean {
		try {
			const ts = localStorage.getItem(DISMISS_KEY);
			if (!ts) return false;
			return Date.now() - Number(ts) < DISMISS_WINDOW_MS;
		} catch {
			return false;
		}
	}

	function dismiss() {
		bannerVisible = false;
		showModal = false;
		dialogEl?.close();
		try {
			localStorage.setItem(DISMISS_KEY, String(Date.now()));
		} catch {
			/* localStorage blocked */
		}
	}

	function openModal() {
		if (!browser) return;
		browserKey = detectBrowser();
		origin = window.location.origin;
		showModal = true;
	}

	$effect(() => {
		if (!browser || !showWhen || recentlyDismissed()) {
			bannerVisible = false;
			return;
		}
		bannerVisible = true;
	});

	$effect(() => {
		if (!showModal || !dialogEl) return;
		dialogEl.showModal();
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') dismiss();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	onMount(() => {
		browserKey = detectBrowser();
		if (typeof window !== 'undefined') origin = window.location.origin;
	});
</script>

{#if showLink}
	<button
		type="button"
		onclick={openModal}
		class="mt-3 text-sm text-(--app-accent) transition hover:underline"
	>
		Make LibreSearch your default search engine
	</button>
{/if}

{#if bannerVisible}
	<div
		class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--app-accent)/30 bg-[color-mix(in_srgb,var(--app-accent)_8%,var(--app-card))] px-4 py-3"
		role="status"
	>
		<div class="min-w-0">
			<p class="text-sm font-medium text-(--app-text)">Search privately every time</p>
			<p class="mt-0.5 text-xs text-(--app-muted)">
				Make LibreSearch your browser’s default search engine — takes about a minute.
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<button
				type="button"
				onclick={openModal}
				class="rounded-lg bg-(--app-accent) px-3 py-1.5 text-xs font-semibold text-[#111] transition hover:opacity-90"
			>
				Set as default
			</button>
			<button
				type="button"
				onclick={dismiss}
				aria-label="Dismiss default search prompt"
				class="rounded-lg p-1.5 text-(--app-muted) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>
	</div>
{/if}

{#if showModal}
	<dialog
		bind:this={dialogEl}
		class="fixed inset-0 z-50 m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-(--app-border) bg-(--app-card) p-0 text-(--app-text) shadow-2xl shadow-black/40 backdrop:bg-black/60 open:flex open:flex-col"
		aria-labelledby="default-search-title"
		onclose={() => (showModal = false)}
	>
		<div class="border-b border-(--app-border) px-5 py-4">
			<h2 id="default-search-title" class="text-lg font-semibold">Make LibreSearch your default</h2>
			<p class="mt-1 text-sm text-(--app-muted)">
				Steps for {steps.name}
			</p>
		</div>
		<ol class="space-y-3 px-5 py-4 text-sm leading-6 text-(--app-muted)">
			{#each steps.steps as step, i (i)}
				<li class="flex gap-3">
					<span
						class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--app-accent)/15 text-xs font-semibold text-(--app-accent)"
					>
						{i + 1}
					</span>
					<span>{step}</span>
				</li>
			{/each}
		</ol>
		<div class="flex items-center justify-between gap-3 border-t border-(--app-border) px-5 py-4">
			<a href="/extension" class="text-xs text-(--app-accent) hover:underline">
				Or install the extension
			</a>
			<button
				type="button"
				onclick={dismiss}
				class="rounded-lg bg-(--app-surface) px-4 py-2 text-sm font-medium text-(--app-button) transition hover:bg-(--app-hover)"
			>
				Done
			</button>
		</div>
	</dialog>
{/if}
