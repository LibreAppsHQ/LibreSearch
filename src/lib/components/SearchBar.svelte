<script lang="ts">
import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { settingsStore, getToggle, getSelect, ecoActive } from '$lib/stores/settings';
	import { reducedMotion } from '$lib/stores/motion';
	import { historyStore } from '$lib/stores/history';

	let {
		query = $bindable(''),
		placeholder = 'Search the web...',
		action = '/search',
		compact = false,
		showButton = true,
		safesearch = 'moderate',
		pill = false,
		autoFocus = false
	} = $props<{
		query?: string;
		placeholder?: string;
		action?: string;
		compact?: boolean;
		showButton?: boolean;
		safesearch?: 'strict' | 'moderate' | 'low';
		pill?: boolean;
		autoFocus?: boolean;
	}>();

	let formElement: HTMLFormElement | null = null;
	let inputElement: HTMLInputElement | null = null;
	let isOpen = $state(false);
	let activeIndex = $state(-1);
	// True only when the highlighted item was reached via arrow keys. Enter submits
	// a suggestion only in that case — never a mouse-hover or auto-preselected one -
	// so typing "ca" + Enter searches "ca", not the highlighted "canva".
	let keyboardSelected = $state(false);
	let suggestions = $state<string[]>([]);
	let suggestionController: AbortController | null = null;
	let suggestionTimer: ReturnType<typeof setTimeout> | null = null;
	let suggestionNonce = 0;

	let autocompleteEnabled = $derived(getToggle($settingsStore, 'autocomplete'));
	let skipSuggestions = $derived(ecoActive($settingsStore, 'eco-skip-suggestions'));
	let showSuggestionIcons = $derived(getToggle($settingsStore, 'show-suggestion-icons', false));
	let saveHistory = $derived(getToggle($settingsStore, 'save-history'));
	let filterAds = $derived(getToggle($settingsStore, 'filter-ads'));
	let blockAds = $derived(getToggle($settingsStore, 'block-ads'));
	let blockTrackers = $derived(getToggle($settingsStore, 'block-trackers'));
	let searchRegion = $derived(getSelect($settingsStore, 'search-region'));
	let enableCache = $derived(getToggle($settingsStore, 'enable-cache', false));
	let resultsPerPage = $derived(getSelect($settingsStore, 'results-per-page', '10'));
	let capResults = $derived(ecoActive($settingsStore, 'eco-cap-results'));
	let useLocalRegion = $derived(ecoActive($settingsStore, 'eco-local-results'));
	let qualityMode = $derived(getToggle($settingsStore, 'quality-mode', false));

	function browserRegion(): string {
		if (typeof navigator === 'undefined') return '';
		const match = navigator.language.match(/-([A-Za-z]{2})$/);
		return match ? match[1].toUpperCase() : '';
	}

	let effectiveRegion = $derived(searchRegion || (useLocalRegion ? browserRegion() : ''));
	let effectiveResultsPerPage = $derived(capResults ? '10' : resultsPerPage);
	let requestMethod = $derived<'get' | 'post'>(
		getSelect($settingsStore, 'request-method', 'GET') === 'POST' ? 'post' : 'get'
	);

	let history = $derived($historyStore);

	// Use a stable key for deduplication to avoid creating new Sets on every keystroke
	const normalizedSuggestions = $derived.by(() => {
		// Only recompute when suggestions array reference changes, not on every keystroke
		if (suggestions.length === 0) return [];
		const seen = new Set<string>();
		const result: string[] = [];
		for (const item of suggestions) {
			const n = item.trim().toLowerCase();
			if (!n || seen.has(n)) continue;
			seen.add(n);
			result.push(item);
		}
		return result;
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

	let hasHistory = $derived(dropdownItems.some((i) => i.type === 'history'));

	$effect(() => {
		if (dropdownItems.length === 0) {
			isOpen = false;
			activeIndex = -1;
			keyboardSelected = false;
		}
	});

	function openDropdown(): void {
		if (!autocompleteEnabled) return;
		isOpen = dropdownItems.length > 0;
		activeIndex = -1;
		keyboardSelected = false;
	}

	function handleFocus(): void {
		// On the results page the query is pre-filled — only show the dropdown
		// after the user starts typing, not on every focus/navigation.
		if (query.trim()) return;
		openDropdown();
	}

	function closeDropdown(): void {
		isOpen = false;
		activeIndex = -1;
		keyboardSelected = false;
	}

	function submitQuery(value: string): void {
		query = value;
		// Reflect the choice in the DOM input immediately so the form serializes the
		// selected text (not what was typed) — a reactive flush would land too late.
		// Done synchronously so the submit stays within the original click gesture.
		if (inputElement) inputElement.value = value;
		closeDropdown();
		formElement?.requestSubmit();
	}

	// Put a suggestion in the box (without searching) so the user can keep typing.
	function appendQuery(value: string): void {
		query = value.endsWith(' ') ? value : `${value} `;
		inputElement?.focus();
		fetchSuggestions(query);
	}

	// Split a suggestion into the already-typed prefix and the completion, so the
	// completion can be emphasised (Google-style).
	function splitMatch(text: string): { typed: string; rest: string } {
		const q = query.trim().toLowerCase();
		if (q && text.toLowerCase().startsWith(q)) {
			return { typed: text.slice(0, q.length), rest: text.slice(q.length) };
		}
		return { typed: '', rest: text };
	}

	function fetchSuggestions(value: string): void {
		const next = value.trim();

		if (suggestionTimer) clearTimeout(suggestionTimer);

		if (skipSuggestions) {
			suggestionController?.abort();
			suggestionController = null;
			suggestions = [];
			closeDropdown();
			return;
		}

		if (!next) {
			suggestionController?.abort();
			suggestionController = null;
			suggestions = [];
			keyboardSelected = false;
			if (autocompleteEnabled && saveHistory && history.length > 0) {
				isOpen = true;
				activeIndex = -1;
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
				// Don't preselect a suggestion: Enter should search exactly what the
				// user typed. A suggestion is only submitted if they arrow down to it.
				activeIndex = -1;
				keyboardSelected = false;
			} catch {
				if (currentNonce !== suggestionNonce || controller.signal.aborted) return;
				suggestions = [];
				closeDropdown();
			} finally {
				// Clean up controller reference after fetch completes
				if (suggestionController === controller) {
					suggestionController = null;
				}
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
			keyboardSelected = true;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = activeIndex <= 0 ? dropdownItems.length - 1 : activeIndex - 1;
			keyboardSelected = true;
		} else if (event.key === 'Escape') {
			event.preventDefault();
			closeDropdown();
		} else if (
			event.key === 'Tab' &&
			activeIndex >= 0 &&
			dropdownItems[activeIndex].type === 'suggestion'
		) {
			// Tab completes the highlighted suggestion into the box without searching.
			event.preventDefault();
			appendQuery(dropdownItems[activeIndex].text);
		} else if (event.key === 'Enter' && activeIndex >= 0 && keyboardSelected) {
			// Only a keyboard-navigated highlight wins on Enter; a hover-highlighted
			// item is ignored so Enter submits exactly what was typed.
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
		if (autoFocus) inputElement?.focus();
		return () => {
			suggestionController?.abort();
			if (suggestionTimer) clearTimeout(suggestionTimer);
		};
	});
</script>

<form
	bind:this={formElement}
	class="w-full"
	method={requestMethod}
	{action}
	onsubmit={() => {
		closeDropdown();
		suggestions = [];
	}}
>
	<!-- Honeypot: bots fill this, humans don't -->
	<input
		type="text"
		name="website"
		value=""
		tabindex="-1"
		autocomplete="off"
		aria-hidden="true"
		style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;"
	/>
	{#if safesearch !== 'moderate'}
		<input type="hidden" name="safe" value={safesearch} />
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
	{#if effectiveRegion}
		<input type="hidden" name="region" value={effectiveRegion} />
	{/if}
	{#if enableCache}
		<input type="hidden" name="enablecache" value="1" />
	{/if}
	{#if effectiveResultsPerPage === '20'}
		<input type="hidden" name="count" value="20" />
	{/if}
	{#if qualityMode}
		<input type="hidden" name="qualitymode" value="1" />
	{/if}

	<div
		class={pill
			? 'flex w-full items-center rounded-full border border-indigo-400/60 bg-transparent px-5 py-2.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20'
			: compact
				? `flex w-full items-center rounded-t-[26px] border border-transparent bg-(--app-elevated) px-5 py-3 transition ${isOpen ? 'rounded-b-none' : 'rounded-b-[26px] focus-within:ring-2 focus-within:ring-slate-500/20'}`
				: `flex w-full items-center border border-(--app-border) px-5 py-2 transition focus-within:ring-2 focus-within:ring-slate-500/20 ${isOpen ? 'rounded-t-xl border-b-0 bg-(--app-elevated)' : 'rounded-xl bg-transparent focus-within:border-slate-500/60'}`}
	>
		<input
			bind:this={inputElement}
			bind:value={query}
			name="q"
			type="search"
			autocomplete="off"
			autocapitalize="off"
			autocorrect="off"
			spellcheck="false"
			enterkeyhint="search"
			{placeholder}
			class={pill
				? 'min-w-0 flex-1 bg-transparent pr-3 text-lg text-(--app-text) placeholder:text-(--app-muted) focus:outline-none'
				: compact
					? 'min-w-0 flex-1 bg-transparent pr-2.5 text-base text-(--app-text) placeholder:text-(--app-muted) focus:outline-none sm:text-[17px]'
					: 'min-w-0 flex-1 bg-transparent pr-3 text-lg text-(--app-text) placeholder:text-(--app-muted) focus:outline-none sm:text-xl'}
			onfocus={handleFocus}
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
					class="inline-flex h-7 w-7 items-center justify-center text-(--app-muted) transition hover:text-(--app-button-hover) focus-visible:outline-none"
				>
					<i class="fa-solid fa-xmark text-[15px]"></i>
				</button>
			{/if}

			{#if query && showButton}
				<span class="h-5 w-px bg-(--app-border)"></span>
			{/if}

			{#if showButton}
				<button
					type="submit"
					aria-label="Search"
					class="inline-flex h-7 w-7 items-center justify-center text-(--app-accent) transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:outline-none"
				>
					<i class="fa-solid fa-magnifying-glass text-[15px]"></i>
				</button>
			{/if}
		</div>
	</div>

	{#if isOpen && dropdownItems.length > 0}
		<div class="relative">
			<div
				class={`absolute right-0 left-0 z-20 overflow-hidden shadow-2xl shadow-black/40 ${compact ? 'top-0 rounded-b-2xl border-t border-(--app-border)/60 bg-(--app-elevated) pt-1.5 pb-3' : pill ? 'top-4 rounded-2xl border border-(--app-border) bg-(--app-elevated) py-2' : 'top-0 rounded-b-xl border-x border-b border-(--app-border) bg-(--app-elevated) pb-2'}`}
				transition:fly={{ y: -6, duration: $reducedMotion ? 0 : 160, easing: cubicOut }}
			>
				{#if hasHistory}
					<div class="flex items-center justify-between px-3 pt-1 pb-2">
						<span class="text-[11px] font-semibold tracking-wider text-(--app-muted) uppercase">
							Recent searches
						</span>
						<button
							type="button"
							class="text-[11px] font-medium text-(--app-muted) transition hover:text-(--app-accent)"
							onmousedown={(event) => {
								event.preventDefault();
								historyStore.clear();
							}}
						>
							Clear all
						</button>
					</div>
				{/if}

				{#each dropdownItems as item, index (item.type + item.text)}
					{@const m = splitMatch(item.text)}
					<div
						class={index === activeIndex
							? 'group flex w-full items-center gap-3 rounded-md bg-(--app-surface) px-3 py-2.5'
							: 'group flex w-full items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-(--app-hover)'}
					>
						{#if item.type === 'history' || showSuggestionIcons}
							<i
								class={item.type === 'history'
									? 'fa-regular fa-clock w-4 shrink-0 text-center text-xs text-(--app-muted)'
									: 'fa-solid fa-magnifying-glass w-4 shrink-0 text-center text-xs text-(--app-muted)'}
							></i>
						{/if}

						<button
							type="button"
							class="flex min-w-0 flex-1 items-center text-left"
							onmousedown={(event) => {
								event.preventDefault();
								submitQuery(item.text);
							}}
							onmouseenter={() => {
								activeIndex = index;
								keyboardSelected = false;
							}}
						>
							<span class="truncate text-[15px]">
								<span class="text-(--app-muted)">{m.typed}</span><span
									class={m.typed ? 'font-medium text-(--app-text)' : 'text-(--app-text)'}
									>{m.rest}</span
								>
							</span>
						</button>

						{#if item.type === 'history'}
							<button
								type="button"
								aria-label="Remove “{item.text}” from history"
								class="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-(--app-muted) opacity-0 transition group-hover:opacity-100 hover:bg-(--app-hover) hover:text-(--app-button-hover) focus-visible:opacity-100"
								onmousedown={(event) => removeHistory(item.text, event)}
							>
								<i class="fa-solid fa-xmark text-xs"></i>
							</button>
						{:else}
							<button
								type="button"
								aria-label="Add “{item.text}” to the search box"
								title="Append to search"
								class="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-(--app-muted) opacity-0 transition group-hover:opacity-100 hover:bg-(--app-hover) hover:text-(--app-button-hover) focus-visible:opacity-100"
								onmousedown={(event) => {
									event.preventDefault();
									appendQuery(item.text);
								}}
							>
								<i class="fa-solid fa-arrow-up -rotate-45 text-xs"></i>
							</button>
						{/if}
					</div>
				{/each}
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
