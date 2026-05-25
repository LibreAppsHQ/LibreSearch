<script lang="ts">
	import type { SearchTab } from '$lib/search';

	let {
		current,
		query,
		freshness
	} = $props<{ current: SearchTab; query: string; freshness?: string }>();

	const tabs: Array<{ id: SearchTab; label: string }> = [
		{ id: 'web', label: 'All' },
		{ id: 'images', label: 'Images' },
		{ id: 'videos', label: 'Videos' },
		{ id: 'news', label: 'News' }
	];

	function tabHref(tabId: SearchTab): string {
		const params = new URLSearchParams({ q: query });
		if (tabId !== 'web') params.set('t', tabId);
		if (freshness) params.set('f', freshness);
		return `/search?${params}`;
	}
</script>

<nav class="flex items-center gap-0.5" aria-label="Search type">
	{#each tabs as tab (tab.id)}
		<a
			href={tabHref(tab.id)}
			class={current === tab.id
				? 'flex items-center border-b-2 border-[var(--app-accent)] px-3 pb-2.5 pt-1 text-sm font-medium text-[var(--app-accent)]'
				: 'flex items-center border-b-2 border-transparent px-3 pb-2.5 pt-1 text-sm font-medium text-[var(--app-muted)] transition hover:text-[var(--app-accent)]'}
		>
			{tab.label}
		</a>
	{/each}
</nav>
