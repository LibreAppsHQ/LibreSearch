<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import AltchaBadge from '$lib/components/AltchaBadge.svelte';

	const tiers = [
		{
			name: 'Supporter',
			amount: '$5',
			cadence: 'one-time',
			desc: 'Buy us a coffee and help cover a slice of the monthly server bill.',
			icon: 'fa-mug-hot',
			color: 'text-emerald-400',
			bg: 'bg-emerald-500/15',
			featured: false
		},
		{
			name: 'Sustainer',
			amount: '$10',
			cadence: 'per month',
			desc: 'Keep the proxy running and the index fresh. Our most popular way to help.',
			icon: 'fa-heart',
			color: 'text-(--app-accent)',
			bg: 'bg-(--app-accent)/15',
			featured: true
		},
		{
			name: 'Patron',
			amount: '$25',
			cadence: 'per month',
			desc: 'Fund new features and faster infrastructure for everyone.',
			icon: 'fa-star',
			color: 'text-violet-400',
			bg: 'bg-violet-500/15',
			featured: false
		}
	];

	const wallets = [
		{
			label: 'Bitcoin',
			ticker: 'BTC',
			icon: 'fa-brands fa-bitcoin',
			color: 'text-amber-400',
			bg: 'bg-amber-500/15',
			address: 'bc1qh3xzzm84swq39l3haupahjgk8zq9tz6mty2x2e'
		},
		{
			label: 'Ethereum',
			ticker: 'ETH',
			icon: 'fa-brands fa-ethereum',
			color: 'text-indigo-400',
			bg: 'bg-indigo-500/15',
			address: '0x32e51C4B8053921077C8c34865E2c67E229bE941'
		}
	];

	let copied = $state<string | null>(null);

	async function copy(ticker: string, address: string) {
		try {
			await navigator.clipboard.writeText(address);
			copied = ticker;
			setTimeout(() => {
				if (copied === ticker) copied = null;
			}, 2000);
		} catch {
			copied = null;
		}
	}
</script>

<svelte:head>
	<title>Donate</title>
	<meta
		name="description"
		content="LibreSearch runs on donations, not ads. Support a private search engine that never logs your queries or sells your data."
	/>
	<link rel="canonical" href="https://libresearch.ca/donate" />

	<!-- Open Graph -->
	<meta property="og:title" content="Donate - LibreSearch" />
	<meta
		property="og:description"
		content="LibreSearch runs on donations, not ads. Support a private search engine that never logs your queries or sells your data."
	/>
	<meta property="og:url" content="https://libresearch.ca/donate" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />

	<!-- Twitter -->
	<meta name="twitter:title" content="Donate - LibreSearch" />
	<meta
		name="twitter:description"
		content="LibreSearch runs on donations, not ads. Support a private search engine that never logs your queries or sells your data."
	/>
</svelte:head>

<!-- Sticky header -->
<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">Donate</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main
	class="bg-(--app-background) bg-cover bg-fixed bg-center bg-no-repeat text-(--app-text)"
	style="background-image: url('/background.jpg');"
