<script lang="ts">
	import { settingsStore, getToggle } from '$lib/stores/settings';

	let {
		result
	} = $props<{
		result: {
			title: string;
			url: string;
			snippet: string;
			siteName?: string;
			age?: string;
			thumbnail?: string;
			sitelinks?: Array<{ title: string; url: string }>;
		};
	}>();

	let openInNewTab = $derived(getToggle($settingsStore, 'open-new-tab'));
	let showFavicons = $derived(getToggle($settingsStore, 'show-favicons'));
	let showSitelinks = $derived(getToggle($settingsStore, 'show-sitelinks'));
	let showAge = $derived(getToggle($settingsStore, 'show-age'));
	let compact = $derived(getToggle($settingsStore, 'compact-results', false));
	let stripTracking = $derived(getToggle($settingsStore, 'strip-tracking', false));
	let noReferrer = $derived(getToggle($settingsStore, 'no-referrer', false));

	let domain = $derived.by(() => {
		try {
			return new URL(result.url).hostname;
		} catch {
			return '';
		}
	});

	let breadcrumb = $derived.by(() => {
		try {
			const u = new URL(result.url);
			const segs = u.pathname.split('/').filter(Boolean).slice(0, 3);
			return [`${u.protocol}//${u.host}`, ...segs].join(' › ');
		} catch {
			return result.url;
		}
	});

	let siteLabel = $derived(result.siteName || domain.replace(/^www\./, ''));

	let href = $derived.by(() => {
		if (!stripTracking) return result.url;
		try {
			const u = new URL(result.url);
			['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source'].forEach((p) => u.searchParams.delete(p));
			return u.toString();
		} catch {
			return result.url;
		}
	});
</script>

<article class="group rounded-2xl px-1 transition hover:bg-[var(--app-hover)]">
	<a
		{href}
		target={openInNewTab ? '_blank' : '_self'}
		rel={noReferrer ? 'noreferrer noopener' : 'noopener'}
		class={compact
			? 'block rounded-2xl px-3 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/50'
			: 'block rounded-2xl px-3 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/50'}
	>
		<div class={compact ? 'space-y-0.5' : 'space-y-1'}>
			<!-- Site breadcrumb row -->
			<div class="flex items-center gap-2.5">
				{#if showFavicons && domain}
					<span
						class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]"
					>
						<img
							src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
							alt=""
							width="18"
							height="18"
							class="h-[18px] w-[18px]"
							onerror={(e) => {
								(e.currentTarget as HTMLImageElement).style.display = 'none';
							}}
						/>
					</span>
				{/if}
				<div class="min-w-0 flex-1 leading-tight">
					<div class="truncate text-sm font-medium text-[var(--app-text)]">{siteLabel}</div>
					<div class="truncate text-xs text-[var(--app-muted)]">{breadcrumb}</div>
				</div>
				{#if showAge && result.age}
					<span class="shrink-0 text-xs text-[var(--app-muted)]">{result.age}</span>
				{/if}
			</div>

			<!-- Title -->
			<h2 class={compact
				? 'pt-0.5 text-base font-normal leading-snug text-[var(--app-accent)] group-hover:underline'
				: 'pt-1 text-xl font-normal leading-snug text-[var(--app-accent)] group-hover:underline'}>
				{result.title}
			</h2>

			<!-- Snippet — hidden in compact mode -->
			{#if result.snippet && !compact}
				<p class="text-sm leading-6 text-[var(--app-secondary)]">{result.snippet}</p>
			{/if}
		</div>
	</a>

	<!-- Sitelinks -->
	{#if showSitelinks && result.sitelinks && result.sitelinks.length >= 2}
		<div class="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 px-3 pb-3">
			{#each result.sitelinks.slice(0, 6) as sitelink}
				<a
					href={sitelink.url}
					target={openInNewTab ? '_blank' : '_self'}
					rel="noreferrer noopener"
					class="truncate text-sm text-[var(--app-accent)] hover:underline"
				>
					{sitelink.title}
				</a>
			{/each}
		</div>
	{/if}
</article>
