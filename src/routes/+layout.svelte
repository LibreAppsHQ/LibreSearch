<script lang="ts">
	import './layout.css';
	import { themeStore } from '$lib/stores/theme';
	import { settingsStore, getToggle } from '$lib/stores/settings';
	import { historyStore } from '$lib/stores/history';
	import { onMount } from 'svelte';

	let { children } = $props();

	let keyboardShortcut = $derived(getToggle($settingsStore, 'keyboard-shortcut'));
	let reduceMotion = $derived(getToggle($settingsStore, 'reduce-motion', false));

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
	});
</script>

<svelte:head>
	<meta
		name="description"
		content="Search the web privately with Launchpad. No tracking, no profiles, no ads. Fast, clean results from an independent search index."
	/>
	<meta property="og:site_name" content="Launchpad" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@Launchpad" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="icon" type="image/png" href="/logo.png" />
	<link
		rel="search"
		type="application/opensearchdescription+xml"
		title="Launchpad"
		href="/opensearch.xml"
	/>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{@render children()}
