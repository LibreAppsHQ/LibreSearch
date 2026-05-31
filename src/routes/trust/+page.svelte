<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	const principles = [
		{
			icon: 'fa-eye-slash',
			title: "We don't log searches",
			desc: 'Queries pass through our server, are forwarded to the upstream index, and the response is returned. The query is never written to a persistent log tied to an identity or IP.'
		},
		{
			icon: 'fa-database',
			title: "We don't build profiles",
			desc: 'There is no advertising profile, no behavioural model, no cohort assignment. We have nothing to sell because we never collect it.'
		},
		{
			icon: 'fa-lock',
			title: 'Local-first by default',
			desc: "Your search history, theme, region, and settings live entirely in your browser's localStorage. They are never synced to our servers."
		},
		{
			icon: 'fa-shield-halved',
			title: 'Bot protection without surveillance',
			desc: 'We use Altcha — a proof-of-work challenge your browser solves locally. No CAPTCHAs, no behavioural tracking, no third-party cookies.'
		}
	];

	const subProcessors = [
		{
			name: 'Vercel',
			role: 'Application hosting and CDN',
			data: "Receives HTTP requests to render pages. Logs include source IP and request path (retained per Vercel's defaults).",
			region: 'Multiple regions; primarily Washington (us-east-1).',
			url: 'https://vercel.com/legal/privacy-policy'
		},
		{
			name: 'Web3Forms',
			role: 'Contact form delivery',
			data: 'Only used when you submit /contact. Receives the name, email, and message you typed.',
			region: 'United States.',
			url: 'https://web3forms.com/privacy'
		},
		{
			name: 'Vercel Analytics + Speed Insights',
			role: 'Aggregate, privacy-respecting performance signals',
			data: 'Anonymous, aggregated page-view counts and Core Web Vitals. No cookies, no cross-site tracking, no personal data.',
			region: 'United States.',
			url: 'https://vercel.com/docs/analytics/privacy-policy'
		}
	];

	const facts = [
		{ label: 'Operating entity', value: 'Arcbase HQ' },
		{ label: 'Primary jurisdiction', value: 'Canada' },
		{ label: 'License', value: 'AGPL-3.0 (source: github.com/Arcbasehq/LibreSearch)' },
		{ label: 'Funding model', value: 'Donations — no ads, no data sales' },
		{ label: 'Security contact', value: '/contact (subject: Security disclosure)' },
		{ label: 'Security disclosure', value: '/.well-known/security.txt (RFC 9116)' }
	];
</script>

<svelte:head>
	<title>Trust Center - LibreSearch</title>
	<meta
		name="description"
		content="How LibreSearch handles your data: what we store, what we don't, who our sub-processors are, and where our infrastructure lives."
	/>
	<link rel="canonical" href="https://libresearch.ca/trust" />
	<meta property="og:title" content="Trust Center - LibreSearch" />
	<meta
		property="og:description"
		content="The full story on how we handle your data — sub-processors, retention, jurisdiction."
	/>
	<meta property="og:url" content="https://libresearch.ca/trust" />
</svelte:head>

<header class="sticky top-0 z-20 bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-[var(--app-text)]">
				Trust Center
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-[var(--app-background)] text-[var(--app-text)]">
	<section class="mx-auto w-full max-w-[1000px] px-6 py-12 sm:py-16">
		<p class="text-sm text-[var(--app-muted)]">
			This page is the long-form answer to "what does LibreSearch actually do with my data?" Short
			answer: as little as physically possible.
		</p>

		<!-- Principles -->
		<h2 class="mt-12 text-xl font-semibold tracking-tight">Principles</h2>
		<div class="mt-6 grid gap-4 sm:grid-cols-2">
			{#each principles as p}
				<div class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
					<div
						class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)]"
					>
						<i class="fa-solid {p.icon}"></i>
					</div>
					<h3 class="text-base font-semibold">{p.title}</h3>
					<p class="mt-2 text-sm leading-6 text-[var(--app-muted)]">{p.desc}</p>
				</div>
			{/each}
		</div>

		<!-- Facts table -->
		<h2 class="mt-14 text-xl font-semibold tracking-tight">At a glance</h2>
		<dl
			class="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-border)] sm:grid-cols-2"
		>
			{#each facts as f}
				<div class="bg-[var(--app-surface)] p-5">
					<dt class="text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase">
						{f.label}
					</dt>
					<dd class="mt-1 text-sm text-[var(--app-text)]">{f.value}</dd>
				</div>
			{/each}
		</dl>

		<!-- Sub-processors -->
		<h2 class="mt-14 text-xl font-semibold tracking-tight">Sub-processors</h2>
		<p class="mt-3 text-sm leading-6 text-[var(--app-muted)]">
			Third parties that may process data on our behalf. We keep this list as short as we can.
		</p>
		<div class="mt-6 space-y-4">
			{#each subProcessors as s}
				<div class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
					<div class="flex flex-wrap items-baseline justify-between gap-3">
						<h3 class="text-base font-semibold">{s.name}</h3>
						<a
							href={s.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs text-[var(--app-accent)] hover:underline"
						>
							Privacy policy <i class="fa-solid fa-up-right-from-square ml-1"></i>
						</a>
					</div>
					<p class="mt-1 text-xs text-[var(--app-muted)]">{s.role}</p>
					<p class="mt-3 text-sm leading-6 text-[var(--app-text)]">{s.data}</p>
					<p class="mt-2 text-xs text-[var(--app-muted)]">
						<i class="fa-solid fa-location-dot mr-1"></i>
						{s.region}
					</p>
				</div>
			{/each}
		</div>

		<!-- Footer link block -->
		<div class="mt-14 flex flex-wrap gap-3">
			<a
				href="/privacy"
				class="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
			>
				<i class="fa-solid fa-shield-halved"></i>
				Privacy policy
			</a>
			<a
				href="/transparency"
				class="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
			>
				<i class="fa-solid fa-file-contract"></i>
				Transparency report
			</a>
			<a
				href="/contact"
				class="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
			>
				<i class="fa-solid fa-envelope"></i>
				Contact us
			</a>
		</div>
	</section>

	<SiteFooter />
</main>
