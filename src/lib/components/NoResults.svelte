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
		images: { label: 'Images', icon: 'fa-image' }
	};

	let others = $derived(
		(Object.keys(tabMeta) as SearchTab[]).filter((t) => t !== tab)
	);

	function urlFor(t: SearchTab): string {
		const params = new URLSearchParams({ q: query });
		if (t !== 'web') params.set('t', t);
		return `/search?${params}`;
	}
</script>

<div class="animate-fade-in mx-auto max-w-md py-14 text-center">
	<div
		class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-muted)]"
	>
		<i class="fa-solid fa-magnifying-glass text-xl"></i>
	</div>

	<h2 class="mt-5 text-lg font-semibold text-[var(--app-text)]">
		No {tabMeta[tab].label.toLowerCase()} results{query ? ` for "${query}"` : ''}
	</h2>

	<ul class="mt-3 space-y-1 text-sm text-[var(--app-muted)]">
		<li>Check your spelling, or try different keywords.</li>
		<li>Use fewer or more general terms.</li>
	</ul>

	<div class="mt-6">
		<p class="mb-2.5 text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
			Try this search in
		</p>
		<div class="flex flex-wrap justify-center gap-2">
			{#each others as t}
				<a
					href={urlFor(t)}
					class="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-1.5 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
				>
					<i class="fa-solid {tabMeta[t].icon} text-xs text-[var(--app-muted)]"></i>
					{tabMeta[t].label}
				</a>
			{/each}
		</div>
	</div>
</div>
