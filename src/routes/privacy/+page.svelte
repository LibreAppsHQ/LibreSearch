<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import TurnstileBadge from '$lib/components/TurnstileBadge.svelte';

	const lastUpdated = 'June 2026';

	const sections = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'what-we-collect', label: 'What we collect' },
		{ id: 'what-we-dont', label: "What we don't do" },
		{ id: 'how-search-works', label: 'How search works' },
		{ id: 'local-storage', label: 'Local storage' },
		{ id: 'third-parties', label: 'Third parties' },
		{ id: 'your-rights', label: 'Your rights' },
		{ id: 'changes', label: 'Changes' },
		{ id: 'contact', label: 'Contact' }
	];
</script>

<svelte:head>
	<title>Privacy Policy - LibreSearch</title>
	<meta
		name="description"
		content="LibreSearch's privacy policy. We never log your searches, build profiles, or sell data. Read exactly what we do and don't collect."
	/>
	<link rel="canonical" href="https://libresearch.ca/privacy" />

	<meta property="og:title" content="Privacy Policy - LibreSearch" />
	<meta
		property="og:description"
		content="We never log your searches, build profiles, or sell data. Read exactly what we do and don't collect."
	/>
	<meta property="og:url" content="https://libresearch.ca/privacy" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
</svelte:head>

