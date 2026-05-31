<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import AltchaBadge from '$lib/components/AltchaBadge.svelte';
</script>

<svelte:head>
	<title>About Us</title>
	<meta
		name="description"
		content="LibreSearch is a private search engine that never logs your queries, builds profiles, or sells ads. Learn how it works and why privacy comes first."
	/>
	<link rel="canonical" href="https://libresearch.ca/about" />

	<!-- Open Graph -->
	<meta property="og:title" content="About - LibreSearch" />
	<meta
		property="og:description"
		content="LibreSearch is a private search engine that never logs your queries, builds profiles, or sells ads."
	/>
	<meta property="og:url" content="https://libresearch.ca/about" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />

	<!-- Twitter -->
	<meta name="twitter:title" content="About - LibreSearch" />
	<meta
		name="twitter:description"
		content="LibreSearch is a private search engine that never logs your queries, builds profiles, or sells ads."
	/>

	<!-- JSON-LD: Organization -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'LibreSearch',
		url: 'https://libresearch.ca',
		logo: 'https://libresearch.ca/favicon.png',
		description: 'A private search engine with no tracking, no profiles, and no ads.',
		sameAs: []
	})}</script>`}
</svelte:head>

<!-- Sticky header -->
<header class="sticky top-0 z-20 bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-[var(--app-text)]">
				About Us
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="relative overflow-hidden bg-[var(--app-background)] text-[var(--app-text)]">
	<!-- Curving wave backdrop (Startpage-style) in LibreSearch's own palette -->
	<div class="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
		<!-- Top accent band that curves down into the page -->
		<svg
			class="absolute top-0 left-0 h-[65vh] w-full"
			viewBox="0 0 1440 600"
			preserveAspectRatio="none"
		>
			<path
				d="M0,0 L1440,0 L1440,360 C1140,500 980,300 720,360 C460,420 280,520 0,420 Z"
				fill="var(--app-accent)"
				fill-opacity="0.85"
			/>
		</svg>

		<!-- Middle accent band that sweeps across the centre of the page -->
		<svg
			class="absolute top-1/2 left-0 h-[55vh] w-full -translate-y-1/2"
			viewBox="0 0 1440 600"
			preserveAspectRatio="none"
		>
			<path
				d="M0,300 C320,180 540,420 760,360 C1010,290 1230,440 1440,320 L1440,420 C1230,540 1010,390 760,460 C540,520 320,280 0,400 Z"
				fill="var(--app-accent)"
				fill-opacity="0.5"
			/>
		</svg>

		<!-- Bottom dark band that curves up, deepening toward black -->
		<svg
			class="absolute bottom-0 left-0 h-[95vh] w-full"
			viewBox="0 0 1440 600"
			preserveAspectRatio="none"
		>
			<path
				d="M0,200 C300,80 520,150 760,210 C1020,275 1220,140 1440,250 L1440,600 L0,600 Z"
				fill="#05060a"
			/>
		</svg>

	</div>

	<!-- Hero -->
	<section class="relative mx-auto w-full max-w-[1100px] px-6 py-16 text-center sm:py-24">
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-7xl">
			Search the web.<br />
			<span class="text-white/80">Leave no trace.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90">
			LibreSearch is a private search engine that gives you real results without logging your queries,
			building a profile on you, or selling your attention.
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<img src="/icon.svg" alt="No Trace Icon" class="h-48 w-48 sm:h-64 sm:w-64" />
		</div>
	</section>

	<div class="border-t border-[var(--app-border)]"></div>

	<!-- Privacy pillars -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight">
			Privacy isn't a feature. It's the foundation.
		</h2>
		<div class="grid gap-6 sm:grid-cols-3">
			{#each [{ icon: 'fa-eye-slash', title: 'No tracking', color: 'text-emerald-400', bg: 'bg-emerald-500/15', desc: 'We never log your searches, store your IP, or tie queries to any account. Every search starts completely fresh.' }, { icon: 'fa-database', title: 'No profiles', color: 'text-blue-400', bg: 'bg-blue-500/15', desc: "We never build an advertising profile from your searches. Your data isn't packaged or sold to anyone, ever." }, { icon: 'fa-lock', title: 'Local by default', color: 'text-violet-400', bg: 'bg-violet-500/15', desc: 'Your settings, history, and theme are stored entirely in your browser. Nothing is synced to any server.' }] as pillar}
				<div
					class="rounded-2xl border border-[var(--app-border)] bg-[#171b25]/80 p-7 backdrop-blur-sm"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl {pillar.bg} {pillar.color}"
					>
						<i class="fa-solid {pillar.icon} text-xl"></i>
					</div>
					<h3 class="mb-2 text-lg font-semibold">{pillar.title}</h3>
					<p class="text-sm leading-7 text-[var(--app-muted)]">{pillar.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-[var(--app-border)]"></div>

	<!-- How it works -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-24">
			<div>
				<p class="mb-3 text-xs font-semibold tracking-widest text-[var(--app-accent)] uppercase">
					How it works
				</p>
				<h2 class="mb-6 text-3xl font-bold tracking-tight">
					Real results without the surveillance.
				</h2>
				<p class="mb-4 text-sm leading-7 text-[var(--app-muted)]">
					LibreSearch uses an independent search index that doesn't rely on Big Tech — so you get
					genuine, unfiltered results instead of a curated feed designed to keep you clicking.
				</p>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					Your query travels from your browser to our server, which forwards it on your behalf. The
					search index never sees who you are — your IP address, cookies, and browser fingerprint
					stay hidden.
				</p>
			</div>
			<div class="space-y-3">
				{#each [{ icon: 'fa-keyboard', label: 'You type a query', color: 'text-[var(--app-accent)]', bg: 'bg-[var(--app-accent)]/10' }, { icon: 'fa-server', label: 'LibreSearch proxies it anonymously', color: 'text-blue-400', bg: 'bg-blue-500/10' }, { icon: 'fa-globe', label: 'Real results come back to you', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }, { icon: 'fa-display', label: 'You see results — nothing is stored', color: 'text-violet-400', bg: 'bg-violet-500/10' }] as step, i}
					<div
						class="flex items-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[#171b25]/80 px-5 py-4 backdrop-blur-sm"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl {step.bg} {step.color}"
						>
							<i class="fa-solid {step.icon} text-sm"></i>
						</div>
						<span class="text-sm font-medium">{step.label}</span>
						<span class="ml-auto text-xs font-bold text-[var(--app-muted)] tabular-nums"
							>{i + 1}</span
						>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<div class="border-t border-[var(--app-border)]"></div>

	<!-- Features grid -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<p
			class="mb-3 text-center text-xs font-semibold tracking-widest text-[var(--app-accent)] uppercase"
		>
			Features
		</p>
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight">
			Everything you'd expect. Nothing you don't.
		</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each [{ icon: 'fa-newspaper', title: 'News', desc: 'Top stories from across the web, without the filter bubble.' }, { icon: 'fa-play', title: 'Videos', desc: 'Find and preview videos from any source.' }, { icon: 'fa-image', title: 'Images', desc: 'Visual search with a clean, responsive grid.' }, { icon: 'fa-bolt', title: 'Instant answers', desc: 'Knowledge panels for quick facts about people, places, and things.' }, { icon: 'fa-clock-rotate-left', title: 'Search history', desc: 'Optional local-only history for fast autocomplete. Clear it any time.' }, { icon: 'fa-palette', title: 'Themes', desc: 'Light, dark, slate, and sand — switch any time from settings.' }] as f}
				<div
					class="flex gap-4 rounded-2xl border border-[var(--app-border)] bg-[#171b25]/80 p-5 backdrop-blur-sm"
				>
					<div
						class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#171b25]/80 text-[var(--app-accent)] backdrop-blur-sm"
					>
						<i class="fa-solid {f.icon} text-sm"></i>
					</div>
					<div>
						<p class="mb-1 text-sm font-semibold">{f.title}</p>
						<p class="text-xs leading-5 text-[var(--app-muted)]">{f.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-[var(--app-border)]"></div>

	<!-- FAQ -->
	<section class="mx-auto w-full max-w-[800px] px-6 py-16 sm:py-24">
		<p
			class="mb-3 text-center text-xs font-semibold tracking-widest text-[var(--app-accent)] uppercase"
		>
			FAQ
		</p>
		<h2 class="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
			Frequently asked questions
		</h2>
		<div class="space-y-3">
			{#each [{ q: 'Do you log my searches?', a: 'No. We never store your queries, IP address, or tie any search to an identity. Each search is processed and then forgotten.' }, { q: 'Do I need an account?', a: 'No sign-up is required. LibreSearch works the moment you load the page — there are no accounts to create.' }, { q: 'How does LibreSearch make money without ads?', a: "LibreSearch doesn't sell ads or profile data. The project runs independently and is funded by its operators, not your attention." }, { q: 'Where are my settings stored?', a: 'Your settings, history, and theme live entirely in your browser via local storage. Nothing is synced to our servers.' }, { q: 'Where do the results come from?', a: 'We use an independent search index and proxy your query anonymously, so you get genuine results without Big Tech tracking you.' }] as item}
				<details
					class="group rounded-2xl border border-[var(--app-border)] bg-[#171b25]/80 px-6 py-5 backdrop-blur-sm"
				>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[var(--app-text)]"
					>
						{item.q}
						<i
							class="fa-solid fa-chevron-down shrink-0 text-sm text-[var(--app-muted)] transition group-open:rotate-180"
						></i>
					</summary>
					<p class="mt-4 text-sm leading-7 text-[var(--app-muted)]">{item.a}</p>
				</details>
			{/each}
		</div>
	</section>
</main>

<SiteFooter />
<AltchaBadge />
