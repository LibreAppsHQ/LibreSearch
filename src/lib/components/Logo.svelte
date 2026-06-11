<script lang="ts">
	import { themeStore } from '$lib/stores/theme';

	interface Props {
		class?: string;
		fetchpriority?: 'high' | 'low' | 'auto';
	}
	let { class: className = '', fetchpriority }: Props = $props();

	// 'light' and 'sand' render on light backgrounds, so they need the dark logo.
	const lightThemes = ['light', 'sand'];
	let src = $derived(lightThemes.includes($themeStore) ? '/logo_dark.svg' : '/2.svg');
</script>

<img
	{src}
	alt="LibreSearch logo"
	class={className}
	width="1200"
	height="500"
	decoding="async"
	fetchpriority={fetchpriority}
/>
