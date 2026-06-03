<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { BANGS } from '$lib/bangs';

	const operators = [
		{
			op: '"exact phrase"',
			example: '"private search engine"',
			desc: 'Match the words in this exact order, as a phrase.'
		},
		{
			op: '-exclude',
			example: 'jaguar -car',
			desc: 'Remove results that contain a word. Add a minus directly before the term.'
		},
		{
			op: 'site:',
			example: 'site:wikipedia.org turing',
			desc: 'Only return results from a specific domain.'
		},
		{
			op: 'filetype:',
			example: 'filetype:pdf annual report 2024',
			desc: 'Limit results to a specific file extension (pdf, doc, xls, etc.).'
		},
		{
			op: 'intitle:',
			example: 'intitle:"privacy policy"',
			desc: 'Only return pages whose title contains the term.'
		},
		{
			op: 'inurl:',
			example: 'inurl:login okta',
			desc: 'Only return pages whose URL contains the term.'
		},
		{
			op: 'OR',
			example: 'firefox OR chromium',
			desc: 'Match either of the listed terms. Must be capitalized.'
		}
	];

	const tips = [
		'Searches are not logged, so you can refine freely without anything being tied to you.',
		'Use the time-range filter at the top of the results page to scope to the past hour, day, week, month, or year.',
		'The region selector restricts results to a specific country without leaking your location.',
		'Toggle compact mode in /settings for denser results on a small screen.',
		"Press / anywhere on the page to jump straight to the search bar (if you've enabled the keyboard shortcut)."
	];

	// Group bangs by category for the table. We label by the URL host as a stable
	// fallback if no curated grouping exists.
	const bangEntries = Object.entries(BANGS).map(([key, b]) => ({ key, ...b }));
</script>

<svelte:head>
	<title>Search syntax - LibreSearch</title>
	<meta
		name="description"
		content="Operators and bangs for LibreSearch. Use site:, filetype:, intitle:, exclusions, exact phrases, and one-tap bangs to search other sites."
	/>
	<link rel="canonical" href="https://libresearch.ca/syntax" />
	<meta property="og:title" content="Search syntax - LibreSearch" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
	<meta property="og:description" content="The full operator and bang reference for LibreSearch." />
	<meta property="og:url" content="https://libresearch.ca/syntax" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">Syntax</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<section class="mx-auto w-full max-w-[900px] px-6 py-12 sm:py-16">
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Search syntax</h1>
		<p class="mt-4 text-base leading-7 text-(--app-muted)">
			LibreSearch supports the same operators most search engines do, plus a system of
			<a href="#bangs" class="text-(--app-accent) hover:underline">bang shortcuts</a> for searching other
			sites in one keystroke.
		</p>

		<!-- Operators -->
		<h2 class="mt-12 text-xl font-semibold tracking-tight">Operators</h2>
		<div class="mt-6 overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)">
			<table class="w-full text-sm">
				<thead
					class="bg-(--app-hover) text-left text-xs tracking-widest text-(--app-muted) uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-semibold">Operator</th>
						<th class="px-5 py-3 font-semibold">Example</th>
						<th class="px-5 py-3 font-semibold">What it does</th>
					</tr>
				</thead>
				<tbody>
					{#each operators as o, i (i)}
						<tr class="border-t border-(--app-border)">
							<td class="px-5 py-4 font-mono text-(--app-accent)">{o.op}</td>
							<td class="px-5 py-4 font-mono text-xs text-(--app-secondary)">{o.example}</td>
							<td class="px-5 py-4 leading-6 text-(--app-text)">{o.desc}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Bangs -->
		<h2 id="bangs" class="mt-14 text-xl font-semibold tracking-tight">Bang shortcuts</h2>
		<p class="mt-3 text-sm leading-6 text-(--app-muted)">
			Type a bang (e.g. <code
				class="rounded bg-(--app-hover) px-1.5 py-0.5 font-mono text-(--app-accent)"
				>!w turing machine</code
			>) anywhere in your query to redirect the search to another site. Order doesn't matter — both
			<code class="font-mono">!w turing</code> and <code class="font-mono">turing !w</code> work.
		</p>
		<div class="mt-6 overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)">
			<table class="w-full text-sm">
				<thead
					class="bg-(--app-hover) text-left text-xs tracking-widest text-(--app-muted) uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-semibold">Bang</th>
						<th class="px-5 py-3 font-semibold">Site</th>
					</tr>
				</thead>
				<tbody>
					{#each bangEntries as b, i (i)}
						<tr class="border-t border-(--app-border)">
							<td class="px-5 py-3 font-mono text-(--app-accent)">!{b.key}</td>
							<td class="px-5 py-3 text-(--app-text)">{b.name}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Tips -->
		<h2 class="mt-14 text-xl font-semibold tracking-tight">Tips</h2>
		<ul class="mt-4 space-y-3">
			{#each tips as t, i (i)}
				<li class="flex items-start gap-3 text-sm leading-6 text-(--app-text)">
					<i class="fa-solid fa-circle-info mt-1 text-(--app-accent)"></i>
					<span>{t}</span>
				</li>
			{/each}
		</ul>
	</section>

	<SiteFooter />
</main>
