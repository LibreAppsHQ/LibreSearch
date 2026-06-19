<script lang="ts">
	import type { SearchTab } from '$lib/search';

	interface Props {
		tab?: SearchTab;
	}
	let { tab = 'web' }: Props = $props();

	const rows = [0, 1, 2, 3, 4, 5];
	const grid = [0, 1, 2, 3, 4, 5, 6, 7, 8];
</script>

<div class="animate-fade-in" aria-busy="true" aria-live="polite">
	<div class="mb-4 flex items-center gap-2 text-sm text-(--app-muted)">
		<i class="fa-solid fa-circle-notch fa-spin"></i>
		<span class="sr-only">Loading</span>
		<span>Loading results…</span>
	</div>

	{#if tab === 'images'}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
			{#each grid as _, i (i)}
				<div class="skeleton aspect-square w-full rounded-xl"></div>
			{/each}
		</div>
	{:else if tab === 'videos'}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each grid.slice(0, 6) as _, i (i)}
				<div class="space-y-2">
					<div class="skeleton aspect-video w-full rounded-xl"></div>
					<div class="skeleton h-4 w-11/12 rounded"></div>
					<div class="skeleton h-3 w-1/2 rounded"></div>
				</div>
			{/each}
		</div>
	{:else if tab === 'maps'}
		<div class="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
			<ol class="order-2 space-y-1.5 lg:order-1">
				{#each rows as _, i (i)}
					<li class="space-y-2 rounded-xl bg-(--app-surface) p-3.5">
						<div class="skeleton h-4 w-2/3 rounded"></div>
						<div class="skeleton h-3 w-full rounded"></div>
					</li>
				{/each}
			</ol>
			<div class="skeleton order-1 h-[320px] w-full rounded-2xl lg:order-2 lg:h-[560px]"></div>
		</div>
	{:else if tab === 'news'}
		<ol class="space-y-4">
			{#each rows as _, i (i)}
				<li class="flex gap-4">
					<div class="skeleton h-[72px] w-28 shrink-0 rounded-xl"></div>
					<div class="flex-1 space-y-2 py-1">
						<div class="skeleton h-3 w-32 rounded"></div>
						<div class="skeleton h-4 w-3/4 rounded"></div>
						<div class="skeleton h-3 w-full rounded"></div>
					</div>
				</li>
			{/each}
		</ol>
	{:else}
		<ol class="space-y-6">
			{#each rows as _, i (i)}
				<li class="space-y-2">
					<div class="flex items-center gap-2.5">
						<div class="skeleton h-7 w-7 shrink-0 rounded-full"></div>
						<div class="space-y-1.5">
							<div class="skeleton h-3 w-28 rounded"></div>
							<div class="skeleton h-2.5 w-40 rounded"></div>
						</div>
					</div>
					<div class="skeleton h-5 w-2/3 rounded"></div>
					<div class="skeleton h-3 w-full rounded"></div>
					<div class="skeleton h-3 w-11/12 rounded"></div>
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
