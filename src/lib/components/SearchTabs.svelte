<script lang="ts">
	import type { SearchTab } from '$lib/search';
	import { settingsStore, getSelect, getToggle } from '$lib/stores/settings';

	let { current, query, freshness, filtersOpen, ontogglefilters } = $props<{
		current: SearchTab;
		query: string;
		freshness?: string;
		filtersOpen?: boolean;
		ontogglefilters?: () => void;
	}>();

	let aiAnswersEnabled = $derived(getToggle($settingsStore, 'ai-answers', false));

	const tabs: Array<{ id: SearchTab; label: string }> = [
		{ id: 'web', label: 'All' },
		{ id: 'images', label: 'Images' },
		{ id: 'videos', label: 'Videos' },
		{ id: 'news', label: 'News' },
		{ id: 'shopping', label: 'Shopping' },
		{ id: 'maps', label: 'Maps' }
	];

	// POST keeps the query out of the URL, so tabs become form submits rather than links.
	let isPost = $derived(getSelect($settingsStore, 'request-method', 'GET') === 'POST');

	function tabHref(tabId: SearchTab): string {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- transient, not reactive state
		const params = new URLSearchParams({ q: query });
		if (tabId !== 'web') params.set('t', tabId);
		if (freshness) params.set('f', freshness);
		return `/search?${params}`;
	}

	function tabClass(tabId: SearchTab): string {
		return current === tabId
			? 'flex items-center border-b-2 border-(--app-accent) px-3 pt-1 pb-2.5 text-sm font-medium text-(--app-accent)'
			: 'flex items-center border-b-2 border-transparent px-3 pt-1 pb-2.5 text-sm font-medium text-(--app-muted) transition hover:text-(--app-accent)';
	}
</script>

<nav class="flex w-full max-w-3xl items-center gap-0.5" aria-label="Search type">
	<!-- AI Mode tab - commented out for now
	{#if aiAnswersEnabled}
		{#if isPost}
			<form method="POST" action="/search">
				<input type="hidden" name="q" value={query} />
				<input type="hidden" name="t" value="ai" />
				{#if freshness}<input type="hidden" name="f" value={freshness} />{/if}
				<button type="submit" class={tabClass('ai')}>AI Mode</button>
			</form>
		{:else}
			<a href={tabHref('ai')} class={tabClass('ai')}>AI Mode</a>
		{/if}
	{/if}
	-->

	{#each tabs as tab (tab.id)}
		{#if isPost}
			<form method="POST" action="/search">
				<input type="hidden" name="q" value={query} />
				{#if tab.id !== 'web'}<input type="hidden" name="t" value={tab.id} />{/if}
				{#if freshness}<input type="hidden" name="f" value={freshness} />{/if}
				<button type="submit" class={tabClass(tab.id)}>{tab.label}</button>
			</form>
		{:else}
			<a href={tabHref(tab.id)} class={tabClass(tab.id)}>{tab.label}</a>
		{/if}
	{/each}

	{#if ontogglefilters}
		<button
			type="button"
			onclick={ontogglefilters}
			aria-label="Toggle filters"
			aria-pressed={filtersOpen}
			title="Filters"
			class="mr-4 mb-1.5 ml-auto flex shrink-0 items-center px-2.5 py-1.5 text-sm transition {filtersOpen
				? 'border-(--app-accent) text-(--app-accent)'
				: 'border-transparent text-(--app-muted) hover:text-(--app-accent)'}"
		>
			<i class="fa-solid fa-sliders"></i>
		</button>
	{/if}
</nav>
