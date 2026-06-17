<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import TurnstileBadge from '$lib/components/TurnstileBadge.svelte';
	import cloudsBg from '$lib/assets/clouds.jpg';

	const jsonLd =
		`<script type="application/ld+json">` +
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: 'LibreSearch',
			url: 'https://libresearch.ca',
			logo: 'https://libresearch.ca/favicon.svg',
			description:
				'A private, eco-conscious search engine with no tracking, no profiles, and no ads.',
			sameAs: [
				'https://github.com/Arcbasehq/LibreSearch',
				'https://mastodon.social/@libresearch',
				'https://x.com/libresearchca'
			]
		}) +
		'</' +
		'script>';
</script>

<svelte:head>
	<title>About - LibreSearch</title>
	<meta
		name="description"
		content="LibreSearch is a private search engine with optional eco tools — no tracking, no profiles, and no ads. Learn how it works."
	/>
	<link rel="canonical" href="https://libresearch.ca/about" />

	<meta property="og:title" content="About - LibreSearch" />
	<meta
		property="og:description"
		content="LibreSearch is a private search engine with optional eco tools — no tracking, no profiles, and no ads."
	/>
	<meta property="og:url" content="https://libresearch.ca/about" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />

	<meta name="twitter:title" content="About - LibreSearch" />
	<meta
		name="twitter:description"
		content="LibreSearch is a private search engine with optional eco tools — no tracking, no profiles, and no ads."
	/>

	{@html jsonLd}
</svelte:head>

