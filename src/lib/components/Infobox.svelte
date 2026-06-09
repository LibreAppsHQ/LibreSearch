<script lang="ts">
	import type { Infobox } from '$lib/search';

	let { infobox } = $props<{ infobox: Infobox }>();

	let attrs = $derived((infobox.attributes ?? []).slice(0, 8));
	let expanded = $state(false);

	let sourceLabel = $derived.by(() => {
		if (!infobox.url) return '';
		try {
			const host = new URL(infobox.url).hostname.replace(/^www\./, '');
			if (host.includes('wikipedia')) return 'Wikipedia';
			const main = host.split('.').slice(-2, -1)[0] ?? host;
			return main.charAt(0).toUpperCase() + main.slice(1);
		} catch {
			return 'Source';
		}
	});
</script>

<aside class="rounded-sm border border-(--app-border) bg-(--app-card)">
	<!-- Hero image -->
	{#if infobox.imageUrl}
		<img
			src={infobox.imageUrl}
			alt={infobox.title}
			loading="lazy"
			decoding="async"
			class="h-56 w-full rounded-t-sm object-cover"
			onerror={(e) => {
				(e.currentTarget as HTMLImageElement).style.display = 'none';
			}}
		/>
	{/if}

	<!-- Title + subtitle -->
	<div class="p-5">
		<h2 class="text-2xl leading-tight font-semibold text-(--app-text)">{infobox.title}</h2>
		{#if infobox.subtitle}
			<p class="mt-2 text-sm leading-6 text-(--app-muted)">
				{infobox.subtitle}
			</p>
		{/if}
	</div>

	{#if infobox.description}
		<div class="border-t border-(--app-border) px-5 pt-5 pb-4">
			<p
				class={expanded
					? 'text-sm leading-6 text-(--app-text)'
					: 'line-clamp-3 text-sm leading-6 text-(--app-text)'}
			>
				{infobox.description}
			</p>

			{#if sourceLabel && infobox.url}
				<a
					href={infobox.url}
					target="_blank"
					rel="noreferrer noopener"
					class="mt-4 block text-sm text-(--app-muted) underline"
				>
					{sourceLabel}
				</a>
			{/if}
		</div>

		<div class="relative -mb-5 flex justify-center">
			<button
				type="button"
				onclick={() => (expanded = !expanded)}
				class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-(--app-border) bg-(--app-card) px-8 py-2 text-sm text-(--app-button) transition hover:text-(--app-button-hover)"
			>
				{expanded ? 'See less' : 'See more'}
				<i class="fa-solid {expanded ? 'fa-minus' : 'fa-plus'} text-[10px]"></i>
			</button>
		</div>
	{/if}

	{#if expanded && (attrs.length > 0 || (infobox.profiles && infobox.profiles.length > 0))}
		<div class="space-y-4 border-t border-(--app-border) p-5">
			{#if attrs.length > 0}
				<dl class="space-y-2">
					{#each attrs as [key, value], i (i)}
						<div class="grid grid-cols-[auto_1fr] gap-x-4 text-sm">
							<dt class="shrink-0 text-(--app-muted)">{key}</dt>
							<dd class="text-(--app-text)">{value}</dd>
						</div>
					{/each}
				</dl>
			{/if}

			{#if infobox.profiles && infobox.profiles.length > 0}
				<div class={attrs.length > 0 ? 'border-t border-(--app-border) pt-4' : ''}>
					<p class="mb-2 text-xs font-medium tracking-wider text-(--app-muted) uppercase">
						Quick links
					</p>
					<div class="flex flex-wrap gap-x-4 gap-y-1">
						{#each infobox.profiles as profile, i (i)}
							<a
								href={profile.url}
								target="_blank"
								rel="noreferrer noopener"
								class="text-sm text-(--app-accent) transition hover:underline"
							>
								{profile.network}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</aside>
