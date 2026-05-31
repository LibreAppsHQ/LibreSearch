<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Report = {
		period: string;
		summary: string;
		stats: { label: string; value: number; desc: string }[];
	};

	const reports: Report[] = [
		{
			period: 'As of May 28, 2026',
			summary: 'No government requests, no court orders, no takedown notices received to date.',
			stats: [
				{
					label: 'Government data requests',
					value: 0,
					desc: 'Subpoenas, national-security letters, or other compelled-disclosure demands.'
				},
				{
					label: 'Court orders',
					value: 0,
					desc: 'Civil or criminal court orders for user data.'
				},
				{
					label: 'Takedown / DMCA notices',
					value: 0,
					desc: 'Requests to remove content from search results.'
				},
				{
					label: 'Voluntary disclosures',
					value: 0,
					desc: 'Cases where we provided data without a legal obligation.'
				},
				{
					label: 'Accounts affected',
					value: 0,
					desc: 'We do not maintain user accounts - there is nothing tied to an identity to disclose.'
				}
			]
		}
	];

	const policy = [
		'We do not maintain user accounts, sessions, or query logs tied to a specific person or IP address. Most requests we could receive are not satisfiable because the data simply does not exist.',
		'When we receive a legal request, we evaluate it for legitimacy, jurisdiction, and proportionality. We push back on overbroad requests.',
		'We notify affected users where legally permitted, unless doing so would create a risk of harm.',
		'We do not engage in voluntary disclosure of user data to law enforcement absent a valid legal process or a clear emergency exception.',
		'This report is updated semi-annually. The next scheduled update is January 2027.'
	];
</script>

<svelte:head>
	<title>Transparency Report - LibreSearch</title>
	<meta
		name="description"
		content="Counts of government requests, court orders, takedowns, and voluntary disclosures received by LibreSearch. Updated semi-annually."
	/>
	<link rel="canonical" href="https://libresearch.ca/transparency" />
	<meta property="og:title" content="Transparency Report - LibreSearch" />
	<meta
		property="og:description"
		content="What we received, what we disclosed, what we pushed back on."
	/>
	<meta property="og:url" content="https://libresearch.ca/transparency" />
</svelte:head>

<header class="sticky top-0 z-20 bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-[var(--app-text)]">
				Transparency
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-[var(--app-background)] text-[var(--app-text)]">
	<section class="mx-auto w-full max-w-[900px] px-6 py-12 sm:py-16">
		<p class="text-sm text-[var(--app-muted)]">
			This page is updated semi-annually with every legal demand, takedown notice, and voluntary
			disclosure we receive. If we ever stop publishing it, assume the worst and ask why.
		</p>

		{#each reports as r}
			<section class="mt-12">
				<h2 class="text-xl font-semibold tracking-tight">{r.period}</h2>
				<p class="mt-2 text-sm leading-6 text-[var(--app-text)]">{r.summary}</p>

				<div
					class="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-border)] sm:grid-cols-2"
				>
					{#each r.stats as s}
						<div class="bg-[var(--app-surface)] p-5">
							<div class="flex items-baseline gap-3">
								<span class="text-3xl font-bold tracking-tight text-[var(--app-accent)]"
									>{s.value}</span
								>
								<span class="text-sm font-medium text-[var(--app-text)]">{s.label}</span>
							</div>
							<p class="mt-2 text-xs leading-5 text-[var(--app-muted)]">{s.desc}</p>
						</div>
					{/each}
				</div>
			</section>
		{/each}

		<!-- Policy -->
		<h2 class="mt-14 text-xl font-semibold tracking-tight">How we respond to requests</h2>
		<ol class="mt-4 space-y-3">
			{#each policy as p, i}
				<li class="flex items-start gap-3 text-sm leading-6 text-[var(--app-text)]">
					<span
						class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)]/15 text-xs font-semibold text-[var(--app-accent)]"
						>{i + 1}</span
					>
					<span>{p}</span>
				</li>
			{/each}
		</ol>

		<p class="mt-10 text-xs text-[var(--app-muted)]">
			If you are a journalist or researcher and have questions about a specific number, write to
			<a href="/contact" class="text-[var(--app-accent)] hover:underline">/contact</a>.
		</p>
	</section>

	<SiteFooter />
</main>
