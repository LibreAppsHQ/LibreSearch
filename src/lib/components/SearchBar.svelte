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
		safesearch = 'moderate',
		pill = false
	} = $props<{
		query?: string;
		placeholder?: string;
		action?: string;
		compact?: boolean;
		showButton?: boolean;
		safesearch?: 'strict' | 'moderate' | 'low';
		pill?: boolean;
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
	let showSuggestionIcons = $derived(getToggle($settingsStore, 'show-suggestion-icons', false));
	let saveHistory = $derived(getToggle($settingsStore, 'save-history'));
	let filterAds = $derived(getToggle($settingsStore, 'filter-ads'));
	let blockAds = $derived(getToggle($settingsStore, 'block-ads'));
	let blockTrackers = $derived(getToggle($settingsStore, 'block-trackers'));
	let searchRegion = $derived(getSelect($settingsStore, 'search-region'));
	let enableCache = $derived(getToggle($settingsStore, 'enable-cache', false));
	let routeTor = $derived(getToggle($settingsStore, 'route-tor', false));
	let resultsPerPage = $derived(getSelect($settingsStore, 'results-per-page', '10'));
	let requestMethod = $derived<'get' | 'post'>(
		getSelect($settingsStore, 'request-method', 'GET') === 'POST' ? 'post' : 'get'
	);

	let history = $derived($historyStore);

	// Tor circuit viewer — the dropdown next to the search bar that shows which
	// guard/middle/exit relays our searches are travelling through.
	type TorHop = {
		role: 'guard' | 'middle' | 'exit';
		nickname: string;
		fingerprint: string;
		ip: string | null;
		country: string | null;
	};
	let circuitOpen = $state(false);
	let circuitLoading = $state(false);
	let circuitConfigured = $state(true);
	let circuitHops = $state<TorHop[]>([]);
	let circuitError = $state(false);

	async function loadCircuit() {
		circuitLoading = true;
		circuitError = false;
		try {
			const res = await fetch('/api/tor/circuit', { cache: 'no-store' });
			const data = (await res.json().catch(() => null)) as {
				configured?: boolean;
				circuit?: { hops?: TorHop[] } | null;
			} | null;
			circuitConfigured = data?.configured ?? false;
			circuitHops = data?.circuit?.hops ?? [];
			if (circuitConfigured && circuitHops.length === 0) circuitError = true;
		} catch {
			circuitError = true;
			circuitHops = [];
		} finally {
			circuitLoading = false;
		}
	}

	function toggleCircuit() {
		circuitOpen = !circuitOpen;
		if (circuitOpen) void loadCircuit();
	}

	const flagEmoji = (cc: string | null) => {
		if (!cc || cc.length !== 2) return '🌐';
		return String.fromCodePoint(
			...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
		);
	};

	const roleLabel: Record<TorHop['role'], string> = {
		guard: 'Guard (entry)',
		middle: 'Middle',
		exit: 'Exit'
	};

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

		if (!next) {
			suggestionController?.abort();
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
				const suggestUrl =
					`/api/suggest?q=${encodeURIComponent(next)}` + (routeTor ? '&tor=1' : '');
				const response = await fetch(suggestUrl, {
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
		return () => {
			suggestionController?.abort();
			if (suggestionTimer) clearTimeout(suggestionTimer);
		};
	});
</script>

<form bind:this={formElement} class="w-full" method={requestMethod} {action}>
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
	{#if searchRegion}
		<input type="hidden" name="region" value={searchRegion} />
	{/if}
	{#if enableCache}
		<input type="hidden" name="enablecache" value="1" />
	{/if}
	{#if resultsPerPage === '20'}
		<input type="hidden" name="count" value="20" />
	{/if}
	{#if routeTor}
		<input type="hidden" name="tor" value="1" />
	{/if}

	<div
		class={pill
			? 'flex w-full items-center rounded-full border border-indigo-400/60 bg-transparent px-5 py-2.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20'
			: compact
				? 'flex w-full items-center rounded-full border border-transparent bg-(--app-elevated) px-5 py-3 transition focus-within:ring-2 focus-within:ring-slate-500/20'
				: 'flex w-full items-center rounded-xl border border-(--app-border) bg-transparent px-5 py-2 transition focus-within:border-slate-500/60 focus-within:ring-2 focus-within:ring-slate-500/20'}
	>
		{#if routeTor}
			<button
				type="button"
				aria-label="View Tor circuit"
				aria-expanded={circuitOpen}
				title="View Tor circuit"
				onclick={toggleCircuit}
				class="mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--app-accent) transition hover:bg-(--app-accent)/15 focus-visible:outline-none"
			>
				<i class="fa-solid fa-circle-nodes text-[15px]"></i>
			</button>
		{/if}

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
					class="inline-flex h-7 w-7 items-center justify-center text-(--app-muted) transition hover:text-(--app-text) focus-visible:outline-none"
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

	{#if routeTor && circuitOpen}
		<div class="relative">
			<div
				class="absolute top-2 right-0 left-0 z-30 overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-elevated) p-4 shadow-2xl ring-1 shadow-black/40 ring-black/5"
				transition:fly={{ y: -6, duration: $reducedMotion ? 0 : 160, easing: cubicOut }}
			>
				<div class="mb-3 flex items-center justify-between">
					<span class="flex items-center gap-2 text-sm font-semibold text-(--app-text)">
						<i class="fa-solid fa-circle-nodes text-(--app-accent)"></i>
						Tor circuit
					</span>
					<button
						type="button"
						aria-label="Close"
						onclick={() => (circuitOpen = false)}
						class="inline-flex h-6 w-6 items-center justify-center rounded text-(--app-muted) transition hover:text-(--app-text)"
					>
						<i class="fa-solid fa-xmark text-xs"></i>
					</button>
				</div>

				{#if circuitLoading}
					<p class="px-1 py-3 text-sm text-(--app-muted)">
						<i class="fa-solid fa-spinner fa-spin mr-2"></i>Reading circuit…
					</p>
				{:else if !circuitConfigured}
					<p class="px-1 py-2 text-sm text-(--app-muted)">
						The Tor control port isn't available, so the live circuit can't be shown. Searches still
						route through Tor.
					</p>
				{:else if circuitError || circuitHops.length === 0}
					<p class="px-1 py-2 text-sm text-(--app-muted)">
						No active circuit found yet. Run a search, then reopen this.
					</p>
				{:else}
					<p class="mb-3 px-1 text-xs text-(--app-muted)">
						Your request travels through these relays before reaching the search provider.
					</p>
					<ol class="space-y-1">
						<li class="flex items-center gap-3 px-1 py-1.5 text-sm text-(--app-muted)">
							<span class="flex h-7 w-7 items-center justify-center text-(--app-accent)">
								<i class="fa-solid fa-desktop"></i>
							</span>
							<span>This device</span>
						</li>
						{#each circuitHops as hop, i (hop.fingerprint)}
							<li
								class="flex items-center gap-3 rounded-lg px-1 py-1.5"
								class:bg-transparent={true}
							>
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--app-accent)/15 text-xs font-semibold text-(--app-accent)"
									>{i + 1}</span
								>
								<span class="text-lg leading-none">{flagEmoji(hop.country)}</span>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-(--app-text)">
										{hop.nickname}
										<span class="ml-1 text-[11px] font-normal text-(--app-muted)"
											>{roleLabel[hop.role]}</span
										>
									</p>
									<p class="truncate text-[11px] text-(--app-muted)">
										{hop.country ?? '??'} · {hop.ip ?? 'unknown IP'}
									</p>
								</div>
							</li>
						{/each}
						<li class="flex items-center gap-3 px-1 py-1.5 text-sm text-(--app-muted)">
							<span class="flex h-7 w-7 items-center justify-center text-emerald-400">
								<i class="fa-solid fa-globe"></i>
							</span>
							<span>Search provider</span>
						</li>
					</ol>
					<button
						type="button"
						onclick={loadCircuit}
						class="mt-3 inline-flex items-center gap-2 text-xs font-medium text-(--app-accent) hover:underline"
					>
						<i class="fa-solid fa-rotate text-[11px]"></i>Refresh
					</button>
				{/if}
			</div>
		</div>
	{/if}

	{#if isOpen && dropdownItems.length > 0}
		<div class="relative">
			<div
				class="absolute top-2 right-0 left-0 z-20 overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-elevated) p-2 shadow-2xl ring-1 shadow-black/40 ring-black/5"
				transition:fly={{ y: -6, duration: $reducedMotion ? 0 : 160, easing: cubicOut }}
			>
				{#if hasHistory}
					<div class="flex items-center justify-between px-3 pt-1 pb-2">
						<span
							class="text-[11px] font-semibold tracking-wider text-(--app-muted) uppercase"
						>
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
							? 'group flex w-full items-center gap-3 rounded-xl bg-(--app-surface) px-3 py-2.5'
							: 'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-(--app-hover)'}
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
								class="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-(--app-muted) opacity-0 transition group-hover:opacity-100 hover:bg-(--app-hover) hover:text-(--app-text) focus-visible:opacity-100"
								onmousedown={(event) => removeHistory(item.text, event)}
							>
								<i class="fa-solid fa-xmark text-xs"></i>
							</button>
						{:else}
							<button
								type="button"
								aria-label="Add “{item.text}” to the search box"
								title="Append to search"
								class="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-(--app-muted) opacity-0 transition group-hover:opacity-100 hover:bg-(--app-hover) hover:text-(--app-text) focus-visible:opacity-100"
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
