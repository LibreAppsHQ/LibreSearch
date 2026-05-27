<script lang="ts">
	import { themeStore } from '$lib/stores/theme';

	interface Props {
		class?: string;
	}
	let { class: className = '' }: Props = $props();

	// 'light' and 'sand' render on light backgrounds, so they need the dark logo.
	const lightThemes = ['light', 'sand'];
	let src = $derived(lightThemes.includes($themeStore) ? '/logo_dark.svg' : '/2.svg');
</script>

<img {src} alt="Launchpad logo" class={className} />
