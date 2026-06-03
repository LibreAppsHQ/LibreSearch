<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type StoreStatus = 'available' | 'pending' | 'planned';

	type Browser = {
		name: string;
		icon: string;
		status: StoreStatus;
		url: string | null;
		note: string;
	};

	// Update these as each store approves the listing.
	const browsers: Browser[] = [
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
			status: 'pending',
			url: null,
			note: 'Coming after Edge approval, via Mozilla Add-ons.'
		}
	];

	const features = [
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
	];

	const permissions = [
		{
			name: 'contextMenus',
			why: 'Adds the right-click "Search LibreSearch for X" entry. Only sees the text you highlight and explicitly choose to send.'
		},
		{
			name: 'storage',
			why: 'Persists your preferences (default tab, region, theme) across browser sessions and devices.'
		}
	];
</script>

<svelte:head>
	<title>Browser extension - LibreSearch</title>
	<meta
		name="description"
		content="Search the web privately from your toolbar, address bar, or right-click menu. The LibreSearch extension adds zero-tracking search to Chrome, Edge, and Firefox."
	/>
	<link rel="canonical" href="https://libresearch.ca/extension" />
	<meta property="og:title" content="LibreSearch browser extension" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
	<meta
		property="og:description"
		content="Private search in your toolbar. No tracking, no profiles, no ads."
	/>
	<meta property="og:url" content="https://libresearch.ca/extension" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Extension
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 text-center sm:py-24">
		<span
			class="mb-6 inline-flex items-center gap-2 rounded-full border border-(--app-border) bg-(--app-surface) px-3 py-1 text-xs font-semibold tracking-widest text-(--app-accent) uppercase"
		>
			<i class="fa-brands fa-chrome"></i>
			<i class="fa-brands fa-edge"></i>
			<i class="fa-brands fa-firefox-browser"></i>
			Cross-browser
		</span>
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
			Private search,<br />
			<span class="text-(--app-accent)">one click away.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-(--app-muted)">
			The LibreSearch browser extension puts a private search bar in your toolbar, a quick search in
			your address bar, and a "Search LibreSearch" option in your right-click menu. No tracking, no
			profiles, no ads — and no permissions to read your pages.
		</p>
	</section>

	<!-- Install row -->
	<section class="mx-auto w-full max-w-[1100px] px-6 pb-16">
		<div class="grid gap-4 sm:grid-cols-3">
			{#each browsers as b, i (i)}
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

		<p class="mt-6 text-center text-xs text-(--app-muted)">
			Power users can sideload the development build from
			<a
				href="https://github.com/Arcbasehq/LibreSearch/tree/main/extension"
				target="_blank"
				rel="noopener noreferrer"
				class="text-(--app-accent) hover:underline">GitHub</a
			>.
		</p>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Features -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-20">
		<p class="mb-3 text-center text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
			What it does
		</p>
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
			Search without leaving the page you're on.
		</h2>
		<div class="grid gap-6 sm:grid-cols-2">
			{#each features as f, i (i)}
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
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Permissions -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-20">
		<p class="mb-3 text-center text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
			Permissions, explained
		</p>
		<h2 class="mb-4 text-center text-2xl font-bold tracking-tight sm:text-3xl">
			The extension asks for as little as possible.
		</h2>
		<p class="mx-auto mb-12 max-w-2xl text-center text-sm leading-6 text-(--app-muted)">
			Most extensions request "read and change all your data on the websites you visit." This one
			doesn't. There are no host permissions — it can't see, read, or modify any page you load.
		</p>

		<div
			class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)"
		>
			{#each permissions as p, i (i)}
				<div class="p-6 {i > 0 ? 'border-t border-(--app-border)' : ''}">
					<p class="font-mono text-sm text-(--app-accent)">{p.name}</p>
					<p class="mt-2 text-sm leading-6 text-(--app-text)">{p.why}</p>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- CTA -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 text-center sm:py-20">
		<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Open source, AGPL-3.0</h2>
		<p class="mx-auto mt-4 max-w-lg text-sm leading-6 text-(--app-muted)">
			Read the code, file an issue, or fork it. The extension lives in the same repository as the
			LibreSearch website.
		</p>
		<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
			<a
				href="https://github.com/Arcbasehq/LibreSearch/tree/main/extension"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-semibold text-(--app-text) transition-colors hover:bg-(--app-hover)"
			>
				<i class="fa-brands fa-github"></i>
				View source
			</a>
			<a
				href="/privacy"
				class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-semibold text-(--app-text) transition-colors hover:bg-(--app-hover)"
			>
				<i class="fa-solid fa-shield-halved"></i>
				Privacy policy
			</a>
		</div>
	</section>

	<SiteFooter />
</main>
