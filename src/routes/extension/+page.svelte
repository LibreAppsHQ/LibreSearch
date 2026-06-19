<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type StoreStatus = 'available' | 'pending' | 'planned';

	type Browser = {
		name: string;
		icon: string;
		status: StoreStatus;
		url: string | null;
		note: string;
	};

	type Product = {
		id: string;
		name: string;
		tagline: string;
		description: string;
		browsers: Browser[];
		features: { icon: string; title: string; desc: string }[];
		permissions: { name: string; why: string }[];
		heroIcon: string;
		heroIconType: 'fa' | 'img';
		accent: string;
		githubPath: string;
	};

	const products: Product[] = [
		{
			id: 'search',
			name: 'LibreSearch',
			tagline: 'Private search, one click away.',
			description:
				'The LibreSearch browser extension puts a private search bar in your toolbar, a quick search in your address bar, and a "Search LibreSearch" option in your right-click menu. No tracking, no profiles, no ads.',
			heroIcon: '/ex-icon.png',
			heroIconType: 'img',
			accent: 'text-(--app-accent)',
			githubPath: 'LibreAppsHQ/LibreSearch/tree/main/extension',
			browsers: [
				{
					name: 'Microsoft Edge',
					icon: 'fa-edge',
					status: 'available',
					url: 'https://microsoftedge.microsoft.com/addons/detail/libresearch/ddcbildoepaboaieaplgnnhmmccpihoh',
					note: 'Submitted to the Edge Add-ons store. Published.'
				},
				{
					name: 'Google Chrome',
					icon: 'fa-chrome',
					status: 'available',
					url: '/libresearch-extension.crx',
					note: "Web Store won't accept my payment. Only .crx available. Works in Brave, Vivaldi, and Opera too."
				},
				{
					name: 'Mozilla Firefox',
					icon: 'fa-firefox-browser',
					status: 'available',
					url: 'https://addons.mozilla.org/en-US/firefox/addon/libresearch/',
					note: 'Approved.'
				}
			],
			features: [
				{
					icon: 'fa-magnifying-glass',
					title: 'Quick-search popup',
					desc: 'Click the toolbar icon to search Web, Images, Videos, or News without leaving your page.'
				},
				{
					icon: 'fa-arrow-pointer',
					title: 'Right-click anywhere',
					desc: 'Select text on any page, right-click, search LibreSearch in a new tab.'
				},
				{
					icon: 'fa-keyboard',
					title: 'Address-bar keyword',
					desc: 'Type "libre <query>" in the URL bar to search directly without first loading the site.'
				},
				{
					icon: 'fa-palette',
					title: 'Themes that follow you',
					desc: 'Auto, Dark, Light, Slate, and Sand. Settings sync across signed-in browsers.'
				}
			],
			permissions: [
				{
					name: 'contextMenus',
					why: 'Adds the right-click "Search LibreSearch for X" entry. Only sees the text you highlight and explicitly choose to send.'
				},
				{
					name: 'storage',
					why: 'Persists your preferences (default tab, region, theme) across browser sessions and devices.'
				}
			]
		},
		{
			id: 'guard',
			name: 'LibreGuard',
			tagline: "Browse like nobody's watching.",
			description:
				'LibreGuard strips out ads, trackers, and malicious requests before they reach you. Lightweight, open source, and entirely yours — no data leaves your browser.',
			heroIcon: '/guard.png',
			heroIconType: 'img',
			accent: 'text-emerald-400',
			githubPath: 'LibreAppsHQ/LibreGuard',
			browsers: [
				{
					name: 'Microsoft Edge',
					icon: 'fa-edge',
					status: 'available',
					url: '/libreguard.crx',
					note: 'Chromium-based. Same crx works in Edge, Brave, Vivaldi, and Opera.'
				},
				{
					name: 'Google Chrome',
					icon: 'fa-chrome',
					status: 'available',
					url: '/libreguard.crx',
					note: 'Works in Brave, Vivaldi, and Opera too.'
				},
				{
					name: 'Mozilla Firefox',
					icon: 'fa-firefox-browser',
					status: 'planned',
					url: null,
					note: 'Firefox support planned after initial release.'
				}
			],
			features: [
				{
					icon: 'fa-ban',
					title: 'Ad blocking',
					desc: 'Blocks intrusive ads, banners, and popups. Pages load faster, use less data, and read cleaner.'
				},
				{
					icon: 'fa-eye-slash',
					title: 'Tracker blocking',
					desc: 'Stops analytics scripts, tracking pixels, and fingerprinters from following you across the web.'
				},
				{
					icon: 'fa-shield',
					title: 'Malware protection',
					desc: 'Blocks known malicious domains, crypto miners, and phishing attempts before they load.'
				},
				{
					icon: 'fa-gauge-high',
					title: 'Lightweight engine',
					desc: 'Runs entirely in-browser with minimal memory. No cloud backend, no data collection, no latency.'
				}
			],
			permissions: [
				{
					name: 'declarativeNetRequest',
					why: 'Blocks network requests matching known ad, tracker, and malware patterns. All rules are local — nothing is sent to a remote server.'
				},
				{
					name: 'storage',
					why: 'Saves your custom filter lists, allowlisted sites, and preferences. Everything stays on your device.'
				}
			]
		}
	];

	// svelte-ignore state_referenced_locally -- seeded from ?product= on load
	let active = $state(data.initialProduct);

	function selectProduct(id: string) {
		active = id;
		if (typeof history !== 'undefined') {
			const url = new URL(window.location.href);
			if (id === 'guard') {
				url.searchParams.set('product', 'guard');
			} else {
				url.searchParams.delete('product');
			}
			history.replaceState({}, '', url);
		}
	}

	const current = $derived(products.find((p) => p.id === active) ?? products[0]);
	const usesCrx = $derived(current.browsers.some((b) => b.url?.endsWith('.crx')));

	const jsonLd =
		`<script type="application/ld+json">` +
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: 'LibreSearch browser extension',
			url: 'https://libresearch.ca/extension',
			applicationCategory: 'BrowserApplication',
			operatingSystem: 'Chrome, Edge, Firefox',
			description:
				'Search the web privately from your toolbar, address bar, or right-click menu. The LibreSearch extension adds zero-tracking search to Chrome, Edge, and Firefox.',
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
		}) +
		'</' +
		'script>';
