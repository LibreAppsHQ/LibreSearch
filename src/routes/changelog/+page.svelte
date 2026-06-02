<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Tag = 'feature' | 'fix' | 'perf' | 'security' | 'docs';
	type Entry = { tag: Tag; text: string };
	type Release = { version: string; date: string; title: string; entries: Entry[] };

	const tagColors: Record<Tag, { fg: string; bg: string; label: string }> = {
		feature: { fg: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'New' },
		fix: { fg: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Fix' },
		perf: { fg: 'text-(--app-accent)', bg: 'bg-(--app-accent)/15', label: 'Perf' },
		security: { fg: 'text-rose-400', bg: 'bg-rose-500/15', label: 'Security' },
		docs: { fg: 'text-violet-400', bg: 'bg-violet-500/15', label: 'Docs' }
	};

	const releases: Release[] = [
		{
			version: '0.6.1',
			date: '2026-05-30',
			title: 'Theme and accessibility fixes',
			entries: [
				{
					tag: 'fix',
					text: 'Light and Sand themes: the search box, suggestions, and filter menus rendered dark-on-dark and were unreadable — surfaces are now theme-aware'
				},
				{
					tag: 'fix',
					text: 'Home and search-page logos no longer stretch out of proportion or overflow on small screens'
				},
				{ tag: 'fix', text: 'Wipe button now also clears the install-prompt dismissal' },
				{
					tag: 'fix',
					text: '“Make it your default” dialog closes on Escape and moves focus into itself for keyboard users'
				}
			]
		},
		{
			version: '0.6.0',
			date: '2026-05-29',
			title: 'One-tap wipe',
			entries: [
				{
					tag: 'feature',
					text: 'Wipe button clears all on-device history, settings, and data in one tap, then returns home'
				},
				{
					tag: 'feature',
					text: 'Full-screen whirlpool animation plays while your data drains away (respects reduced-motion)'
				}
			]
		},
		{
			version: '0.5.0',
			date: '2026-05-28',
			title: 'Enterprise, contact, and content surfaces',
			entries: [
				{
					tag: 'feature',
					text: 'New /enterprise page with copy-pasteable Chrome, Edge, and Firefox deployment policies'
				},
				{ tag: 'feature', text: 'Contact form (/contact) wired up via Web3Forms' },
				{ tag: 'fix', text: '/favicon.ico now redirects to favicon.svg instead of returning 500' },
				{
					tag: 'security',
					text: 'CSP tightened: explicit allow-list for Vercel and Web3Forms only'
				}
			]
		},
		{
			version: '0.5.0',
			date: '2026-05-27',
			title: 'Analytics and speed insights',
			entries: [
				{
					tag: 'feature',
					text: 'Vercel Analytics integrated for aggregate, privacy-respecting usage signals'
				},
				{ tag: 'feature', text: 'Vercel Speed Insights for Core Web Vitals monitoring' }
			]
		},
		{
			version: '0.4.2',
			date: '2026-05-28',
			title: 'Mobile performance pass',
			entries: [
				{
					tag: 'perf',
					text: 'FontAwesome CSS deferred until after first paint — ~890ms FCP/LCP improvement on mobile'
				},
				{ tag: 'perf', text: 'font-display: swap added so icon text never blocks rendering' },
				{ tag: 'perf', text: 'Home-page logo preloaded for instant LCP discovery' },
				{
					tag: 'perf',
					text: 'Composite-friendly will-change hints on fade/slide/scale animations'
				},
				{ tag: 'feature', text: 'Mastodon link added to footer alongside GitHub' }
			]
		},
		{
			version: '0.4.0',
			date: '2026-05-26',
			title: 'Instant answers, donations, and search UX',
			entries: [
				{
					tag: 'feature',
					text: 'Instant answers for calculations, conversions, definitions, IP lookup, and quick facts'
				},
				{ tag: 'feature', text: 'Donation page with Bitcoin and Ethereum addresses' },
				{ tag: 'feature', text: 'Did-you-mean spelling suggestion above results' },
				{ tag: 'feature', text: 'Bang shortcuts (!w, !gh, !yt, and hundreds more)' },
				{
					tag: 'feature',
					text: 'OpenSearch endpoint so browsers can register LibreSearch as default'
				}
			]
		},
		{
			version: '0.3.0',
			date: '2026-05-20',
			title: 'Security and abuse protection',
			entries: [
				{
					tag: 'security',
					text: 'Altcha proof-of-work bot protection — no CAPTCHAs, no behavioral tracking'
				},
				{ tag: 'security', text: 'Rate limiting per IP for the search API' },
				{ tag: 'feature', text: 'Built-in video viewer for video search results' }
			]
		},
		{
			version: '0.2.0',
			date: '2026-05-14',
			title: 'Search experience and rebrand',
			entries: [
				{ tag: 'feature', text: 'Project rebranded to LibreSearch' },
				{ tag: 'feature', text: 'Themes: dark, light, slate, and sand' },
				{ tag: 'feature', text: 'Compact results mode' },
				{ tag: 'feature', text: 'Region selector and freshness filters' }
			]
		}
	];
</script>

<svelte:head>
	<title>Changelog - LibreSearch</title>
	<meta
		name="description"
		content="Release notes for LibreSearch. New features, fixes, performance work, and security improvements, dated and tagged."
	/>
	<link rel="canonical" href="https://libresearch.ca/changelog" />
	<meta property="og:title" content="Changelog - LibreSearch" />
	<meta property="og:description" content="Everything that's shipped in LibreSearch, by release." />
	<meta property="og:url" content="https://libresearch.ca/changelog" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Changelog
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<section class="mx-auto w-full max-w-[900px] px-6 py-12 sm:py-16">
		<p class="text-sm text-(--app-muted)">
			Every release, dated and tagged. Subscribe via
			<a
				href="https://github.com/Arcbasehq/LibreSearch/releases.atom"
				class="text-(--app-accent) hover:underline"
				target="_blank"
				rel="noopener noreferrer">RSS</a
			>
			or
			<a
				href="https://github.com/Arcbasehq/LibreSearch/releases"
				class="text-(--app-accent) hover:underline"
				target="_blank"
				rel="noopener noreferrer">GitHub releases</a
			>.
		</p>

		<div class="mt-12 space-y-12">
			{#each releases as r, i (i)}
				<article id="v{r.version}" class="border-l-2 border-(--app-border) pl-6">
					<div class="flex flex-wrap items-baseline gap-3">
						<h2 class="text-2xl font-bold tracking-tight">v{r.version}</h2>
						<time class="text-sm text-(--app-muted)">{r.date}</time>
					</div>
					<p class="mt-1 text-base text-(--app-secondary)">{r.title}</p>
					<ul class="mt-5 space-y-3">
						{#each r.entries as e, i (i)}
							<li class="flex items-start gap-3 text-sm leading-6">
								<span
									class="mt-0.5 inline-flex shrink-0 items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase {tagColors[
										e.tag
									].fg} {tagColors[e.tag].bg}"
								>
									{tagColors[e.tag].label}
								</span>
								<span class="text-(--app-text)">{e.text}</span>
							</li>
						{/each}
					</ul>
				</article>
			{/each}
		</div>
	</section>

	<SiteFooter />
</main>
