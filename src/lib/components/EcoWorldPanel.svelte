<script lang="ts">
	import { settingsStore, ecoActive } from '$lib/stores/settings';

	let { variant = 'home' } = $props<{ variant?: 'home' | 'search' }>();

	let showTips = $derived(ecoActive($settingsStore, 'eco-impact-tips'));
	let showShortcuts = $derived(
		variant === 'home' && ecoActive($settingsStore, 'eco-green-shortcuts')
	);
	let showCharities = $derived(ecoActive($settingsStore, 'eco-support-charities'));

	const tips = [
		'Every search uses energy — fewer tabs and shorter queries add up globally.',
		'Dark themes on OLED screens draw less power than bright white backgrounds.',
		'Skipping autoplay and heavy media cuts bandwidth and data-center emissions.',
		'Choosing local results reduces how far data travels across the internet.',
		'Small habits scale: millions of lighter searches mean less grid load worldwide.'
	];

	const shortcuts = [
		{ label: 'Climate action', query: 'how to reduce carbon footprint' },
		{ label: 'Renewable energy', query: 'renewable energy benefits' },
		{ label: 'Ocean health', query: 'ocean plastic pollution solutions' },
		{ label: 'Reforestation', query: 'tree planting programs' }
	];

	const charities = [
		{ name: 'One Tree Planted', href: 'https://onetreeplanted.org/' },
		{ name: 'Cool Earth', href: 'https://www.coolearth.org/' },
		{ name: 'The Nature Conservancy', href: 'https://www.nature.org/' }
	];

	let tipIndex = $state(0);

	$effect(() => {
		if (!showTips) return;
		const timer = setInterval(() => {
			tipIndex = (tipIndex + 1) % tips.length;
		}, 9000);
		return () => clearInterval(timer);
	});
</script>

{#if showTips || showShortcuts || showCharities}
	<div
		class={variant === 'home'
			? 'mx-auto mt-6 w-full max-w-xl space-y-4 text-left'
			: 'mb-5 max-w-2xl rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3'}
	>
		{#if showTips}
			<p
				class={variant === 'home'
					? 'text-center text-xs leading-5 text-(--app-muted)'
					: 'text-xs leading-5 text-emerald-200/90'}
			>
				<i class="fa-solid fa-leaf mr-1.5 text-emerald-400"></i>
				{tips[tipIndex]}
			</p>
		{/if}

		{#if showShortcuts}
			<div class="flex flex-wrap justify-center gap-2">
				{#each shortcuts as item (item.query)}
					<a
						href="/search?q={encodeURIComponent(item.query)}"
						class="rounded-full border border-(--app-border) bg-(--app-surface) px-3 py-1 text-xs font-medium text-(--app-button) transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
					>
						{item.label}
					</a>
				{/each}
			</div>
		{/if}

		{#if showCharities}
			<div
				class={variant === 'home'
					? 'text-center text-xs text-(--app-muted)'
					: 'text-xs text-emerald-200/80'}
			>
				<span class="font-medium text-emerald-400">Support the planet:</span>
				{#each charities as org, i (org.href)}
					{#if i > 0}<span class="mx-1 opacity-40">·</span>{/if}
					<a
						href={org.href}
						target="_blank"
						rel="noopener noreferrer"
						class="underline-offset-2 transition hover:text-emerald-300 hover:underline"
					>
						{org.name}
					</a>
				{/each}
			</div>
		{/if}
	</div>
{/if}
