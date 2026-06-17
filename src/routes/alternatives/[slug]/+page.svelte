<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import DefaultSearchPrompt from '$lib/components/DefaultSearchPrompt.svelte';
	import { compareSections, engines, markStyles } from '$lib/compareData';
	import { alternativeSlugs } from '$lib/alternatives';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const page = $derived(data.page);
	const competitor = $derived(engines[page.engineIndex]);
	const canonical = $derived(`https://libresearch.ca/alternatives/${page.slug}`);

	const comparisonRows = $derived(
		compareSections.flatMap((section) =>
			section.rows.map((row) => ({
				label: row.label,
				note: row.note,
				libre: row.values[0],
				competitor: row.values[page.engineIndex]
			}))
		)
	);

	const jsonLd =
		`<script type="application/ld+json">` +
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: page.metaTitle,
			url: canonical,
			description: page.metaDescription,
			isPartOf: { '@type': 'WebSite', name: 'LibreSearch', url: 'https://libresearch.ca' }
		}) +
		'</' +
		'script>';

	let query = $state('');
</script>

<svelte:head>
	<title>{page.metaTitle}</title>
	<meta name="description" content={page.metaDescription} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={canonical} />
	<meta property="og:title" content={page.metaTitle} />
	<meta property="og:description" content={page.metaDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
	<meta name="twitter:title" content={page.metaTitle} />
	<meta name="twitter:description" content={page.metaDescription} />
	{@html jsonLd}
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Alternatives
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<section class="mx-auto w-full max-w-[900px] px-6 pt-12 pb-10 text-center sm:pt-16">
		<div class="flex items-center justify-center gap-4">
			<img
				src={competitor.logo}
				alt={competitor.name}
				class="h-12 w-12 rounded-xl object-contain"
				loading="lazy"
			/>
			<i class="fa-solid fa-arrow-right text-(--app-muted)"></i>
			<img
				src="/2.svg"
				alt="LibreSearch"
				class="h-12 w-12 rounded-xl object-contain"
				loading="lazy"
			/>
		</div>
		<h1 class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{page.headline}</h1>
		<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-(--app-muted) sm:text-lg">
			{page.subhead}
		</p>
		<div class="mx-auto mt-8 max-w-xl">
			<SearchBar
				bind:query
				placeholder="Try a search on LibreSearch"
				showButton={true}
				action="/search"
				compact={true}
			/>
		</div>
	</section>

	<section class="mx-auto w-full max-w-[800px] px-6 pb-12">
		<DefaultSearchPrompt showWhen={true} />
		<h2 class="text-xl font-semibold">Why switch from {page.competitorName}?</h2>
		<ul class="mt-4 space-y-3 text-sm leading-7 text-(--app-muted)">
			{#each page.reasons as reason (reason)}
				<li class="flex gap-3">
					<i class="fa-solid fa-check mt-1 text-emerald-400"></i>
					<span>{reason}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section class="mx-auto w-full max-w-[800px] px-6 pb-16">
		<h2 class="text-xl font-semibold">Side-by-side</h2>
		<p class="mt-2 text-sm text-(--app-muted)">
			LibreSearch vs {page.competitorName}. See the
			<a href="/compare" class="text-(--app-accent) hover:underline">full comparison</a>
			for every major engine.
		</p>
		<div
			class="mt-6 overflow-x-auto rounded-2xl border border-(--app-border) bg-(--app-card) backdrop-blur-sm"
		>
			<table class="w-full min-w-[420px] border-collapse text-sm">
				<thead>
					<tr class="border-b border-(--app-border)">
						<th class="px-5 py-4 text-left font-semibold">Feature</th>
						<th class="px-3 py-4 text-center font-semibold">LibreSearch</th>
						<th class="px-3 py-4 text-center font-semibold">{page.competitorName}</th>
					</tr>
				</thead>
				<tbody>
					{#each comparisonRows as row (row.label)}
						{@const libreMark = markStyles[row.libre]}
						{@const competitorMark = markStyles[row.competitor]}
						<tr class="border-t border-(--app-border)/40">
							<td class="px-5 py-3">
								<p class="font-medium">{row.label}</p>
								{#if row.note}
									<p class="mt-1 text-xs text-(--app-muted)">{row.note}</p>
								{/if}
							</td>
							<td class="px-3 py-3 text-center align-middle">
								<i
									class={`fa-solid ${libreMark.icon} ${libreMark.color}`}
									aria-label={libreMark.label}
								></i>
							</td>
							<td class="px-3 py-3 text-center align-middle">
								<i
									class={`fa-solid ${competitorMark.icon} ${competitorMark.color}`}
									aria-label={competitorMark.label}
								></i>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="mx-auto w-full max-w-[800px] px-6 pb-20">
		<h2 class="text-lg font-semibold">Other alternatives</h2>
		<ul class="mt-4 flex flex-wrap gap-3 text-sm">
			{#each alternativeSlugs.filter((s) => s !== page.slug) as slug (slug)}
				<li>
					<a
						href="/alternatives/{slug}"
						class="rounded-full border border-(--app-border) bg-(--app-card) px-4 py-2 text-(--app-muted) transition hover:border-(--app-accent) hover:text-(--app-accent)"
					>
						vs {slug === 'duckduckgo'
							? 'DuckDuckGo'
							: slug === 'startpage'
								? 'Startpage'
								: 'Google'}
					</a>
				</li>
			{/each}
			<li>
				<a
					href="/compare"
					class="rounded-full border border-(--app-border) bg-(--app-card) px-4 py-2 text-(--app-muted) transition hover:border-(--app-accent) hover:text-(--app-accent)"
				>
					Full comparison
				</a>
			</li>
		</ul>
	</section>
</main>

<SiteFooter />
