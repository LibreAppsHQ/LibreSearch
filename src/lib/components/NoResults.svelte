<script lang="ts">
	import type { SearchTab } from '$lib/search';

	interface Props {
		query?: string;
		tab?: SearchTab;
	}
	let { query = '', tab = 'web' }: Props = $props();

	const tabMeta: Record<SearchTab, { label: string; icon: string }> = {
		web: { label: 'Web', icon: 'fa-magnifying-glass' },
		news: { label: 'News', icon: 'fa-newspaper' },
		videos: { label: 'Videos', icon: 'fa-play' },
		images: { label: 'Images', icon: 'fa-image' },
		shopping: { label: 'Shopping', icon: 'fa-bag-shopping' },
		maps: { label: 'Maps', icon: 'fa-location-dot' }
	};

	let others = $derived((Object.keys(tabMeta) as SearchTab[]).filter((t) => t !== tab));

	function urlFor(t: SearchTab): string {
		const params = new URLSearchParams({ q: query });
		if (t !== 'web') params.set('t', t);
		return `/search?${params}`;
	}
</script>

<div class="animate-fade-in mx-auto max-w-md py-14 text-center">
	<div
		class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--app-surface) text-(--app-muted)"
	>
		<i class="fa-solid fa-magnifying-glass text-xl"></i>
	</div>

	<h2 class="mt-5 text-lg font-semibold text-(--app-text)">
		No {tabMeta[tab].label.toLowerCase()} results{query ? ` for "${query}"` : ''}
	</h2>

	<ul class="mt-3 space-y-1 text-sm text-(--app-muted)">
		<li>Check your spelling, or try different keywords.</li>
		<li>Use fewer or more general terms.</li>
	</ul>

	<div class="mt-6">
		<p class="mb-2.5 text-xs font-medium tracking-wide text-(--app-muted) uppercase">
			Try this search in
		</p>
		<div class="flex flex-wrap justify-center gap-2">
			{#each others as t, i (i)}
				<a
					href={urlFor(t)}
					class="inline-flex items-center gap-2 rounded-full border border-(--app-border) bg-(--app-surface) px-4 py-1.5 text-sm font-medium text-(--app-text) transition hover:bg-(--app-hover)"
				>
					<i class="fa-solid {tabMeta[t].icon} text-xs text-(--app-muted)"></i>
					{tabMeta[t].label}
				</a>
			{/each}
		</div>
	</div>
</div>
