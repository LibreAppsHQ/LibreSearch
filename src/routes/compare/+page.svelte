<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { DEFAULT_LOGO_SIZE, compareSections, engines, markStyles } from '$lib/compareData';

	const jsonLd =
		`<script type="application/ld+json">` +
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: 'Compare LibreSearch',
			url: 'https://libresearch.ca/compare',
			description:
				'See how LibreSearch stacks up against Google, Bing, DuckDuckGo, Brave Search, and Startpage on privacy and features.',
			isPartOf: { '@type': 'WebSite', name: 'LibreSearch', url: 'https://libresearch.ca' }
		}) +
		'</' +
		'script>';

	const sections = compareSections;
</script>

<svelte:head>
	<title>Compare - LibreSearch</title>
	<meta
		name="description"
		content="See how LibreSearch stacks up against Google, Bing, DuckDuckGo, Brave Search, and Startpage on privacy and features."
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://libresearch.ca/compare" />
	<meta property="og:title" content="Compare - LibreSearch" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
	<meta
		property="og:description"
		content="See how LibreSearch stacks up against Google, Bing, DuckDuckGo, Brave Search, and Startpage on privacy and features."
	/>
	<meta property="og:url" content="https://libresearch.ca/compare" />
	<meta
		name="twitter:description"
		content="See how LibreSearch stacks up against Google, Bing, DuckDuckGo, Brave Search, and Startpage on privacy and features."
	/>
	{@html jsonLd}
</svelte:head>

<!-- Sticky header — matches /about layout -->
<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">Compare</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1100px] px-6 pt-12 pb-10 text-center sm:pt-20">
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
			How LibreSearch compares
		</h1>
		<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-(--app-muted) sm:text-lg">
			An honest, side-by-side look at how LibreSearch lines up with the major search engines on
			privacy and features. We mark a row <span class="font-medium text-emerald-400">Yes</span>,
			<span class="font-medium text-red-400/80">No</span>,
			<span class="font-medium text-amber-400">Partial</span>, or
			<span class="font-medium text-(--app-muted)">–</span> only when we can back it up.
		</p>
		<div class="mt-6 flex flex-wrap justify-center gap-3 text-sm">
			<a
				href="/alternatives/google"
				class="rounded-full border border-(--app-border) px-4 py-2 text-(--app-muted) transition hover:border-(--app-accent) hover:text-(--app-accent)"
				>vs Google</a
			>
			<a
				href="/alternatives/duckduckgo"
				class="rounded-full border border-(--app-border) px-4 py-2 text-(--app-muted) transition hover:border-(--app-accent) hover:text-(--app-accent)"
				>vs DuckDuckGo</a
			>
			<a
				href="/alternatives/startpage"
				class="rounded-full border border-(--app-border) px-4 py-2 text-(--app-muted) transition hover:border-(--app-accent) hover:text-(--app-accent)"
				>vs Startpage</a
			>
		</div>
	</section>

	<!-- Comparison table -->
	<section class="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6">
		<div
			class="overflow-x-auto rounded-2xl border border-(--app-border) bg-(--app-card) backdrop-blur-sm"
		>
			<table class="w-full min-w-[820px] border-collapse text-sm">
				<thead>
					<tr class="border-b border-(--app-border)">
						<th class="sticky left-0 z-10 bg-(--app-card) px-5 py-4 text-left font-semibold"
							>Feature</th
						>
						{#each engines as engine (engine.name)}
							<th class="px-3 py-5 text-center">
								<img
									src={engine.logo}
									alt={engine.name}
									title={engine.name}
									class={`mx-auto rounded-xl object-contain ${engine.size ?? DEFAULT_LOGO_SIZE} ${
										engine.accent
											? 'ring-1 ring-(--app-accent) ring-offset-4 ring-offset-(--app-card)'
											: ''
									}`}
									loading="lazy"
								/>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each sections as section (section.title)}
						<tr class="border-t border-(--app-border)/60 bg-(--app-background)/40">
							<td
								colspan={engines.length + 1}
								class="sticky left-0 px-5 py-2.5 text-[11px] font-semibold tracking-wider text-(--app-muted) uppercase"
							>
								{section.title}
							</td>
						</tr>
						{#each section.rows as row (row.label)}
							<tr class="border-t border-(--app-border)/40">
								<td class="sticky left-0 z-10 bg-(--app-card) px-5 py-4">
									<p class="font-medium text-(--app-text)">{row.label}</p>
									{#if row.note}
										<p class="mt-1 text-xs text-(--app-muted)">{row.note}</p>
									{/if}
								</td>
								{#each row.values as value, i (engines[i].name)}
									{@const m = markStyles[value]}
									<td class="px-3 py-4 text-center align-middle">
										<i class={`fa-solid ${m.icon} ${m.color} text-base`} aria-label={m.label}></i>
									</td>
								{/each}
							</tr>
						{/each}
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Legend -->
		<div
			class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-(--app-muted)"
		>
			<span class="inline-flex items-center gap-2">
				<i class="fa-solid fa-check text-emerald-400"></i> Yes
			</span>
			<span class="inline-flex items-center gap-2">
				<i class="fa-solid fa-xmark text-red-400/70"></i> No
			</span>
			<span class="inline-flex items-center gap-2">
				<i class="fa-solid fa-circle-half-stroke text-amber-400"></i> Partial
			</span>
			<span class="inline-flex items-center gap-2">
				<i class="fa-solid fa-minus text-(--app-muted)"></i> Not applicable
			</span>
		</div>
	</section>

	<!-- Methodology note -->
	<section class="mx-auto w-full max-w-[900px] px-6 pb-20">
		<div class="rounded-2xl border border-(--app-border) bg-(--app-card) p-7">
			<h2 class="mb-3 text-lg font-semibold">How we put this together</h2>
			<ul class="space-y-3 text-sm leading-7 text-(--app-muted)">
				<li>
					<span class="text-(--app-text)">Sources.</span> Each engine's public privacy policy and
					product documentation as of the latest review. Where a vendor's claims and independent
					reporting disagree, we mark the row <em>Partial</em>.
				</li>
				<li>
					<span class="text-(--app-text)">"No filter bubble."</span> Means results are not tailored to
					a user profile built from prior searches. It does not mean results are identical across regions
					or languages.
				</li>
				<li>
					<span class="text-(--app-text)">"Independent index."</span> A <em>Not applicable</em>
					here isn't a downside — meta-search engines like LibreSearch, DuckDuckGo, and Startpage rely
					on partner indices on purpose, and we're upfront about ours.
				</li>
				<li>
					<span class="text-(--app-text)">Spotted something off?</span> Open an issue or email us and
					we'll fix the row — accuracy matters more here than marketing.
				</li>
			</ul>
		</div>
	</section>
</main>

<SiteFooter />
