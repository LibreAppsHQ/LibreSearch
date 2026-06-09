<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	const facts = [
		{ label: 'What it is', value: 'An independent, privacy-first search engine.' },
		{ label: 'Maker', value: 'Built by LibreSearch.' },
		{ label: 'Business model', value: 'No ads, no profiles, no selling of data.' },
		{ label: 'Data stored', value: 'None — searches are never logged or tied to you.' },
		{ label: 'Where settings live', value: 'Locally in your browser, never on a server.' },
		{ label: 'Availability', value: 'Free to use on the web, worldwide.' }
	];

	const assets = [
		{ name: 'Logo (light)', file: '/2.svg', note: 'For dark backgrounds' },
		{ name: 'Logo (dark)', file: '/logo_dark.svg', note: 'For light backgrounds' },
		{ name: 'App icon', file: '/favicon.svg', note: 'Square mark, gradient' },
		{ name: 'App icon (flat)', file: '/icon-mark.svg', note: 'Square mark, solid bg' }
	];

	const boilerplate =
		'LibreSearch is an independent, privacy-first search engine built by LibreSearch. It delivers real web results without logging your queries, building a profile on you, or selling your attention. There are no ads and no trackers, and your settings live entirely in your own browser — never on a server.';

	let copied = $state(false);

	async function copyBoilerplate() {
		try {
			await navigator.clipboard.writeText(boilerplate);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Clipboard unavailable — ignore
		}
	}
</script>

<svelte:head>
	<title>Press &amp; Media - LibreSearch</title>
	<meta
		name="description"
		content="Press resources for LibreSearch — the private search engine with no tracking, no profiles, and no ads. Company facts, brand assets, boilerplate, and media contact."
	/>
	<link rel="canonical" href="https://libresearch.ca/press" />

	<!-- Open Graph -->
	<meta property="og:title" content="Press & Media - LibreSearch" />
	<meta
		property="og:description"
		content="Company facts, brand assets, boilerplate, and media contact for LibreSearch."
	/>
	<meta property="og:url" content="https://libresearch.ca/press" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
</svelte:head>

<!-- Sticky header -->
<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">Press</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="min-h-screen bg-(--app-background) text-(--app-text)">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-24">
		<p class="mb-3 text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
			Press &amp; Media
		</p>
		<h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
			Tell the story of search without surveillance.
		</h1>
		<p class="mt-6 max-w-2xl text-lg leading-8 text-(--app-secondary)">
			Everything you need to write about LibreSearch — the facts, the brand assets, an approved
			boilerplate, and a direct line to our team. Working on a deadline? Message us and we'll move
			fast.
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<a
				href="/contact"
				class="inline-flex items-center gap-2 rounded-xl bg-(--app-accent) px-5 py-2.5 text-sm font-semibold text-[#111111] transition hover:opacity-90"
			>
				<i class="fa-solid fa-envelope text-xs"></i>
				Contact press
			</a>
			<a
				href="#assets"
				class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) px-5 py-2.5 text-sm font-medium text-(--app-button) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
			>
				<i class="fa-solid fa-download text-xs"></i>
				Brand assets
			</a>
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- At a glance -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<h2 class="mb-10 text-2xl font-bold tracking-tight">LibreSearch at a glance</h2>
		<dl class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each facts as fact, i (i)}
				<div class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
					<dt class="text-xs font-semibold tracking-widest text-(--app-muted) uppercase">
						{fact.label}
					</dt>
					<dd class="mt-2 text-[15px] leading-6 text-(--app-text)">{fact.value}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Boilerplate -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<div class="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
			<div>
				<h2 class="text-2xl font-bold tracking-tight">Boilerplate</h2>
				<p class="mt-3 text-sm leading-7 text-(--app-muted)">
					A short, approved description of LibreSearch you can drop straight into an article.
				</p>
			</div>
			<div class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
				<p class="text-[15px] leading-7 text-(--app-secondary)">{boilerplate}</p>
				<button
					type="button"
					onclick={copyBoilerplate}
					class="mt-5 inline-flex items-center gap-2 rounded-lg border border-(--app-border) px-4 py-2 text-sm font-medium text-(--app-button) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
				>
					<i class="fa-solid {copied ? 'fa-check text-emerald-400' : 'fa-copy'} text-xs"></i>
					{copied ? 'Copied' : 'Copy boilerplate'}
				</button>
			</div>
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Brand assets -->
	<section id="assets" class="mx-auto w-full max-w-[1100px] scroll-mt-24 px-6 py-12 sm:py-20">
		<h2 class="mb-3 text-2xl font-bold tracking-tight">Brand assets</h2>
		<p class="mb-10 max-w-2xl text-sm leading-7 text-(--app-muted)">
			Please use these marks as-is — don't stretch, recolor, or add effects. The wordmark and icon
			should always sit on a clear background.
		</p>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each assets as asset, i (i)}
				<div
					class="flex flex-col overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)"
				>
					<div class="flex h-28 items-center justify-center bg-(--app-hover) p-6">
						<img src={asset.file} alt={asset.name} class="max-h-full max-w-full" />
					</div>
					<div class="flex flex-1 flex-col gap-1 p-4">
						<p class="text-sm font-semibold text-(--app-text)">{asset.name}</p>
						<p class="text-xs text-(--app-muted)">{asset.note}</p>
						<a
							href={asset.file}
							download
							class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-(--app-accent) hover:underline"
						>
							<i class="fa-solid fa-download text-xs"></i>
							Download SVG
						</a>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Media contact -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-24">
		<div
			class="flex flex-col items-start justify-between gap-6 rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 sm:flex-row sm:items-center sm:p-10"
		>
			<div>
				<h2 class="text-2xl font-bold tracking-tight">Media inquiries</h2>
				<p class="mt-2 max-w-xl text-sm leading-7 text-(--app-muted)">
					Interviews, fact-checks, or anything else — reach the team directly. We aim to reply
					within one business day.
				</p>
			</div>
			<a
				href="/contact"
				class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-(--app-accent) px-6 py-3 text-sm font-semibold text-[#111111] transition hover:opacity-90"
			>
				<i class="fa-solid fa-envelope text-xs"></i>
				Message the team
			</a>
		</div>
	</section>
</main>

<SiteFooter />
