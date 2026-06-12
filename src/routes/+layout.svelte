<script lang="ts">
	import './layout.css';
	import { browser, dev } from '$app/environment';
	import { themeStore } from '$lib/stores/theme';
	import { settingsStore, getToggle, ecoActive } from '$lib/stores/settings';
	import { historyStore } from '$lib/stores/history';
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { get } from 'svelte/store';

	const UMAMI_WEBSITE_ID = 'c0c01c57-f1bc-4bb0-b998-e522cf3ddad6';

	let { children } = $props();

	let keyboardShortcut = $derived(getToggle($settingsStore, 'keyboard-shortcut'));
	let reduceMotion = $derived(
		getToggle($settingsStore, 'reduce-motion', false) || ecoActive($settingsStore, 'eco-mode')
	);
	let ecoPreferDark = $derived(ecoActive($settingsStore, 'eco-prefer-dark'));

	// When a new version has been deployed, do a full-page navigation instead of
	// a client-side one. This fetches the new HTML (and its current asset hashes)
	// so we never request a chunk that no longer exists on the server.
	beforeNavigate((navigation) => {
		if (updated.current && navigation.to?.url) {
			navigation.cancel();
			window.location.href = navigation.to.url.href;
		}
	});


	$effect(() => {
		if (!browser) return;
		if (reduceMotion) {
			document.documentElement.setAttribute('data-reduce-motion', '');
		} else {
			document.documentElement.removeAttribute('data-reduce-motion');
		}
	});

	$effect(() => {
		if (!browser) return;
		if (ecoPreferDark) themeStore.setTheme('dark');
	});

	function handleKeydown(event: KeyboardEvent) {
		if (
			keyboardShortcut &&
			event.key === '/' &&
			!(event.target instanceof HTMLInputElement) &&
			!(event.target instanceof HTMLTextAreaElement) &&
			!(event.target as HTMLElement)?.isContentEditable
		) {
			event.preventDefault();
			document.querySelector<HTMLInputElement>('input[name="q"]')?.focus();
		}
	}

	onMount(() => {
		if (!browser) return;

		themeStore.load();
		settingsStore.load();
		historyStore.load();

		const deferNonCritical = (fn: () => void) => {
			if ('requestIdleCallback' in window) {
				requestIdleCallback(fn, { timeout: 4000 });
			} else {
				setTimeout(fn, 200);
			}
		};

		// Analytics only run on the hosted libresearch.ca deploy — self-hosted
		// instances never load Speed Insights or Umami.
		const hostedDeploy = /(^|\.)libresearch\.ca$/.test(window.location.hostname);

		deferNonCritical(() => {
			if (hostedDeploy) injectSpeedInsights();

			// Umami: cookie-free pageview counts (skipped in dev and eco mode).
			if (hostedDeploy && !dev && !ecoActive(get(settingsStore), 'eco-mode')) {
				const script = document.createElement('script');
				script.defer = true;
				script.src = 'https://cloud.umami.is/script.js';
				script.dataset.websiteId = UMAMI_WEBSITE_ID;
				script.dataset.domains = 'libresearch.ca,www.libresearch.ca';
				document.head.appendChild(script);
			}

			// Load FontAwesome after LCP-critical content.
			import('@fortawesome/fontawesome-free/css/all.css');
		});
	});
</script>

<svelte:head>
	<!-- Per-page `<meta name="description">` lives in each route, not here, so
	     pages don't end up with two description tags. -->
	<meta property="og:site_name" content="LibreSearch" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@LibreSearch" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="apple-touch-icon" href="/favicon.svg" />
	<link
		rel="search"
		type="application/opensearchdescription+xml"
		title="LibreSearch"
		href="/opensearch.xml"
	/>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{@render children()}

<InstallPrompt />
