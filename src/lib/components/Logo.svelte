<script lang="ts">
	import { themeStore } from '$lib/stores/theme';

	interface Props {
		class?: string;
		fetchpriority?: 'high' | 'low' | 'auto';
	}
	let { class: className = '', fetchpriority }: Props = $props();

	// Light themes need the dark logo so it stays visible.
	const lightThemes = ['light', 'sand', 'sakura'];
	let src = $derived(lightThemes.includes($themeStore) ? '/logo_dark.svg' : '/2.svg');
</script>

<img
	{src}
	alt="LibreSearch logo"
	class={className}
	width="1200"
	height="500"
	decoding="async"
	{fetchpriority}
/>
