<script lang="ts">
	import type { NewsResult } from '$lib/search';
	import { settingsStore, getToggle } from '$lib/stores/settings';

	let { result } = $props<{ result: NewsResult }>();

	let openInNewTab = $derived(getToggle($settingsStore, 'open-new-tab', true));
</script>

<article class="group rounded px-1 py-1 transition hover:bg-(--app-hover)">
	<a
		href={result.url}
		target={openInNewTab ? '_blank' : '_self'}
		rel="noreferrer noopener"
		class="flex gap-4 rounded px-3 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--app-accent)/50"
	>
		{#if result.thumbnail}
			<img
				src={result.thumbnail}
				alt=""
				loading="lazy"
				decoding="async"
				class="h-[72px] w-28 shrink-0 rounded-md object-cover"
				onerror={(e) => {
					(e.currentTarget as HTMLImageElement).style.display = 'none';
				}}
			/>
		{/if}
		<div class="min-w-0 space-y-1">
			<div class="flex items-center gap-1.5 text-xs text-(--app-muted)">
				{#if result.siteName}
					<span class="font-medium">{result.siteName}</span>
				{/if}
				{#if result.siteName && result.age}
					<span>·</span>
				{/if}
				{#if result.age}
					<span>{result.age}</span>
				{/if}
			</div>
			<h2 class="line-clamp-2 leading-snug font-medium text-(--app-accent) group-hover:underline">
				{result.title}
			</h2>
			{#if result.snippet}
				<p class="line-clamp-2 text-sm leading-5 text-(--app-muted)">{result.snippet}</p>
			{/if}
		</div>
	</a>
</article>
