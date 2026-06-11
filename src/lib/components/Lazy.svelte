<script lang="ts">
	import type { Component } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { load, ...rest }: { load: () => Promise<{ default: Component<any> }> } & Record<string, unknown> =
		$props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let Comp = $state<Component<any> | null>(null);

	$effect(() => {
		let cancelled = false;
		load().then((mod) => {
			if (!cancelled) Comp = mod.default;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

{#if Comp}
	<Comp {...rest} />
{/if}
