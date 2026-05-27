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
	class="group overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)]/30 transition hover:border-[var(--app-border)]"
>
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<a
		href={result.url}
		target={openInNewTab ? '_blank' : '_self'}
		rel="noreferrer noopener"
		class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/50"
		onclick={onselect ? (e) => { e.preventDefault(); onselect!(result); } : undefined}
	>
		<div class="relative aspect-video bg-black/30">
			{#if result.thumbnail}
				<img
					src={result.thumbnail}
					alt={result.title}
					class="h-full w-full object-cover"
					onerror={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = 'none';
					}}
				/>
			{/if}
			{#if result.duration}
				<span
					class="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white"
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
			<h2 class="text-sm font-medium leading-snug text-[var(--app-text)] line-clamp-2 group-hover:text-[var(--app-accent)]">
				{result.title}
			</h2>
			<div class="flex items-center gap-1.5 text-xs text-[var(--app-muted)]">
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
