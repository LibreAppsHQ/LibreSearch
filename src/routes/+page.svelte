<script lang="ts">
	import { onMount } from 'svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import BurnButton from '$lib/components/BurnButton.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Lazy from '$lib/components/Lazy.svelte';
	import { settingsStore, getSelect, ecoActive } from '$lib/stores/settings';

	let query = $state('');
	let safesearch = $derived(
		getSelect($settingsStore, 'safe-search', 'moderate') as 'strict' | 'moderate' | 'low'
	);
	let hideBackgrounds = $derived(ecoActive($settingsStore, 'eco-hide-backgrounds'));
	let showDeferred = $state(false);

	onMount(() => {
		// Paint logo + search bar first; load decorative UI after first frame.
		requestAnimationFrame(() => {
			showDeferred = true;
		});
	});

	let showDefaultModal = $state(false);

	type BrowserKey = 'chrome' | 'edge' | 'firefox' | 'safari' | 'other';

	function detectBrowser(): BrowserKey {
		if (typeof navigator === 'undefined') return 'other';
		const ua = navigator.userAgent;
		if (/Edg\//.test(ua)) return 'edge';
		if (/Firefox\//.test(ua)) return 'firefox';
		if (/Chrome\//.test(ua) || /Chromium\//.test(ua)) return 'chrome';
		if (/Safari\//.test(ua) && /Apple/.test(navigator.vendor)) return 'safari';
		return 'other';
	}

	let origin = $state('https://libresearch.ca');
	let searchUrlTemplate = $derived(`${origin}/search?q=%s`);

	let defaultSteps = $derived<Record<BrowserKey, { name: string; steps: string[] }>>({
		chrome: {
			name: 'Chrome',
			steps: [
				'Go to chrome://settings/searchEngines.',
				'Next to “Site search”, click Add.',
				`Name it “LibreSearch”, set a shortcut (e.g. libre), and set the URL to ${searchUrlTemplate}.`,
				'Click the ⋮ next to the new entry and choose “Make default”.'
			]
		},
		edge: {
			name: 'Edge',
			steps: [
				'Go to edge://settings/searchEngines.',
				'Next to “Manage search engines”, click Add.',
				`Name it “LibreSearch”, set a shortcut (e.g. libre), and set the URL to ${searchUrlTemplate}.`,
				'Click the ⋯ next to the new entry and choose “Make default”.'
			]
		},
		firefox: {
			name: 'Firefox',
			steps: [
				'Click the search bar, then the magnifying-glass/options icon.',
				'Choose “Add LibreSearch” to install it as a search engine.',
				'Open Settings → Search and pick LibreSearch as your Default Search Engine.'
			]
		},
		safari: {
			name: 'Safari',
			steps: [
				'Safari only allows a fixed list of default search engines, so it can’t be set as the system default.',
				'Bookmark LibreSearch instead, or add it to your Favorites for one-tap access.'
			]
		},
		other: {
			name: 'your browser',
			steps: [
				'Open your browser’s search engine settings.',
				'Look for “LibreSearch” among the discovered engines (most browsers add it after your first visit).',
				`If it isn’t there, click Add and set the URL to ${searchUrlTemplate}, then select it.`
			]
		}
	});

	let browser = $state<BrowserKey>('other');
	let dialogEl = $state<HTMLDivElement | null>(null);

	function openDefaultModal() {
		browser = detectBrowser();
		if (typeof window !== 'undefined') origin = window.location.origin;
		showDefaultModal = true;
	}

	// Close on Escape and pull focus into the dialog when it opens, so keyboard
	// users aren't left tabbing through the page behind the modal.
	$effect(() => {
		if (!showDefaultModal) return;
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') showDefaultModal = false;
		}
		window.addEventListener('keydown', onKey);
		dialogEl?.focus();
		return () => window.removeEventListener('keydown', onKey);
	});

	// Built in the script block so the inline <script> tag doesn't trip the
	// Svelte ESLint parser. The closing tag is split so the HTML parser doesn't
	// end the block early.
	const jsonLd =
		`<script type="application/ld+json">` +
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'LibreSearch',
			url: 'https://libresearch.ca',
			description: 'A private search engine with no tracking, no profiles, and no ads.',
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: 'https://libresearch.ca/search?q={search_term_string}'
				},
				'query-input': 'required name=search_term_string'
			}
		}) +
		'</' +
		'script>';
</script>

<svelte:head>
	<title>LibreSearch - Private Search Engine</title>
	<meta
		name="description"
		content="Search the web privately with LibreSearch. No tracking, no profiles, no ads. Fast, clean results from an independent search index."
	/>
	<link rel="canonical" href="https://libresearch.ca/" />
	<link rel="preload" as="image" href="/2.svg" fetchpriority="high" />

	<!-- Open Graph -->
	<meta property="og:title" content="LibreSearch - Private Search Engine" />
	<meta
		property="og:description"
		content="Search the web privately. No tracking, no profiles, no ads."
	/>
	<meta property="og:url" content="https://libresearch.ca" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />

	<!-- Twitter -->
	<meta name="twitter:title" content="LibreSearch - Private Search Engine" />
	<meta
		name="twitter:description"
		content="Search the web privately. No tracking, no profiles, no ads."
	/>

	<!-- JSON-LD: WebSite + SearchAction -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted, static structured data -->
	{@html jsonLd}
</svelte:head>

<main class="relative flex min-h-dvh flex-col bg-(--app-background) text-(--app-text)">
	{#if !hideBackgrounds && showDeferred}
		<Lazy load={() => import('$lib/components/WaveBackground.svelte')} />
	{/if}

	<div class="relative z-10 flex flex-1 flex-col">
		{#if showDeferred}
			<div class="absolute top-6 left-6 z-30">
				<Lazy load={() => import('$lib/components/Clock.svelte')} />
			</div>
		{/if}
		<div class="absolute top-6 right-6 z-30 flex items-center gap-1">
			<BurnButton />
			<SiteMenu />
		</div>

		<!-- Centered hero -->
		<div class="relative flex flex-1 flex-col items-center px-6 pt-[21vh]">
			<div class="w-full max-w-xl text-center">
				<a href="/" class="inline-flex items-center gap-2.5" aria-label="LibreSearch home">
					<Logo class="h-24 w-auto max-w-full sm:h-28" fetchpriority="high" />
				</a>
				<h1 class="mt-3 text-base text-(--app-text) sm:text-lg">Privacy for everyone.</h1>

				<div class="mt-6 w-full">
					<SearchBar
						bind:query
						placeholder="Search privately"
						showButton={true}
						action="/search"
						compact={true}
						autoFocus={true}
						{safesearch}
					/>
				</div>

				{#if showDeferred}
					<Lazy
						load={() => import('$lib/components/EcoWorldPanel.svelte')}
						variant="home"
					/>
				{/if}
			</div>
		</div>

		{#if showDeferred}
			<Lazy load={() => import('$lib/components/QuickSettings.svelte')} />
		{/if}

		<!-- Footer -->
		<footer
			class="border-t border-(--app-border)/50 bg-[color-mix(in_srgb,var(--app-background)_94%,#000)] px-6 py-3"
		>
			<nav
				class="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-(--app-muted)"
			>
				<a href="/privacy" class="transition hover:text-(--app-accent)">Privacy Policy</a>
				<a href="/about" class="transition hover:text-(--app-accent)">About Us</a>
				<a href="/press" class="transition hover:text-(--app-accent)">Press</a>
			</nav>
		</footer>
	</div>
</main>