<!-- Sticky header -->
<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Privacy Policy
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[800px] px-6 pt-16 pb-10 text-center sm:pt-24">
		<div
			class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400"
		>
			<i class="fa-solid fa-shield-halved text-2xl"></i>
		</div>
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
		<p class="mx-auto mt-4 max-w-lg text-base leading-7 text-(--app-muted)">
			Privacy isn't a setting you turn on — it's how LibreSearch is built. Here's exactly what that
			means, in plain language.
		</p>
		<p class="mt-4 text-xs font-medium tracking-wide text-(--app-muted) uppercase">
			Last updated · {lastUpdated}
		</p>
	</section>

	<div class="mx-auto w-full max-w-[800px] px-6">
		<div class="border-t border-(--app-border)"></div>
	</div>

	<div class="mx-auto w-full max-w-[1000px] px-6 py-12 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
		<!-- Sticky table of contents -->
		<aside class="hidden lg:block">
			<nav class="sticky top-28 space-y-1">
				<p class="mb-3 px-3 text-xs font-semibold tracking-widest text-(--app-muted) uppercase">
					On this page
				</p>
				{#each sections as s, i (i)}
					<a
						href={`#${s.id}`}
						class="block rounded-lg px-3 py-1.5 text-sm text-(--app-muted) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
					>
						{s.label}
					</a>
				{/each}
			</nav>
		</aside>

		<!-- Content -->
		<div class="max-w-none space-y-12">
			<section id="overview" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Overview</h2>
				<p class="text-sm leading-7 text-(--app-muted)">
					LibreSearch is a private search engine operated by LibreSearch. We designed it so that the
					most private option is the default — and the only option. We do not run ads, we do not
					build advertising profiles, and we do not sell data. This page explains the small amount
					of data that is involved in running the service and the large amount we deliberately never
					touch.
				</p>
			</section>

			<section id="what-we-collect" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">What we collect</h2>
				<p class="mb-4 text-sm leading-7 text-(--app-muted)">
					To keep the service running and protect it from abuse, our servers process the minimum
					necessary technical data, and only transiently:
				</p>
				<ul class="space-y-3">
					{#each [{ t: 'Transient request data', d: 'When you search, your query passes through our server so it can be forwarded anonymously. It is used only to return your results and is not written to a persistent search log tied to you.' }, { t: 'Abuse protection', d: 'We apply rate limiting to prevent automated abuse. This may briefly reference an IP address in memory, but it is not stored to build a history of your activity.' }, { t: 'Aggregate health metrics', d: 'We may count anonymous, aggregate totals (such as total requests per day) to keep the service healthy. These contain no queries and no identifiers.' }, { t: 'Error diagnostics', d: 'When something breaks, our error-monitoring tool (Sentry) records technical details about the crash — error type, stack trace, browser and page. We disable personal-data collection and strip IP addresses, so these reports are not tied to your identity and contain no search queries.' }] as item, i (i)}
						<li class="flex gap-3 rounded-xl border border-(--app-border) bg-(--app-surface) p-4">
							<i class="fa-solid fa-circle-info mt-1 shrink-0 text-sm text-(--app-accent)"></i>
							<div>
								<p class="text-sm font-semibold text-(--app-text)">{item.t}</p>
								<p class="mt-1 text-sm leading-7 text-(--app-muted)">{item.d}</p>
							</div>
						</li>
					{/each}
				</ul>
			</section>

			<section id="what-we-dont" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">What we don't do</h2>
				<p class="mb-4 text-sm leading-7 text-(--app-muted)">
					This is the part that matters most. LibreSearch never:
				</p>
				<ul class="grid gap-3 sm:grid-cols-2">
					{#each ['Logs your searches against your identity', 'Stores a search history on our servers', 'Builds an advertising or interest profile', 'Sells, rents, or shares your data', 'Uses tracking cookies or fingerprinting', 'Shows ads or sponsored results'] as item, i (i)}
						<li
							class="flex items-center gap-3 rounded-xl border border-(--app-border) bg-(--app-surface) px-4 py-3"
						>
							<i class="fa-solid fa-xmark shrink-0 text-rose-400"></i>
							<span class="text-sm text-(--app-muted)">{item}</span>
						</li>
					{/each}
				</ul>
			</section>

			<section id="how-search-works" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">How search works</h2>
				<p class="text-sm leading-7 text-(--app-muted)">
					When you type a query, it travels from your browser to our server, which forwards the
					request to an independent search index on your behalf. The index never sees who you are -
					your IP address, cookies, and browser fingerprint stay hidden behind our server. Results
					come back to us, we hand them to you, and the connection is done. Nothing about that
					exchange is stored against you.
				</p>
			</section>

			<section id="local-storage" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Local storage on your device</h2>
				<p class="text-sm leading-7 text-(--app-muted)">
					Your preferences — settings, theme, and optional search history for autocomplete — are
					stored entirely in your own browser using local storage. They never leave your device and
					are never synced to our servers. You can wipe all of it at any time by clearing your
					browser data or using the controls in
					<a href="/settings" class="text-(--app-accent) hover:underline">Settings</a>.
				</p>
			</section>

			<section id="third-parties" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Third parties</h2>
				<p class="text-sm leading-7 text-(--app-muted)">
					To return results we rely on an upstream search index, which receives your query through
					our anonymizing proxy but not your identity. We do not embed third-party advertising or
					social tracking scripts, and we have no business model that depends on sharing your data.
				</p>
				<p class="mt-3 text-sm leading-7 text-(--app-muted)">
					For aggregate traffic we use <a
						href="https://umami.is"
						target="_blank"
						rel="noopener noreferrer"
						class="text-(--app-accent) hover:underline">Umami</a
					>
					— cookie-free pageview counts with no cross-site tracking or personal profiles. Umami is not
					loaded when eco mode is enabled. For performance we use Vercel Speed Insights (Core Web Vitals
					only).
				</p>
				<p class="mt-3 text-sm leading-7 text-(--app-muted)">
					For crash diagnostics we use <a
						href="https://sentry.io"
						target="_blank"
						rel="noopener noreferrer"
						class="text-(--app-accent) hover:underline">Sentry</a
					>. It only receives technical error reports — configured with personal-data collection off
					and IP addresses removed — never your searches or a profile of you.
				</p>
			</section>

			<section id="your-rights" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Your rights</h2>
				<p class="text-sm leading-7 text-(--app-muted)">
					Because we don't build a profile or store searches against your identity, there is no
					personal dossier for us to hand over, correct, or delete — there simply isn't one. Any
					preferences we do hold live on your device and are fully under your control. If you have a
					specific request or question about your data, reach out and we'll help.
				</p>
			</section>

			<section id="changes" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Changes to this policy</h2>
				<p class="text-sm leading-7 text-(--app-muted)">
					If we update this policy, we'll revise the "last updated" date at the top of the page.
					Material changes will be highlighted so you're never caught off guard. Continuing to use
					LibreSearch after an update means you accept the revised policy.
				</p>
			</section>

			<section id="contact" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Contact</h2>
				<p class="text-sm leading-7 text-(--app-muted)">
					Questions about privacy at LibreSearch? Reach us via
					<a href="/contact" class="text-(--app-accent) hover:underline">/contact</a>
					or learn more on the
					<a href="/about" class="text-(--app-accent) hover:underline">About</a> page.
				</p>
			</section>
		</div>
	</div>
</main>

<SiteFooter />
<TurnstileBadge />
