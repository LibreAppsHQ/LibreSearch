<script lang="ts">
	import './layout.css';
	import { browser, dev } from '$app/environment';
	import { themeStore } from '$lib/stores/theme';
	import { settingsStore, getToggle } from '$lib/stores/settings';
	import { historyStore } from '$lib/stores/history';
	import { onMount } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	let { children } = $props();

	let keyboardShortcut = $derived(getToggle($settingsStore, 'keyboard-shortcut'));
	let reduceMotion = $derived(getToggle($settingsStore, 'reduce-motion', false));

	// Vercel SDKs must run client-side inside lifecycle
	onMount(() => {
		if (!browser) return;

		injectSpeedInsights();

		if (!dev) {
			injectAnalytics();
		}
	});

	$effect(() => {
		if (reduceMotion) {
			document.documentElement.setAttribute('data-reduce-motion', '');
		} else {
			document.documentElement.removeAttribute('data-reduce-motion');
		}
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
		themeStore.load();
		settingsStore.load();
		historyStore.load();

		// Load FontAwesome after first paint so it doesn't block FCP/LCP.
		import('@fortawesome/fontawesome-free/css/all.css');
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
	<link rel="icon" type="image/png" href="/logo.png" />
	<link rel="apple-touch-icon" href="/logo.png" />
	<link
		rel="search"
		type="application/opensearchdescription+xml"
		title="LibreSearch"
		href="/opensearch.xml"
	/>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{@render children()}