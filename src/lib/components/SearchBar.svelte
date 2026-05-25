<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { settingsStore, getToggle, getSelect } from '$lib/stores/settings';
	import { reducedMotion } from '$lib/stores/motion';
	import { historyStore } from '$lib/stores/history';

	let {
		query = $bindable(''),
		placeholder = 'Search the web...',
		action = '/search',
		compact = false,
		showButton = true,
		safesearch = false,
		pill = false
	} = $props<{
		query?: string;
		placeholder?: string;
		action?: string;
		compact?: boolean;
		showButton?: boolean;
		safesearch?: boolean;
		pill?: boolean;
	}>();

	let formElement: HTMLFormElement | null = null;
	let isOpen = $state(false);
	let activeIndex = $state(-1);
	let suggestions = $state<string[]>([]);
	let suggestionController: AbortController | null = null;
	let suggestionTimer: ReturnType<typeof setTimeout> | null = null;
	let suggestionNonce = 0;

	let autocompleteEnabled = $derived(getToggle($settingsStore, 'autocomplete'));
	let showSuggestionIcons = $derived(getToggle($settingsStore, 'show-suggestion-icons', false));
	let saveHistory = $derived(getToggle($settingsStore, 'save-history'));
	let filterAds = $derived(getToggle($settingsStore, 'filter-ads'));
	let blockAds = $derived(getToggle($settingsStore, 'block-ads'));
	let blockTrackers = $derived(getToggle($settingsStore, 'block-trackers'));
	let searchRegion = $derived(getSelect($settingsStore, 'search-region'));
	let enableCache = $derived(getToggle($settingsStore, 'enable-cache', false));

	let history = $derived($historyStore);

	const normalizedSuggestions = $derived.by(() => {
		const seen = new Set<string>();
		return suggestions.filter((item) => {
			const n = item.trim().toLowerCase();
			if (!n || seen.has(n)) return false;
			seen.add(n);
			return true;
		});
	});

	type DropdownItem = { type: 'history' | 'suggestion'; text: string };

	const dropdownItems = $derived.by((): DropdownItem[] => {
		if (!autocompleteEnabled) return [];
		const trimmed = query.trim();
		if (!trimmed) {
			if (!saveHistory) return [];
			return history.map((h) => ({ type: 'history' as const, text: h }));
		}
		return normalizedSuggestions.map((s) => ({ type: 'suggestion' as const, text: s }));
	});

	$effect(() => {
		if (dropdownItems.length === 0) {
			isOpen = false;
			activeIndex = -1;
		}
	});

	function openDropdown(): void {
		if (!autocompleteEnabled) return;
		isOpen = dropdownItems.length > 0;
		activeIndex = dropdownItems.length > 0 ? 0 : -1;
	}

	function closeDropdown(): void {
		isOpen = false;
		activeIndex = -1;
	}

	function submitQuery(value: string): void {
		query = value;
		closeDropdown();
		formElement?.requestSubmit();
	}

	function fetchSuggestions(value: string): void {
		const next = value.trim();

		if (suggestionTimer) clearTimeout(suggestionTimer);

		if (!next) {
			suggestionController?.abort();
			suggestions = [];
			if (autocompleteEnabled && saveHistory && history.length > 0) {
				isOpen = true;
				activeIndex = 0;
			}
			return;
		}

		if (!autocompleteEnabled) {
			closeDropdown();
			return;
		}

		suggestionTimer = setTimeout(async () => {
			const currentNonce = ++suggestionNonce;
			suggestionController?.abort();
			const controller = new AbortController();
			suggestionController = controller;

			try {
				const response = await fetch(`/api/suggest?q=${encodeURIComponent(next)}`, {
					cache: 'no-store',
					credentials: 'omit',
					headers: { accept: 'application/json' },
					signal: controller.signal
				});

				const payload = (await response.json().catch(() => null)) as string[] | null;

				if (currentNonce !== suggestionNonce || controller.signal.aborted) return;

				suggestions = Array.isArray(payload) ? payload : [];
				isOpen = suggestions.length > 0;
				activeIndex = suggestions.length > 0 ? 0 : -1;
			} catch {
				if (currentNonce !== suggestionNonce || controller.signal.aborted) return;
				suggestions = [];
				closeDropdown();
			}
		}, 180);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (!isOpen || dropdownItems.length === 0) {
			if (event.key === 'ArrowDown' && autocompleteEnabled) {
				openDropdown();
				event.preventDefault();
			}
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % dropdownItems.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = activeIndex <= 0 ? dropdownItems.length - 1 : activeIndex - 1;
		} else if (event.key === 'Escape') {
			event.preventDefault();
			closeDropdown();
		} else if (event.key === 'Enter' && activeIndex >= 0) {
			event.preventDefault();
			submitQuery(dropdownItems[activeIndex].text);
		}
	}

	function removeHistory(item: string, event: MouseEvent): void {
		event.preventDefault();
		event.stopPropagation();
		historyStore.remove(item);
	}

	onMount(() => {
		historyStore.load();
		return () => {
			suggestionController?.abort();
			if (suggestionTimer) clearTimeout(suggestionTimer);
		};
	});
</script>