</script>

<svelte:head>
	<title>Browser extensions - LibreSearch</title>
	<meta
		name="description"
		content="Browse privately and securely with LibreSearch browser extensions. LibreSearch for private search, LibreGuard for ad and tracker blocking."
	/>
	<link rel="canonical" href="https://libresearch.ca/extension" />
	<meta property="og:title" content="LibreSearch browser extensions" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
	<meta
		property="og:description"
		content="Private search and tracker blocking in your browser. No tracking, no profiles, no ads."
	/>
	<meta property="og:url" content="https://libresearch.ca/extension" />
	{@html jsonLd}
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Extensions
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<!-- Product picker -->
	<section class="mx-auto w-full max-w-[400px] px-6 pt-12 sm:pt-16">
		<div class="flex rounded-full border border-(--app-border) bg-(--app-surface) p-1 shadow-sm">
			{#each products as p}
				<button
					type="button"
					onclick={() => selectProduct(p.id)}
					class="flex flex-1 items-center justify-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all {active ===
					p.id
						? 'bg-(--app-background) text-(--app-button-hover) shadow-xs'
						: 'text-(--app-muted) hover:text-(--app-button-hover)'}"
				>
					<img src={p.heroIcon} alt="" class="h-5 w-5 rounded-sm" />
					<span>{p.name}</span>
				</button>
			{/each}
		</div>
	</section>

	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 text-center sm:py-16">
		{#key current.id}
			<div transition:fly={{ y: 12, duration: 250, easing: cubicOut }}>
				<span
					class="mb-6 inline-flex items-center gap-2 rounded-full border border-(--app-border) bg-(--app-surface) px-3 py-1 text-xs font-semibold tracking-widest uppercase {current.accent}"
				>
					<i class="fa-brands fa-chrome"></i>
					<i class="fa-brands fa-edge"></i>
					<i class="fa-brands fa-firefox-browser"></i>
					Cross-browser
				</span>
				<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
					{current.tagline}
				</h1>
				<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-(--app-muted)">
					{current.description}
				</p>
			</div>
		{/key}
	</section>

	<!-- Install row -->
	<section class="mx-auto w-full max-w-[1100px] px-6 pb-16">
		{#key current.id}
			<div transition:fly={{ y: 12, duration: 250, easing: cubicOut }}>
				<div class="grid gap-4 sm:grid-cols-3">
					{#each current.browsers as b, i (i)}
						<div
							class="flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-6"
						>
							<div class="flex items-center justify-between">
								<i class="fa-brands {b.icon} text-3xl text-(--app-accent)"></i>
								{#if b.status === 'available'}
									<span
										class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 uppercase"
										>Available</span
									>
								{:else if b.status === 'pending'}
									<span
										class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-amber-400 uppercase"
										>In review</span
									>
								{:else}
									<span
										class="rounded-full bg-(--app-hover) px-2 py-0.5 text-[10px] font-semibold tracking-wider text-(--app-muted) uppercase"
										>Coming soon</span
									>
								{/if}
							</div>
							<div>
								<h2 class="text-base font-semibold text-(--app-text)">{b.name}</h2>
								<p class="mt-2 text-sm leading-6 text-(--app-muted)">{b.note}</p>
							</div>
							{#if b.url}
								<a
									href={b.url}
									target="_blank"
									rel="noopener noreferrer"
									class="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-(--app-accent) px-4 py-2 text-sm font-semibold text-[#0d1019] transition-opacity hover:opacity-90"
								>
									Install <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
								</a>
							{:else}
								<button
									type="button"
									disabled
									class="mt-auto inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-(--app-border) bg-(--app-hover) px-4 py-2 text-sm font-semibold text-(--app-muted)"
								>
									Not yet available
								</button>
							{/if}
						</div>
					{/each}
				</div>

				{#if usesCrx}
					<div
						class="mt-8 rounded-2xl border border-(--app-border) bg-(--app-surface) p-6 text-left"
					>
						<p class="text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
							Installing from .crx
						</p>
						<h3 class="mt-2 text-base font-semibold text-(--app-text)">
							Chrome, Brave, Edge, Vivaldi, or Opera
						</h3>
						<p class="mt-2 text-sm leading-6 text-(--app-muted)">
							These browsers are not in a web store yet, so you install from a downloaded
							<code class="rounded bg-(--app-hover) px-1 py-0.5 text-xs">.crx</code> file. The steps are
							the same for Chromium-based browsers.
						</p>
						<ol class="mt-4 space-y-2.5 text-sm leading-6 text-(--app-text)">
							<li>
								1. Click <strong>Install</strong> above and save the
								<code class="text-xs">.crx</code> file.
							</li>
							<li>
								2. Open your browser's extensions page (<code class="text-xs"
									>chrome://extensions</code
								>
								or <code class="text-xs">edge://extensions</code>).
							</li>
							<li>3. Turn on <strong>Developer mode</strong> (toggle in the top-right corner).</li>
							<li>
								4. Drag the downloaded <code class="text-xs">.crx</code> onto the page, then confirm.
							</li>
						</ol>
						<p class="mt-4 text-xs leading-5 text-(--app-muted)">
							If drag-and-drop is blocked, use <strong>Load unpacked</strong> after extracting the
							extension from
							<a
								href="https://github.com/{current.githubPath}"
								target="_blank"
								rel="noopener noreferrer"
								class="text-(--app-accent) hover:underline">GitHub</a
							>.
						</p>
					</div>
				{/if}

				<p class="mt-6 text-center text-xs text-(--app-muted)">
					Power users can sideload the development build from
					<a
						href="https://github.com/{current.githubPath}"
						target="_blank"
						rel="noopener noreferrer"
						class="text-(--app-accent) hover:underline">GitHub</a
					>.
				</p>
			</div>
		{/key}
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Features -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-20">
		{#key current.id}
			<div transition:fly={{ y: 12, duration: 250, easing: cubicOut }}>
				<p
					class="mb-3 text-center text-xs font-semibold tracking-widest uppercase {current.accent}"
				>
					What it does
				</p>
				<h2 class="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
					{active === 'search'
						? "Search without leaving the page you're on."
						: 'Browse without being watched.'}
				</h2>
				<div class="grid gap-6 sm:grid-cols-2">
					{#each current.features as f, i (i)}
						<div
							class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-6 transition-colors hover:bg-(--app-hover)"
						>
							<div
								class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-accent)/15 text-(--app-accent)"
							>
								<i class="fa-solid {f.icon}"></i>
							</div>
							<h3 class="text-lg font-semibold">{f.title}</h3>
							<p class="mt-2 text-sm leading-6 text-(--app-muted)">{f.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		{/key}
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Permissions -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-20">
		{#key current.id}
			<div transition:fly={{ y: 12, duration: 250, easing: cubicOut }}>
				<p
					class="mb-3 text-center text-xs font-semibold tracking-widest uppercase {current.accent}"
				>
					Permissions, explained
				</p>
				<h2 class="mb-4 text-center text-2xl font-bold tracking-tight sm:text-3xl">
					{active === 'search'
						? 'The extension asks for as little as possible.'
						: 'Nothing leaves your browser.'}
				</h2>
				<p class="mx-auto mb-12 max-w-2xl text-center text-sm leading-6 text-(--app-muted)">
					{active === 'search'
						? 'Most extensions request "read and change all your data on the websites you visit." This one doesn\'t. There are no host permissions — it can\'t see, read, or modify any page you load.'
						: 'LibreGuard processes everything locally. No cloud, no logs, no accounts. Every blocked request stays between you and your browser.'}
				</p>

				<div
					class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)"
				>
					{#each current.permissions as p, i (i)}
						<div class="p-6 {i > 0 ? 'border-t border-(--app-border)' : ''}">
							<p class="font-mono text-sm text-(--app-accent)">{p.name}</p>
							<p class="mt-2 text-sm leading-6 text-(--app-text)">{p.why}</p>
						</div>
					{/each}
				</div>
			</div>
		{/key}
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- CTA -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 text-center sm:py-20">
		{#key current.id}
			<div transition:fly={{ y: 12, duration: 250, easing: cubicOut }}>
				{#if active === 'search'}
					<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Open source, AGPL-3.0</h2>
					<p class="mx-auto mt-4 max-w-lg text-sm leading-6 text-(--app-muted)">
						Read the code, file an issue, or fork it. The extension lives in the same repository as
						the LibreSearch website.
					</p>
					<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
						<a
							href="https://github.com/{current.githubPath}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-semibold text-(--app-button) transition-colors hover:bg-(--app-hover) hover:text-(--app-button-hover)"
						>
							<i class="fa-brands fa-github"></i>
							View source
						</a>
						<a
							href="/privacy"
							class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-semibold text-(--app-button) transition-colors hover:bg-(--app-hover) hover:text-(--app-button-hover)"
						>
							<i class="fa-solid fa-shield-halved"></i>
							Privacy policy
						</a>
					</div>
				{:else}
					<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Open source, AGPL-3.0</h2>
					<p class="mx-auto mt-4 max-w-lg text-sm leading-6 text-(--app-muted)">
						LibreGuard is free, open source, and built to stay that way. No premium tiers, no data
						collection, no tricks.
					</p>
					<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
						<a
							href="https://github.com/{current.githubPath}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-semibold text-(--app-button) transition-colors hover:bg-(--app-hover) hover:text-(--app-button-hover)"
						>
							<i class="fa-brands fa-github"></i>
							View source
						</a>
						<a
							href="/privacy"
							class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-semibold text-(--app-button) transition-colors hover:bg-(--app-hover) hover:text-(--app-button-hover)"
						>
							<i class="fa-solid fa-shield-halved"></i>
							Privacy policy
						</a>
					</div>
				{/if}
			</div>
		{/key}
	</section>

	<SiteFooter />
</main>
