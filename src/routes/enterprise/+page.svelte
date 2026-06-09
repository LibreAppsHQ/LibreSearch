<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Snippet = {
		id: string;
		title: string;
		icon: string;
		platform: string;
		path: string;
		lang: string;
		code: string;
	};

	const snippets: Snippet[] = [
		{
			id: 'chrome',
			title: 'Google Chrome / Chromium',
			icon: 'fa-brands fa-chrome',
			platform: 'Windows · macOS · Linux',
			path: 'Drop this JSON in the managed-policies directory for your OS, then restart Chrome.',
			lang: 'json',
			code: `{
  "DefaultSearchProviderEnabled": true,
  "DefaultSearchProviderName": "LibreSearch",
  "DefaultSearchProviderKeyword": "libresearch",
  "DefaultSearchProviderSearchURL": "https://libresearch.ca/search?q={searchTerms}",
  "DefaultSearchProviderEncodings": ["UTF-8"]
}`
		},
		{
			id: 'edge',
			title: 'Microsoft Edge',
			icon: 'fa-brands fa-edge',
			platform: 'Windows · macOS · Linux',
			path: "Same key names as Chrome. Use Group Policy (ADMX) on Windows, or drop the JSON in Edge's managed-policies directory.",
			lang: 'json',
			code: `{
  "DefaultSearchProviderEnabled": true,
  "DefaultSearchProviderName": "LibreSearch",
  "DefaultSearchProviderKeyword": "libresearch",
  "DefaultSearchProviderSearchURL": "https://libresearch.ca/search?q={searchTerms}",
  "DefaultSearchProviderEncodings": ["UTF-8"]
}`
		},
		{
			id: 'firefox',
			title: 'Mozilla Firefox',
			icon: 'fa-brands fa-firefox-browser',
			platform: 'Windows · macOS · Linux',
			path: 'Save as policies.json in <firefox-install>/distribution/ (or the platform-specific managed-policies path).',
			lang: 'json',
			code: `{
  "policies": {
    "SearchEngines": {
      "Default": "LibreSearch",
      "PreventInstalls": false,
      "Add": [
        {
          "Name": "LibreSearch",
          "URLTemplate": "https://libresearch.ca/search?q={searchTerms}",
          "Method": "GET",
          "IconURL": "https://libresearch.ca/favicon.svg",
          "Alias": "libre",
          "Description": "Private search engine"
        }
      ]
    }
  }
}`
		},
		{
			id: 'safari',
			title: 'Safari',
			icon: 'fa-brands fa-safari',
			platform: 'macOS · iOS · iPadOS',
			path: 'Safari only allows a fixed list of system search engines, so LibreSearch can\'t be set as the default via MDM today. Deploy it as a bookmark in the Favorites bar instead, or add the Shortcut below to make "Search LibreSearch" available via Spotlight.',
			lang: 'shortcut',
			code: `# Push a "LibreSearch" Safari bookmark via MDM (Jamf, Mosyle, Kandji):
# Configuration Profile → Safari → Managed Bookmarks
#
#   Title: LibreSearch
#   URL:   https://libresearch.ca/`
		}
	];

	let copied = $state<string | null>(null);

	async function copy(id: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = id;
			setTimeout(() => {
				if (copied === id) copied = null;
			}, 1600);
		} catch {
			/* clipboard blocked; nothing to do */
		}
	}
</script>

