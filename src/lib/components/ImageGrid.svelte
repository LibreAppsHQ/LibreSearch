<script lang="ts">
	import type { ImageResult } from '$lib/search';
	import { settingsStore, getToggle } from '$lib/stores/settings';

	let { images } = $props<{ images: ImageResult[] }>();

	let openInNewTab = $derived(getToggle($settingsStore, 'open-new-tab'));

	const ROW_HEIGHT = 230;

	function ratio(image: ImageResult): number {
		if (image.width && image.height && image.height > 0) {
			return Math.min(Math.max(image.width / image.height, 0.5), 2.5);
		}
		return 1.5;
	}

	function domain(image: ImageResult): string {
		try {
			return new URL(image.url).hostname.replace(/^www\./, '');
		} catch {
			return image.source ?? '';
		}
	}
</script>

<div class="flex flex-wrap gap-x-3 gap-y-6">
	{#each images as image (image.imageUrl)}
		{@const r = ratio(image)}
		<a
			href={image.url}
			target={openInNewTab ? '_blank' : '_self'}
			rel="noreferrer noopener"
			class="group flex min-w-0 flex-col"
			style={`flex-grow:${r};flex-basis:${Math.round(r * ROW_HEIGHT)}px;`}
			title={image.title}
		>
			<div
				class="overflow-hidden rounded-lg bg-[var(--app-surface)]"
				style={`height:${ROW_HEIGHT}px;`}
			>
				<img
					src={image.thumbnail}
					alt={image.title}
					loading="lazy"
					class="h-full w-full object-cover transition duration-300 group-hover:opacity-90"
					onerror={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = 'none';
					}}
				/>
			</div>
			<p class="mt-2 truncate text-sm text-[var(--app-text)]">{image.title}</p>
			<p class="truncate text-xs text-[var(--app-muted)]">{domain(image)}</p>
		</a>
	{/each}
</div>