>
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 text-center sm:py-24">
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
			No ads. No trackers.<br />
			<span class="text-(--app-accent)">Just your support.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-white">
			LibreSearch refuses to sell ads or profile your searches, which means the only thing keeping
			the servers on is people like you. Every contribution goes straight to infrastructure.
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a
				href="#tiers"
				class="inline-flex items-center gap-2 rounded-xl bg-(--app-accent) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
			>
				<i class="fa-solid fa-heart"></i>
				Become a supporter
			</a>
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Tiers -->
	<section id="tiers" class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<p class="mb-3 text-center text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
			Ways to give
		</p>
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight">
			Pick an amount that feels right.
		</h2>
		<div class="grid gap-6 sm:grid-cols-3">
			{#each tiers as tier, i (i)}
				<div
					class="rounded-2xl border bg-(--app-card) p-7 backdrop-blur-sm {tier.featured
						? 'border-(--app-accent)'
						: 'border-(--app-border)'}"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl {tier.bg} {tier.color}"
					>
						<i class="fa-solid {tier.icon} text-xl"></i>
					</div>
					<h3 class="mb-1 text-lg font-semibold">{tier.name}</h3>
					<p class="mb-3">
						<span class="text-3xl font-bold">{tier.amount}</span>
						<span class="text-sm text-(--app-muted)">{tier.cadence}</span>
					</p>
					<p class="text-sm leading-7 text-(--app-muted)">{tier.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Methods -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<p class="mb-3 text-center text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
			Choose a method
		</p>
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight">
			Every dollar keeps us online.
		</h2>

		<div class="mx-auto max-w-[640px]">
			<!-- Crypto -->
			<div
				class="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-card) p-7 backdrop-blur-sm"
			>
				<div>
					<p class="mb-1 text-lg font-semibold">Crypto</p>
					<p class="text-sm leading-6 text-(--app-muted)">
						Send any amount directly — no platform fees, no account. Tap an address to copy it.
					</p>
				</div>
				<div class="space-y-3">
					{#each wallets as wallet, i (i)}
						<div class="rounded-xl border border-(--app-border) bg-(--app-background)/40 p-4">
							<div class="mb-2 flex items-center gap-2">
								<span
									class="flex h-7 w-7 items-center justify-center rounded-lg {wallet.bg} {wallet.color}"
								>
									<i class="{wallet.icon} text-sm"></i>
								</span>
								<span class="text-sm font-semibold">{wallet.label}</span>
								<span class="text-xs text-(--app-muted)">{wallet.ticker}</span>
							</div>
							<button
								type="button"
								onclick={() => copy(wallet.ticker, wallet.address)}
								class="flex w-full items-center gap-3 rounded-lg bg-(--app-card) px-3 py-2 text-left transition hover:bg-(--app-hover)"
							>
								<code class="flex-1 truncate font-mono text-xs text-(--app-text)"
									>{wallet.address}</code
								>
								<i
									class="fa-solid shrink-0 text-xs {copied === wallet.ticker
										? 'fa-check text-emerald-400'
										: 'fa-copy text-(--app-muted)'}"
								></i>
							</button>
							{#if copied === wallet.ticker}
								<p class="mt-1.5 text-xs text-emerald-400">Address copied to clipboard</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Where it goes -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-24">
			<div>
				<p class="mb-3 text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
					Where it goes
				</p>
				<h2 class="mb-6 text-3xl font-bold tracking-tight">100% to keeping search free.</h2>
				<p class="mb-4 text-sm leading-7 text-(--app-muted)">
					LibreSearch has no investors and no advertising revenue. Donations cover the real costs of
					running a private search engine — nothing more.
				</p>
				<p class="text-sm leading-7 text-(--app-muted)">
					Can't donate? Sharing LibreSearch, reporting bugs, or contributing on GitHub helps just as
					much.
				</p>
			</div>
			<div class="space-y-3">
				{#each [{ icon: 'fa-server', label: 'Servers and bandwidth for the search proxy', color: 'text-(--app-accent)', bg: 'bg-(--app-accent)/10' }, { icon: 'fa-shield-halved', label: 'Bot protection and abuse prevention', color: 'text-blue-400', bg: 'bg-blue-500/10' }, { icon: 'fa-code', label: 'Development of new features', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }, { icon: 'fa-globe', label: 'Domains, certificates, and uptime monitoring', color: 'text-violet-400', bg: 'bg-violet-500/10' }] as item, i (i)}
					<div
						class="flex items-center gap-4 rounded-2xl border border-(--app-border) bg-(--app-card) px-5 py-4 backdrop-blur-sm"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl {item.bg} {item.color}"
						>
							<i class="fa-solid {item.icon} text-sm"></i>
						</div>
						<span class="text-sm font-medium">{item.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<SiteFooter />
<AltchaBadge />