<svelte:head>
	<title>LibreSearch for Enterprise - Default search at scale</title>
	<meta
		name="description"
		content="Deploy LibreSearch as the default search engine across your organization with Group Policy, ADMX, and Firefox policies.json templates. Built for teams with privacy obligations."
	/>
	<link rel="canonical" href="https://libresearch.ca/enterprise" />
	<meta property="og:title" content="LibreSearch for Enterprise" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
	<meta
		property="og:description"
		content="Roll out a private, no-tracking search engine across your fleet with ready-to-deploy policy templates."
	/>
	<meta property="og:url" content="https://libresearch.ca/enterprise" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Enterprise
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
			<i class="fa-solid fa-shield-halved"></i>
			For IT admins
		</span>
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
			Default search,<br />
			<span class="text-(--app-accent)">across your whole fleet.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-(--app-muted)">
			LibreSearch can be rolled out as the default search engine in Chrome, Edge, and Firefox using
			the same Group Policy / MDM tools you already use. No telemetry, no query logging — defensible
			under GDPR, HIPAA, and FERPA.
		</p>
	</section>

	<!-- Why this matters -->
	<section class="mx-auto w-full max-w-[1100px] px-6 pb-12">
		<div class="grid gap-6 sm:grid-cols-3">
			{#each [{ icon: 'fa-eye-slash', title: 'No query logging', desc: 'Searches are never written to a persistent log tied to any user or IP.' }, { icon: 'fa-server', title: 'No third-party telemetry', desc: 'No Google Analytics, no Bing, no ad-tech embedded in the search frontend.' }, { icon: 'fa-file-contract', title: 'Compliance-friendly', desc: 'AGPL-licensed, auditable source, ready for review by your security team.' }] as item, i (i)}
				<div class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
					<div
						class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-accent)/15 text-(--app-accent)"
					>
						<i class="fa-solid {item.icon}"></i>
					</div>
					<h3 class="text-lg font-semibold">{item.title}</h3>
					<p class="mt-2 text-sm leading-6 text-(--app-muted)">{item.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Deployment snippets -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-20">
		<p class="mb-3 text-center text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
			Deployment templates
		</p>
		<h2 class="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
			Pick your browser. Paste the policy. Done.
		</h2>

		<div class="space-y-8">
			{#each snippets as s, i (i)}
				<article
					class="overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)"
				>
					<header class="flex items-start justify-between gap-4 border-b border-(--app-border) p-6">
						<div>
							<div class="flex items-center gap-3">
								<i class="{s.icon} text-2xl text-(--app-accent)"></i>
								<h3 class="text-lg font-semibold">{s.title}</h3>
							</div>
							<p class="mt-1 text-xs text-(--app-muted)">{s.platform}</p>
							<p class="mt-3 text-sm leading-6 text-(--app-secondary)">{s.path}</p>
						</div>
						<button
							type="button"
							onclick={() => copy(s.id, s.code)}
							class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-(--app-border) bg-(--app-hover) px-3 py-2 text-xs text-(--app-button) transition hover:bg-(--app-accent)/15 hover:text-(--app-button-hover)"
						>
							{#if copied === s.id}
								<i class="fa-solid fa-check text-(--app-accent)"></i>
								Copied
							{:else}
								<i class="fa-solid fa-copy"></i>
								Copy
							{/if}
						</button>
					</header>
					<pre class="overflow-x-auto bg-[#0d1019] p-6 text-xs leading-relaxed text-[#d4d4d8]"><code
							>{s.code}</code
						></pre>
				</article>
			{/each}
		</div>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Contact -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 text-center sm:py-20">
		<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
			Need a DPA, audit log, or signed agreement?
		</h2>
		<p class="mx-auto mt-4 max-w-xl text-sm leading-6 text-(--app-muted)">
			We're happy to walk your security team through the architecture, sign a Data Processing
			Agreement, or scope a private deployment for higher-volume use.
		</p>
		<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
			<a
				href="/contact"
				class="inline-flex items-center gap-2 rounded-xl bg-(--app-accent) px-5 py-3 text-sm font-semibold text-[#0d1019] transition hover:opacity-90"
			>
				<i class="fa-solid fa-envelope"></i>
				Contact us
			</a>
			<a
				href="/privacy"
				class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-semibold text-(--app-button) transition hover:text-(--app-button-hover) hover:bg-(--app-hover)"
			>
				<i class="fa-solid fa-shield-halved"></i>
				Read the privacy policy
			</a>
		</div>
	</section>

	<SiteFooter />
</main>
