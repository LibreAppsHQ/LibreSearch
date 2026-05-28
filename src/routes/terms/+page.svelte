<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import AltchaBadge from '$lib/components/AltchaBadge.svelte';

	const lastUpdated = 'May 2026';

	const sections = [
		{ id: 'acceptance', label: 'Acceptance' },
		{ id: 'the-service', label: 'The service' },
		{ id: 'acceptable-use', label: 'Acceptable use' },
		{ id: 'search-results', label: 'Search results' },
		{ id: 'intellectual-property', label: 'Intellectual property' },
		{ id: 'no-warranty', label: 'No warranty' },
		{ id: 'liability', label: 'Limitation of liability' },
		{ id: 'changes', label: 'Changes' },
		{ id: 'contact', label: 'Contact' }
	];
</script>

<svelte:head>
	<title>Terms of Service - LibreSearch</title>
	<meta
		name="description"
		content="The terms of service for LibreSearch, the private search engine. Plain-language rules for using the service."
	/>
	<link rel="canonical" href="https://search.arcbase.one/terms" />

	<meta property="og:title" content="Terms of Service - LibreSearch" />
	<meta
		property="og:description"
		content="Plain-language rules for using LibreSearch, the private search engine."
	/>
	<meta property="og:url" content="https://search.arcbase.one/terms" />
	<meta property="og:image" content="https://search.arcbase.one/og-image.png" />
</svelte:head>

<!-- Sticky header -->
<header class="sticky top-0 z-20 bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-[var(--app-text)]">
				Terms of Service
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-[var(--app-background)] text-[var(--app-text)]">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[800px] px-6 pt-16 pb-10 text-center sm:pt-24">
		<div
			class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-accent)]/15 text-[var(--app-accent)]"
		>
			<i class="fa-solid fa-file-contract text-2xl"></i>
		</div>
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
		<p class="mx-auto mt-4 max-w-lg text-base leading-7 text-[var(--app-muted)]">
			The short, plain-language agreement for using LibreSearch. No dense legalese - just what you can
			expect from us, and what we ask of you.
		</p>
		<p class="mt-4 text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
			Last updated · {lastUpdated}
		</p>
	</section>

	<div class="mx-auto w-full max-w-[800px] px-6">
		<div class="border-t border-[var(--app-border)]"></div>
	</div>

	<div class="mx-auto w-full max-w-[1000px] px-6 py-12 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
		<!-- Sticky table of contents -->
		<aside class="hidden lg:block">
			<nav class="sticky top-28 space-y-1">
				<p
					class="mb-3 px-3 text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase"
				>
					On this page
				</p>
				{#each sections as s}
					<a
						href={`#${s.id}`}
						class="block rounded-lg px-3 py-1.5 text-sm text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
					>
						{s.label}
					</a>
				{/each}
			</nav>
		</aside>

		<!-- Content -->
		<div class="max-w-none space-y-12">
			<section id="acceptance" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Acceptance of these terms</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					LibreSearch is a private search engine operated by Arcbase. By using it, you agree to these
					terms. If you don't agree, please don't use the service. These terms work alongside our
					<a href="/privacy" class="text-[var(--app-accent)] hover:underline">Privacy Policy</a>,
					which explains how we handle data.
				</p>
			</section>

			<section id="the-service" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">The service</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					LibreSearch lets you search the web privately. It is provided free of charge, and we may
					add, change, or remove features at any time to keep it working and secure. We don't
					guarantee the service will always be available or uninterrupted.
				</p>
			</section>

			<section id="acceptable-use" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Acceptable use</h2>
				<p class="mb-4 text-sm leading-7 text-[var(--app-muted)]">
					To keep LibreSearch fast and available for everyone, please don't:
				</p>
				<ul class="grid gap-3 sm:grid-cols-2">
					{#each ['Send automated, scripted, or bulk queries', 'Scrape, harvest, or resell our results', 'Attempt to bypass rate limits or security checks', 'Probe, scan, or disrupt the service or its infrastructure', 'Use the service to break the law or infringe others', 'Misrepresent or impersonate LibreSearch or Arcbase'] as item}
						<li
							class="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3"
						>
							<i class="fa-solid fa-xmark shrink-0 text-rose-400"></i>
							<span class="text-sm text-[var(--app-muted)]">{item}</span>
						</li>
					{/each}
				</ul>
				<p class="mt-4 text-sm leading-7 text-[var(--app-muted)]">
					We use measures such as rate limiting and a privacy-friendly
					<a href="/design" class="text-[var(--app-accent)] hover:underline"
						>proof-of-work challenge</a
					>
					to detect and slow down abuse. Automated traffic may be challenged or blocked.
				</p>
			</section>

			<section id="search-results" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">
					Search results &amp; third-party content
				</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					Results are gathered from an independent upstream search index and the wider web. We don't
					control, endorse, or guarantee the accuracy, legality, or safety of any third-party site
					you reach through LibreSearch. Following a link is at your own discretion, and those sites
					have their own terms and privacy practices.
				</p>
			</section>

			<section id="intellectual-property" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Intellectual property</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					The LibreSearch name, logo, and interface are the property of Arcbase. Please don't copy,
					stretch, recolor, or otherwise misuse our brand assets - see the
					<a href="/press" class="text-[var(--app-accent)] hover:underline">press page</a> for approved
					usage. Content surfaced in results remains the property of its respective owners.
				</p>
			</section>

			<section id="no-warranty" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">No warranty</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					LibreSearch is provided "as is" and "as available", without warranties of any kind, whether
					express or implied. We don't promise the service will be error-free, secure, or fit for a
					particular purpose, to the fullest extent permitted by law.
				</p>
			</section>

			<section id="liability" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Limitation of liability</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					To the maximum extent permitted by law, Arcbase will not be liable for any indirect,
					incidental, or consequential damages arising from your use of - or inability to use -
					LibreSearch, including reliance on any search result or linked content.
				</p>
			</section>

			<section id="changes" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Changes to these terms</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					We may update these terms from time to time. When we do, we'll revise the "last updated"
					date above. Continuing to use LibreSearch after a change means you accept the updated terms.
				</p>
			</section>

			<section id="contact" class="scroll-mt-28">
				<h2 class="mb-3 text-xl font-bold tracking-tight">Contact</h2>
				<p class="text-sm leading-7 text-[var(--app-muted)]">
					Questions about these terms? Email us at
					<a href="mailto:legal@arcbase.one" class="text-[var(--app-accent)] hover:underline"
						>legal@arcbase.one</a
					>
					or learn more on the
					<a href="/about" class="text-[var(--app-accent)] hover:underline">About</a> page.
				</p>
			</section>
		</div>
	</div>
</main>

<SiteFooter />
<AltchaBadge />
