<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import { settingsStore, getToggle, getSelect } from '$lib/stores/settings';

	let query = $state('');
	let safesearch = $derived(
		getSelect($settingsStore, 'safe-search', 'moderate') as 'strict' | 'moderate' | 'low'
	);

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

	function openDefaultModal() {
		browser = detectBrowser();
		if (typeof window !== 'undefined') origin = window.location.origin;
		showDefaultModal = true;
	}
</script>

<svelte:head>
	<title>LibreSearch - Private Search Engine</title>
	<meta
		name="description"
		content="Search the web privately with LibreSearch. No tracking, no profiles, no ads. Fast, clean results from an independent search index."
	/>
	<link rel="canonical" href="https://libresearch.ca" />
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
	{@html `<script type="application/ld+json">${JSON.stringify({
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
	})}</script>`}
</svelte:head>

<main class="relative flex min-h-screen flex-col bg-[var(--app-background)] text-[var(--app-text)]">
	<div class="absolute top-6 left-6 z-30">
		<Clock />
	</div>
	<SiteMenu class="absolute top-6 right-6 z-30" />

	<!-- Centered hero -->
	<div class="relative flex min-h-screen flex-col items-center px-6 pt-[21vh]">
		<div class="w-full max-w-xl text-center">
			<a href="/about" class="inline-flex items-center gap-2.5" aria-label="LibreSearch home">
				<Logo class="h-70 w-200 " />
			</a>
			<h1 class="mt-3 text-base text-[var(--app-text)] sm:text-lg">
				Find anything. Tracked by no one.
			</h1>

			<div class="mt-6 w-full">
				<SearchBar
					bind:query
					placeholder="Search privately"
					showButton={true}
					action="/search"
					pill={true}
					{safesearch}
				/>
			</div>
		</div>

		<!-- Scroll-down indicator -->
		<a
			href="#without-tracking"
			aria-label="Scroll down"
			class="absolute bottom-8 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-[var(--app-accent)] text-[var(--app-accent)] transition hover:bg-[var(--app-accent)]/10"
		>
			<i class="fas fa-chevron-down"></i>
		</a>
	</div>

	<!-- Search, not surveillance -->
	<section
		id="without-tracking"
		class="bg-gradient-to-b from-[#5b5bf0] to-[#6f6ff7] px-6 py-20 text-white sm:py-28"
	>
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:justify-between">
			<div class="max-w-xl text-center md:text-left">
				<h2 class="text-5xl leading-tight font-bold sm:text-6xl">
					Search,<br />not surveillance.
				</h2>
				<p class="mt-6 text-lg text-white/85">
					LibreSearch is a private search engine that finds what you need without logging who you
					are.
				</p>
				<button
					type="button"
					onclick={openDefaultModal}
					class="mt-8 inline-block rounded-md border border-white px-6 py-3 text-base font-medium text-white transition hover:bg-white hover:text-[#5b5bf0]"
				>
					Make it your default
				</button>
			</div>

			<img
				src="/icon2.svg"
				alt="Browsing the web privately on a laptop"
				class="w-full max-w-lg md:max-w-xl"
			/>
		</div>
	</section>

	<!-- Mass surveillance -->
	<section
		id="mass-surveillance"
		class="bg-gradient-to-b from-[#0f766e] to-[#0d9488] px-6 py-20 text-white sm:py-28"
	>
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:justify-between">
			<img
				src="/icon3.svg"
				alt="Mass surveillance watching everyone online"
				class="w-full max-w-lg md:order-1 md:max-w-xl"
			/>

			<div class="max-w-xl text-center md:order-2 md:text-left">
				<h2 class="text-5xl leading-tight font-bold sm:text-6xl">
					Stop mass<br />surveillance.
				</h2>
				<p class="mt-6 text-lg text-white/85">
					Most search engines log every query and tie it to a profile that follows you across the
					web. We don't. No logs, no profiles, no tracking — your searches stay yours.
				</p>
				<a
					href="/privacy"
					class="mt-8 inline-block rounded-md border border-white px-6 py-3 text-base font-medium text-white transition hover:bg-white hover:text-[#0d9488]"
				>
					How we protect you
				</a>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class=" bg-[#0c0d0e] py-2.5">
		<nav class="flex items-center justify-center gap-18 text-sm text-white/90">
			<a href="/privacy" class="transition hover:text-[var(--app-text)]">Privacy Policy</a>
			<a href="/about" class="transition hover:text-[var(--app-text)]">About Us</a>
			<a href="/settings" class="transition hover:text-[var(--app-text)]">Settings</a>
		</nav>
	</footer>
</main>

{#if showDefaultModal}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		onclick={() => (showDefaultModal = false)}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-md rounded-xl bg-white p-6 text-[#0c0d0e] shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="default-modal-title"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-start justify-between gap-4">
				<h3 id="default-modal-title" class="text-xl font-bold">
					Set LibreSearch as your default in {defaultSteps[browser].name}
				</h3>
				<button
					type="button"
					class="-mt-1 -mr-1 rounded p-1 text-2xl leading-none text-black/50 transition hover:text-black"
					aria-label="Close"
					onclick={() => (showDefaultModal = false)}
				>
					×
				</button>
			</div>

			<ol class="mt-4 list-decimal space-y-3 pl-5 text-sm text-black/80">
				{#each defaultSteps[browser].steps as step}
					<li>{step}</li>
				{/each}
			</ol>

			<p class="mt-4 text-xs text-black/50">
				Browsers don’t allow a site to change your default search engine for you — it’s a one-time
				setting you confirm yourself.
			</p>

			<button
				type="button"
				class="mt-6 w-full rounded-md bg-[#5b5bf0] px-4 py-2.5 font-medium text-white transition hover:bg-[#4a4ae0]"
				onclick={() => (showDefaultModal = false)}
			>
				Got it
			</button>
		</div>
	</div>
{/if}
