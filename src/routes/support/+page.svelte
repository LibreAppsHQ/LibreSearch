<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import AltchaBadge from '$lib/components/AltchaBadge.svelte';

	// Help categories shown as cards under the hero. Each links to the most
	// relevant existing page on the site so support stays a thin index over
	// content we already maintain rather than a second copy of it.
	const categories = [
		{
			title: 'Getting Started',
			body: 'Set LibreSearch as your default and start searching privately.',
			href: '/extension',
			icon: 'rocket'
		},
		{
			title: 'Search Features',
			body: 'Operators, filters, and syntax to sharpen your results.',
			href: '/syntax',
			icon: 'search'
		},
		{
			title: 'Privacy & Security',
			body: 'How we protect your queries. Policies, technology, legal.',
			href: '/privacy',
			icon: 'shield'
		},
		{
			title: 'Settings',
			body: 'Themes, regions, safe search, and other preferences.',
			href: '/settings',
			icon: 'gear'
		}
	];

	// Searchable knowledge base. Kept inline and client-side so the support
	// page ships no tracking and works without a backend. `keywords` widens
	// what each article matches without cluttering the visible text.
	type Article = {
		title: string;
		excerpt: string;
		href: string;
		category: string;
		keywords?: string;
	};

	const articles: Article[] = [
		{
			title: 'How do I make LibreSearch my default search engine?',
			excerpt: 'Add LibreSearch to your browser so every search bar query stays private.',
			href: '/extension',
			category: 'Getting Started',
			keywords: 'default browser chrome firefox edge safari install extension addon opensearch'
		},
		{
			title: 'Does LibreSearch log my searches?',
			excerpt: 'No. We never log queries, build profiles, or sell ads. Here is how that works.',
			href: '/privacy',
			category: 'Privacy & Security',
			keywords: 'logging tracking data retention profile ads anonymous'
		},
		{
			title: 'Search operators and syntax',
			excerpt: 'Use quotes, site:, minus, and more to narrow exactly what you want.',
			href: '/syntax',
			category: 'Search Features',
			keywords: 'operators site filetype intitle exclude quotes boolean advanced'
		},
		{
			title: 'Change theme, region, and safe search',
			excerpt: 'Tune appearance and result preferences. Settings are stored on your device.',
			href: '/settings',
			category: 'Settings',
			keywords: 'theme dark light region language safesearch preferences localstorage'
		},
		{
			title: 'How is LibreSearch funded without ads?',
			excerpt: 'Learn about our model and how to support the project.',
			href: '/donate',
			category: 'Company',
			keywords: 'funding money donate support sponsor business model'
		},
		{
			title: 'Report a bug or security issue',
			excerpt: 'Found something broken or a vulnerability? Here is how to reach us.',
			href: '/security',
			category: 'Privacy & Security',
			keywords: 'bug vulnerability disclosure report security responsible'
		},
		{
			title: 'Where do search results come from?',
			excerpt: 'Understand our sources and how results are ranked without personalization.',
			href: '/about',
			category: 'Search Features',
			keywords: 'sources index ranking results provider where'
		},
		{
			title: 'Privacy policy and data requests',
			excerpt: 'Read the full policy and how to make a privacy or data request.',
			href: '/privacy',
			category: 'Privacy & Security',
			keywords: 'gdpr ccpa data request policy legal terms delete'
		},
		{
			title: 'Service status and uptime',
			excerpt: 'Check whether LibreSearch is up and view current incidents.',
			href: '/status',
			category: 'Getting Started',
			keywords: 'status uptime down outage incident slow not working'
		},
		{
			title: 'Contact the LibreSearch team',
			excerpt: 'Questions the help center did not answer? Send us a message.',
			href: '/contact',
			category: 'Company',
			keywords: 'contact email support request help reach'
		}
	];

	let query = $state('');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return articles;
		return articles.filter((a) =>
			`${a.title} ${a.excerpt} ${a.category} ${a.keywords ?? ''}`.toLowerCase().includes(q)
		);
	});

	// Articles surfaced by default when the user has not searched yet.
	const promoted = articles.slice(0, 6);
	const visible = $derived(query.trim() ? filtered : promoted);
</script>

<svelte:head>
	<title>Support - LibreSearch</title>
	<meta
		name="description"
		content="LibreSearch Help Center. Find answers about private search, browser setup, search operators, privacy, and settings — or submit a request."
	/>
	<link rel="canonical" href="https://support.libresearch.ca" />

	<!-- Open Graph -->
	<meta property="og:title" content="Support - LibreSearch" />
	<meta
		property="og:description"
		content="LibreSearch Help Center. How can we help?"
	/>
	<meta property="og:url" content="https://support.libresearch.ca" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />

	<!-- Twitter -->
	<meta name="twitter:title" content="Support - LibreSearch" />
	<meta name="twitter:description" content="LibreSearch Help Center. How can we help?" />
</svelte:head>