<form bind:this={formElement} class="w-full" method="get" {action}>
	<!-- Honeypot: bots fill this, humans don't -->
	<input type="text" name="website" value="" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;" />
	{#if safesearch}
		<input type="hidden" name="safe" value="1" />
	{/if}
	{#if filterAds}
		<input type="hidden" name="filterads" value="1" />
	{/if}
	{#if blockAds}
		<input type="hidden" name="blockads" value="1" />
	{/if}
	{#if blockTrackers}
		<input type="hidden" name="blocktrackers" value="1" />
	{/if}
	{#if searchRegion}
		<input type="hidden" name="region" value={searchRegion} />
	{/if}
	{#if enableCache}
		<input type="hidden" name="enablecache" value="1" />
	{/if}

	<div
		class={pill
			? 'flex w-full items-center rounded-full border border-indigo-400/60 bg-transparent px-5 py-2.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20'
			: compact
				? 'flex w-full items-center rounded-xl border border-[var(--app-border)] bg-transparent px-4 py-1.5 transition focus-within:border-slate-500/60 focus-within:ring-2 focus-within:ring-slate-500/20'
				: 'flex w-full items-center rounded-xl border border-[var(--app-border)] bg-transparent px-5 py-2 transition focus-within:border-slate-500/60 focus-within:ring-2 focus-within:ring-slate-500/20'}
	>
		<input
			bind:value={query}
			name="q"
			type="search"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			enterkeyhint="search"
			{placeholder}
			class={pill
				? 'min-w-0 flex-1 bg-transparent pr-3 text-lg text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:outline-none'
				: compact
					? 'min-w-0 flex-1 bg-transparent pr-2.5 text-base text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:outline-none sm:text-[17px]'
					: 'min-w-0 flex-1 bg-transparent pr-3 text-lg text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:outline-none sm:text-xl'}
			onfocus={openDropdown}
			oninput={(event) => fetchSuggestions((event.currentTarget as HTMLInputElement).value)}
			onblur={() => setTimeout(closeDropdown, 150)}
			onkeydown={handleKeydown}
		/>

		<div class="ml-2 flex shrink-0 items-center gap-2">
			{#if query}
				<button
					type="button"
					aria-label="Clear search"
					onclick={() => {
						query = '';
						suggestions = [];
						document.querySelector<HTMLInputElement>('input[name="q"]')?.focus();
					}}
					class="inline-flex h-7 w-7 items-center justify-center text-[var(--app-muted)] transition hover:text-[var(--app-text)] focus-visible:outline-none"
				>
					<i class="fa-solid fa-xmark text-[15px]"></i>
				</button>
			{/if}

			{#if query && showButton}
				<span class="h-5 w-px bg-[var(--app-border)]"></span>
			{/if}

			{#if showButton}
				<button
					type="submit"
					aria-label="Search"
					class="inline-flex h-7 w-7 items-center justify-center text-[var(--app-accent)] transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
				>
					<i class="fa-solid fa-magnifying-glass text-[15px]"></i>
				</button>
			{/if}
		</div>
	</div>

	{#if isOpen && dropdownItems.length > 0}
		<div class="relative">
			<div
				class="absolute left-0 right-0 top-2 z-20 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] shadow-2xl shadow-black/30"
				transition:fly={{ y: -6, duration: $reducedMotion ? 0 : 160, easing: cubicOut }}
			>
				{#each dropdownItems as item, index}
					<div
						class={index === activeIndex
							? 'flex w-full items-center gap-3 bg-[var(--app-surface)] px-4 py-2.5'
							: 'flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[var(--app-hover)]'}
					>
						<button
							type="button"
							class="flex min-w-0 flex-1 items-center gap-3 text-left"
							onmousedown={(event) => {
								event.preventDefault();
								submitQuery(item.text);
							}}
							onmouseenter={() => (activeIndex = index)}
						>
							{#if showSuggestionIcons}
								<i
									class={item.type === 'history'
										? 'fa-solid fa-clock-rotate-left shrink-0 text-xs text-[var(--app-muted)]'
										: 'fa-solid fa-magnifying-glass shrink-0 text-xs text-[var(--app-muted)]'}
								></i>
							{/if}
							<span
								class={index === activeIndex
									? 'truncate text-sm text-[var(--app-text)]'
									: 'truncate text-sm text-[var(--app-muted)]'}>{item.text}</span
							>
						</button>

						{#if item.type === 'history'}
							<button
								type="button"
								aria-label="Remove from history"
								class="ml-auto shrink-0 text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								onmousedown={(event) => removeHistory(item.text, event)}
							>
								<i class="fa-solid fa-xmark text-xs"></i>
							</button>
						{/if}
					</div>
				{/each}

				{#if dropdownItems.some((i) => i.type === 'history')}
					<div class="border-t border-[var(--app-border)] px-4 py-2">
						<button
							type="button"
							class="text-xs text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
							onmousedown={(event) => {
								event.preventDefault();
								historyStore.clear();
							}}
						>
							Clear history
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</form>

<style>
	/* Hide the browser's native clear button on type="search" inputs */
	input[type='search']::-webkit-search-cancel-button,
	input[type='search']::-webkit-search-decoration {
		-webkit-appearance: none;
		appearance: none;
	}
</style>
