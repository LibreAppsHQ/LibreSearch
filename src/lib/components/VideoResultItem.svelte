<script lang="ts">
	import type { VideoResult } from '$lib/search';
	import { settingsStore, getToggle } from '$lib/stores/settings';

	let { result, onselect } = $props<{
		result: VideoResult;
		onselect?: (v: VideoResult) => void;
	}>();

	let openInNewTab = $derived(getToggle($settingsStore, 'open-new-tab', true));
</script>

<article
	class="group overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-panel)/30 transition hover:border-(--app-border)"
>
	<a
		href={result.url}
		target={openInNewTab ? '_blank' : '_self'}
		rel="noreferrer noopener"
		class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-(--app-accent)/50"
		onclick={onselect
			? (e) => {
					e.preventDefault();
					onselect!(result);
				}
			: undefined}
	>
		<div class="relative aspect-video bg-black/30">
			{#if result.thumbnail}
				<img
					src={result.thumbnail}
					alt={result.title}
					loading="lazy"
					decoding="async"
					class="h-full w-full object-cover"
					onerror={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = 'none';
					}}
				/>
			{/if}
			{#if result.duration}
				<span
					class="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white"
				>
					{result.duration}
				</span>
			{/if}
			<div
				class="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
				>
					<i class="fa-solid fa-play text-sm"></i>
				</div>
			</div>
		</div>
		<div class="space-y-1 p-3">
			<h2
				class="line-clamp-2 text-sm leading-snug font-medium text-(--app-text) group-hover:text-(--app-accent)"
			>
				{result.title}
			</h2>
			<div class="flex items-center gap-1.5 text-xs text-(--app-muted)">
				{#if result.publisher}
					<span>{result.publisher}</span>
				{/if}
				{#if result.views}
					<span>·</span><span>{result.views}</span>
				{/if}
				{#if result.age}
					<span>·</span><span>{result.age}</span>
				{/if}
			</div>
		</div>
	</a>
</article>