<!-- Sticky header -->
<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="flex items-center gap-3 justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
				<span class="hidden text-(--app-muted) sm:inline">|</span>
				<span class="hidden text-(--app-muted) sm:inline">Support</span>
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Help Center
			</p>
			<div class="flex items-center gap-4 justify-self-end">
				<a
					href="/contact"
					class="hidden rounded-full px-4 py-2 text-sm font-medium text-(--app-accent) transition hover:bg-(--app-surface) sm:inline-block"
				>
					Submit a request
				</a>
				<SiteMenu />
			</div>
		</div>
	</div>
</header>

<main class="relative overflow-hidden bg-(--app-background) text-(--app-text)">
	<!-- Curving accent backdrop, matching the rest of the site -->
	<div class="pointer-events-none absolute inset-0 top-0 z-0" aria-hidden="true">
		<svg
			class="absolute top-0 left-0 h-[70vh] w-full"
			viewBox="0 0 1440 600"
			preserveAspectRatio="none"
		>
			<path
				d="M0,0 L1440,0 L1440,300 C1180,440 980,260 720,320 C460,380 280,460 0,360 Z"
				fill="var(--app-accent)"
				fill-opacity="0.85"
			/>
		</svg>
		<svg
			class="absolute top-0 left-0 h-[70vh] w-full"
			viewBox="0 0 1440 600"
			preserveAspectRatio="none"
		>
			<path
				d="M0,120 C320,20 540,220 760,170 C1010,110 1230,240 1440,150 L1440,300 C1230,420 1010,260 760,330 C540,390 320,180 0,290 Z"
				fill="var(--app-accent)"
				fill-opacity="0.35"
			/>
		</svg>
	</div>

	<!-- Hero -->
	<section class="relative z-10 mx-auto w-full max-w-[1100px] px-6 pt-16 pb-10 text-center sm:pt-24">
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
			How can we help?
		</h1>

		<div class="relative mx-auto mt-10 max-w-2xl">
			<svg
				class="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-(--app-muted)"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<input
				type="search"
				bind:value={query}
				placeholder="Search the help center"
				aria-label="Search the help center"
				class="w-full rounded-full border border-(--app-border) bg-white/95 py-4 pr-5 pl-13 text-base text-gray-900 shadow-lg outline-none transition placeholder:text-gray-500 focus:ring-2 focus:ring-(--app-accent)"
			/>
		</div>
	</section>

	<!-- Category cards -->
	<section class="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-6">
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each categories as cat (cat.title)}
				<a
					href={cat.href}
					class="group flex flex-col items-center rounded-2xl border border-(--app-border) bg-(--app-surface) p-7 text-center shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-(--app-accent)/40 hover:bg-white/5"
				>
					<span
						class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--app-accent)/15 text-(--app-accent)"
					>
						{#if cat.icon === 'rocket'}
							<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
						{:else if cat.icon === 'search'}
							<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
						{:else if cat.icon === 'shield'}
							<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
						{:else}
							<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
						{/if}
					</span>
					<h2 class="text-lg font-semibold text-(--app-accent)">{cat.title}</h2>
					<p class="mt-2 text-sm leading-6 text-(--app-muted)">{cat.body}</p>
				</a>
			{/each}
		</div>
	</section>

	<!-- Articles -->
	<section class="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-10 pb-20">
		<h2 class="mb-6 text-2xl font-bold tracking-tight text-(--app-text)">
			{query.trim() ? `Results for “${query.trim()}”` : 'Popular articles'}
		</h2>

		{#if visible.length === 0}
			<div class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-10 text-center">
				<p class="text-(--app-text)">No articles match “{query.trim()}”.</p>
				<p class="mt-2 text-sm text-(--app-muted)">
					Try different words, or
					<a href="/contact" class="text-(--app-accent) underline">submit a request</a>.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each visible as article (article.title)}
					<a
						href={article.href}
						class="group rounded-xl border border-(--app-border) bg-(--app-surface) p-5 transition hover:border-(--app-accent)/40 hover:bg-white/5"
					>
						<span class="text-xs font-medium tracking-wide text-(--app-accent) uppercase">
							{article.category}
						</span>
						<h3 class="mt-1.5 font-semibold text-(--app-text) group-hover:text-(--app-accent)">
							{article.title}
						</h3>
						<p class="mt-1 text-sm leading-6 text-(--app-muted)">{article.excerpt}</p>
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Still need help -->
	<section class="relative z-10 border-t border-(--app-border) bg-(--app-surface)">
		<div class="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-4 px-6 py-14 text-center">
			<h2 class="text-2xl font-bold tracking-tight text-(--app-text)">Still need help?</h2>
			<p class="max-w-xl text-(--app-muted)">
				Can’t find what you’re looking for? Our team reads every message — no bots, no tracking.
			</p>
			<a
				href="/contact"
				class="mt-2 rounded-full bg-(--app-accent) px-6 py-3 font-medium text-gray-900 transition hover:opacity-90"
			>
				Submit a request
			</a>
		</div>
	</section>
</main>

<SiteFooter />
<AltchaBadge />