<main class="relative overflow-hidden bg-(--app-background) text-(--app-text)">
	<!-- Hero -->
	<section class="relative min-h-dvh w-full text-center">
		<header class="fixed inset-x-0 top-0 z-20 bg-transparent">
			<div class="mx-auto w-full max-w-[1400px] px-6">
				<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
					<a href="/" class="justify-self-start">
						<Logo class="h-10 w-25" />
					</a>
					<p class="justify-self-center text-2xl font-bold tracking-tight text-white">About Us</p>
					<SiteMenu class="justify-self-end text-(--app-muted) hover:text-(--app-secondary)" />
				</div>
			</div>
		</header>
		<div
			class="absolute inset-0 bg-cover bg-center"
			style="background-image: url({cloudsBg})"
			aria-hidden="true"
		></div>
		<div class="absolute inset-0 bg-black/45" aria-hidden="true"></div>

		<div
			class="relative z-10 mx-auto flex min-h-dvh max-w-[1100px] flex-col items-center justify-center px-6 py-24"
		>
			<h1
				class="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl"
			>
				Search the web.<br />
				<span class="text-white/80">Privately. Thoughtfully.</span>
			</h1>

			<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90">
				LibreSearch returns results without logging queries, building profiles, or serving ads —
				with optional eco tools to lighten your digital footprint and support the planet.
			</p>

			<div class="mt-10 flex flex-wrap items-center justify-center gap-3">
				<a
					href="/"
					class="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#171b25] transition hover:bg-white/90"
				>
					Start searching
				</a>
				<a
					href="/settings"
					class="rounded-full border border-white/60 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
				>
					Eco settings
				</a>
			</div>
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Core privacy section -->
	<section
		id="without-tracking"
		class="bg-gradient-to-b from-[#5b5bf0] to-[#6f6ff7] px-6 py-20 text-white sm:py-28"
	>
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:justify-between">
			<div class="max-w-xl text-center md:text-left">
				<h2 class="text-5xl leading-tight font-bold sm:text-6xl">Private by design</h2>

				<p class="mt-6 text-lg text-white/85">
					LibreSearch is built around a simple principle: search should not require tracking or
					identity. Results are generated from an independent index and delivered without storing
					personal data.
				</p>

				<p class="mt-4 text-lg text-white/85">
					There are no query logs, no user profiles, and no cross-site tracking. Searches are not
					tied to an identity.
				</p>
			</div>

			<img
				src="/icon2.svg"
				alt="Private browsing illustration"
				class="w-full max-w-lg md:max-w-xl"
			/>
		</div>
	</section>

	<!-- Surveillance comparison -->
	<section
		id="mass-surveillance"
		class="bg-gradient-to-b from-[#0f766e] to-[#0d9488] px-6 py-20 text-white sm:py-28"
	>
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:justify-between">
			<img
				src="/icon3.svg"
				alt="Online tracking illustration"
				class="w-full max-w-lg md:order-1 md:max-w-xl"
			/>

			<div class="max-w-xl text-center md:order-2 md:text-left">
				<h2 class="text-5xl leading-tight font-bold sm:text-6xl">Why privacy matters</h2>

				<p class="mt-6 text-lg text-white/85">
					Most search engines associate queries with persistent identifiers and use that data for
					profiling or advertising. LibreSearch does not store or build user profiles.
				</p>

				<p class="mt-4 text-lg text-white/85">
					You can use LibreSearch without creating an account or installing anything.
				</p>

				<a
					href="/privacy"
					class="mt-8 inline-block rounded-md border border-white px-6 py-3 text-base font-medium text-white transition hover:bg-white hover:text-[#0d9488]"
				>
					How privacy works
				</a>
			</div>
		</div>
	</section>

	<!-- Eco -->
	<section
		id="eco"
		class="bg-gradient-to-b from-[#14532d] to-[#166534] px-6 py-20 text-white sm:py-28"
	>
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:justify-between">
			<div class="max-w-xl text-center md:text-left">
				<p class="text-xs font-semibold tracking-widest text-emerald-200/80 uppercase">Eco</p>
				<h2 class="mt-3 text-5xl leading-tight font-bold sm:text-6xl">
					Lighter searches, bigger impact
				</h2>

				<p class="mt-6 text-lg text-white/85">
					Every query uses energy somewhere on the internet. LibreSearch lets you cut the weight of
					each search — fewer requests, leaner results, and tools that nudge the web toward
					something greener.
				</p>

				<p class="mt-4 text-lg text-white/85">
					Turn on Eco mode in settings to hide decorative backgrounds, skip extra network calls, cap
					results, and surface links to conservation nonprofits — all stored locally in your
					browser.
				</p>

				<a
					href="/settings"
					class="mt-8 inline-flex items-center gap-2 rounded-md border border-white px-6 py-3 text-base font-medium text-white transition hover:bg-white hover:text-[#14532d]"
				>
					<i class="fa-solid fa-leaf text-sm"></i>
					Explore eco settings
				</a>
			</div>

			<div class="grid w-full max-w-md gap-3 sm:grid-cols-2 md:max-w-lg">
				{#each [{ icon: 'fa-seedling', label: 'Eco mode', desc: 'One switch for all low-power defaults.' }, { icon: 'fa-cloud', label: 'Less data', desc: 'Skip suggestions, rich answers, and favicons.' }, { icon: 'fa-location-dot', label: 'Local results', desc: 'Prefer nearby results to shorten data routes.' }, { icon: 'fa-hand-holding-heart', label: 'Give back', desc: 'Links to tree-planting and conservation charities.' }] as item, i (i)}
					<div class="rounded-lg border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
						<i class="fa-solid {item.icon} text-lg text-emerald-200"></i>
						<p class="mt-2 text-sm font-semibold">{item.label}</p>
						<p class="mt-1 text-xs leading-5 text-white/70">{item.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Privacy pillars -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight">Privacy model</h2>

		<div class="grid gap-6 sm:grid-cols-3">
			{#each [{ icon: 'fa-eye-slash', title: 'No tracking', color: 'text-emerald-400', bg: 'bg-emerald-500/15', desc: 'Search queries are not stored or associated with an identity.' }, { icon: 'fa-database', title: 'No profiles', color: 'text-blue-400', bg: 'bg-blue-500/15', desc: 'We do not build advertising or behavioral profiles from search activity.' }, { icon: 'fa-lock', title: 'Local storage', color: 'text-violet-400', bg: 'bg-violet-500/15', desc: 'Settings and preferences remain in the browser and are not synced.' }] as pillar, i (i)}
				<div class="rounded-sm border border-(--app-border) bg-(--app-card) p-7 backdrop-blur-sm">
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-sm {pillar.bg} {pillar.color}"
					>
						<i class="fa-solid {pillar.icon} text-xl"></i>
					</div>
					<h3 class="mb-2 text-lg font-semibold">{pillar.title}</h3>
					<p class="text-sm leading-7 text-(--app-muted)">{pillar.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- How it works -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-24">
			<div>
				<p class="mb-3 text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
					How it works
				</p>

				<h2 class="mb-6 text-3xl font-bold tracking-tight">Anonymous search flow</h2>

				<p class="text-sm leading-7 text-(--app-muted)">
					Queries are forwarded through LibreSearch so the destination index does not receive
					identifying information. Results are then returned to the user without storing request
					history.
				</p>
			</div>

			<div class="space-y-3">
				{#each [{ icon: 'fa-keyboard', label: 'You enter a query', color: 'text-(--app-accent)', bg: 'bg-(--app-accent)/10' }, { icon: 'fa-server', label: 'Request is proxied anonymously', color: 'text-blue-400', bg: 'bg-blue-500/10' }, { icon: 'fa-globe', label: 'Results are returned', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }, { icon: 'fa-display', label: 'No data is stored', color: 'text-violet-400', bg: 'bg-violet-500/10' }] as step, i (i)}
					<div
						class="flex items-center gap-4 rounded-sm border border-(--app-border) bg-(--app-card) px-5 py-4"
					>
						<div class="flex h-9 w-9 items-center justify-center rounded-md {step.bg} {step.color}">
							<i class="fa-solid {step.icon} text-sm"></i>
						</div>
						<span class="text-sm font-medium">{step.label}</span>
						<span class="ml-auto text-xs font-bold text-(--app-muted) tabular-nums">{i + 1}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Features -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-20">
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight">Features</h2>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each [{ icon: 'fa-newspaper', title: 'News', desc: 'Top stories from across the web.' }, { icon: 'fa-play', title: 'Videos', desc: 'Search video content.' }, { icon: 'fa-image', title: 'Images', desc: 'Visual search results.' }, { icon: 'fa-map', title: 'Maps', desc: 'Find places and local listings.' }, { icon: 'fa-bolt', title: 'Instant answers', desc: 'Calculators, converters, and quick facts.' }, { icon: 'fa-leaf', title: 'Eco tools', desc: 'Low-power mode, sustainability tips, and charity links.' }, { icon: 'fa-puzzle-piece', title: 'Extensions', desc: 'Search privately from Chrome, Firefox, and Edge.' }, { icon: 'fa-clock-rotate-left', title: 'Search history', desc: 'Optional history kept only on your device.' }, { icon: 'fa-palette', title: 'Themes', desc: 'Dark, light, slate, and sand palettes.' }] as f, i (i)}
				<div class="flex gap-4 rounded-sm border border-(--app-border) bg-(--app-card) p-5">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg text-(--app-accent)">
						<i class="fa-solid {f.icon} text-sm"></i>
					</div>
					<div>
						<p class="mb-1 text-sm font-semibold">{f.title}</p>
						<p class="text-xs leading-5 text-(--app-muted)">{f.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- FAQ -->
	<section class="mx-auto w-full max-w-[800px] px-6 py-16 sm:py-24">
		<h2 class="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
			Frequently asked questions
		</h2>

		<div class="space-y-3">
			{#each [{ q: 'Do you log searches?', a: 'No. Queries are not stored on our servers or tied to an identity.' }, { q: 'Do I need an account?', a: 'No account is required. Open the site and search.' }, { q: 'What are the eco settings?', a: 'Optional tools in Settings → Eco that reduce network use, limit results, show sustainability tips, and link to environmental nonprofits. Eco mode enables them all at once.' }, { q: 'How is this funded?', a: 'The project is independently maintained. Community donations help cover infrastructure.' }, { q: 'Where is data stored?', a: 'Settings and history stay in your browser locally — never on our servers.' }, { q: 'Where do results come from?', a: 'An independent index delivered through LibreSearch’s proxy, without passing identifying information.' }] as item, i (i)}
				<details class="group rounded-sm border border-(--app-border) bg-(--app-card) px-6 py-5">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold"
					>
						{item.q}
						<i
							class="fa-solid fa-chevron-down text-sm text-(--app-muted) transition group-open:rotate-180"
						></i>
					</summary>
					<p class="mt-4 text-sm leading-7 text-(--app-muted)">{item.a}</p>
				</details>
			{/each}
		</div>
	</section>
</main>

<SiteFooter />
<TurnstileBadge />
