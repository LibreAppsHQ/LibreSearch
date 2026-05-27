<script lang="ts">
	import type { SearchTab } from '$lib/search';
	import { settingsStore, getSelect } from '$lib/stores/settings';

	let { current, query, freshness } = $props<{
		current: SearchTab;
		query: string;
		freshness?: string;
	}>();

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
		const params = new URLSearchParams({ q: query });
		if (tabId !== 'web') params.set('t', tabId);
		if (freshness) params.set('f', freshness);
		return `/search?${params}`;
	}

	function tabClass(tabId: SearchTab): string {
		return current === tabId
			? 'flex items-center border-b-2 border-[var(--app-accent)] px-3 pt-1 pb-2.5 text-sm font-medium text-[var(--app-accent)]'
			: 'flex items-center border-b-2 border-transparent px-3 pt-1 pb-2.5 text-sm font-medium text-[var(--app-muted)] transition hover:text-[var(--app-accent)]';
	}
</script>

<nav class="flex items-center gap-0.5" aria-label="Search type">
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
</nav>
