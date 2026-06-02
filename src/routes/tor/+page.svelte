<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	// Why route search through Tor — mirrors Proton's four-benefit framing.
	const benefits = [
		{
			icon: 'fa-eye-slash',
			title: 'No network snooping',
			body: 'Your ISP and any observer between us and the search provider can no longer see which provider your query is bound for, or tie it back to our server.'
		},
		{
			icon: 'fa-user-secret',
			title: 'Anonymous connection',
			body: 'The provider sees an anonymous Tor exit node instead of the LibreSearch server address. Three relays sit between source and destination, and no single one knows both.'
		},
		{
			icon: 'fa-shield-halved',
			title: 'No DNS leaks',
			body: 'Hostnames are resolved by the proxy over Tor (socks5h), so domain lookups never touch a local resolver that could log or expose them.'
		},
		{
			icon: 'fa-tower-broadcast',
			title: 'Circumvent censorship',
			body: 'Where a network blocks a search provider outright, routing the request through Tor can reach it anyway by exiting somewhere the block does not apply.'
		}
	];

	// Honest limitations — Proton's "Things to keep in mind" section.
	const keepInMind = [
		'Tor is slower. Every request crosses three volunteer-run relays before reaching the provider, so results take longer to arrive.',
		'It hides the path, not the query. The provider still processes the search text itself — Tor only conceals where the request came from.',
		'Result clicks are not tunnelled. Opening a result loads that site directly from your browser. For end-to-end anonymity, use the Tor Browser.',
		'It is fail-closed. If the Tor proxy cannot be reached, the search stops and tells you, rather than silently dropping back to a direct connection and de-anonymising you.',
		'Some providers throttle or challenge known Tor exit nodes, which can cause the occasional failed search.'
	];

	const steps = [
		{
			title: 'Turn it on',
			body: 'Open Settings → Privacy and Safety and enable "Route searches through Tor". The choice is remembered across tabs, pagination, and autocomplete.'
		},
		{
			title: 'Search as normal',
			body: 'Web, image, video, news, shopping, map, and suggestion requests all travel through the same Tor circuit from that point on.'
		},
		{
			title: 'Go further with Tor Browser',
			body: 'For anonymity that also covers the sites you click through to, browse LibreSearch from the Tor Browser instead of a standard browser.'
		}
	];

	const faqs = [
		{
			q: 'Does this make me anonymous?',
			a: 'It anonymises the connection between our server and the search provider. It does not anonymise your own browser — for that, pair it with the Tor Browser.'
		},
		{
			q: 'Why is search slower with Tor on?',
			a: 'Each request is relayed through three nodes spread across the world before reaching the provider. That extra distance and layered encryption costs time.'
		},
		{
			q: 'What if the Tor proxy is down?',
			a: 'The search fails closed with a clear message. We never silently fall back to a direct connection, because that would de-anonymise a search you asked to protect.'
		},
		{
			q: 'Do you log my searches when Tor is on?',
			a: 'No. The toggle only changes the network path to the provider. Our no-logging stance is the same with Tor on or off.'
		}
	];
</script>

<svelte:head>
	<title>Search over Tor - LibreSearch</title>
	<meta
		name="description"
		content="Route your LibreSearch queries through the Tor anonymity network. What Tor is, why use it, what to keep in mind, and how to turn it on."
	/>
	<link rel="canonical" href="https://libresearch.ca/tor" />
	<meta property="og:title" content="Search over Tor - LibreSearch" />
	<meta
		property="og:description"
		content="Send search and suggestion requests to upstream providers over Tor, hiding the server's IP and resolving DNS over the network."
	/>
	<meta property="og:url" content="https://libresearch.ca/tor" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">Tor</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1000px] px-6 pt-12 pb-10 text-center sm:pt-16">
		<div class="mx-auto mb-10 flex max-w-md justify-center">
			<img
				src="/download.svg"
				alt="Onion-routing diagram: a query passing through layered Tor relays"
				class="w-full"
			/>
		</div>
		<h1 class="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
			Search the web through the Tor anonymity network
		</h1>
		<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-(--app-muted) sm:text-lg">
			LibreSearch can send every query it makes upstream over Tor, so the search provider sees an
			anonymous exit node instead of our server — and your searches stay unlinkable.
		</p>
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<a
				href="/settings"
				class="inline-flex items-center gap-2 rounded-full bg-(--app-accent) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
			>
				<i class="fa-solid fa-sliders"></i>
				Enable in settings
			</a>
			<a
				href="https://www.torproject.org/download/"
				rel="noopener noreferrer"
				target="_blank"
				class="inline-flex items-center gap-2 rounded-full border border-(--app-border) px-6 py-3 text-sm font-semibold text-(--app-text) transition hover:border-(--app-accent)"
			>
				<i class="fa-solid fa-download text-xs"></i>
				Download Tor Browser
			</a>
		</div>
	</section>

	<!-- What is Tor? -->
	<section class="mx-auto w-full max-w-[900px] px-6 py-12">
		<h2 class="text-2xl font-semibold tracking-tight">What is Tor?</h2>
		<p class="mt-4 text-base leading-7 text-(--app-muted)">
			Tor is free, open-source software for anonymous communication. It routes your traffic through
			a worldwide network of volunteer-run relays, wrapping each request in layers of encryption —
			the “onion” in onion routing. Every relay peels back a single layer and can only see the hop
			on either side of it, so no one point in the path ever knows both who sent a request and where
			it is going.
		</p>
		<p class="mt-4 text-base leading-7 text-(--app-muted)">
			First developed in the 1990s and now maintained by the non-profit Tor Project, it is relied on
			every day by journalists, researchers, activists, and anyone who would rather not have their
			browsing tied back to them. LibreSearch builds on that same network to anonymise the requests
			it makes on your behalf.
		</p>
	</section>

	<!-- Why use Tor -->
	<section class="mx-auto w-full max-w-[900px] px-6 py-12">
		<h2 class="text-2xl font-semibold tracking-tight">Why search over Tor?</h2>
		<div class="mt-8 grid gap-4 sm:grid-cols-2">
			{#each benefits as benefit, i (i)}
				<div class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
					<div
						class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-accent)/15 text-(--app-accent)"
					>
						<i class="fa-solid {benefit.icon}"></i>
					</div>
					<p class="mt-4 font-semibold text-(--app-text)">{benefit.title}</p>
					<p class="mt-2 text-sm leading-6 text-(--app-muted)">{benefit.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Things to keep in mind -->
	<section class="mx-auto w-full max-w-[900px] px-6 py-12">
		<h2 class="text-2xl font-semibold tracking-tight">Things to keep in mind</h2>
		<p class="mt-4 max-w-2xl text-base leading-7 text-(--app-muted)">
			Tor routing is one strong layer, not a cloak of invisibility. We would rather be straight
			about the edges than oversell it.
		</p>
		<ul class="mt-6 space-y-3 text-sm leading-6 text-(--app-text)">
			{#each keepInMind as item, i (i)}
				<li class="flex items-start gap-3">
					<i class="fa-solid fa-circle-info mt-1 text-amber-400"></i>
					<span>{item}</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- How to use -->
	<section class="mx-auto w-full max-w-[900px] px-6 py-12">
		<h2 class="text-2xl font-semibold tracking-tight">How to use Tor with LibreSearch</h2>
		<div class="mt-8 space-y-4">
			{#each steps as step, i (i)}
				<div
					class="flex items-start gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-6"
				>
					<span
						class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--app-accent)/15 text-sm font-semibold text-(--app-accent)"
						>{i + 1}</span
					>
					<div>
						<p class="font-semibold text-(--app-text)">{step.title}</p>
						<p class="mt-1 text-sm leading-6 text-(--app-muted)">{step.body}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Technical details -->
	<section class="mx-auto w-full max-w-[900px] px-6 py-12">
		<h2 class="text-2xl font-semibold tracking-tight">Technical details</h2>
		<p class="mt-4 text-base leading-7 text-(--app-muted)">
			When Tor routing is on, the client tags each request and the server dispatches the upstream
			fetch through a SOCKS5 proxy instead of a direct connection. We use the
			<code class="rounded bg-(--app-elevated) px-1.5 py-0.5 text-xs text-(--app-text)"
				>socks5h</code
			>
			scheme so the proxy resolves DNS — lookups travel over Tor too, never a local resolver.
		</p>
		<div
			class="mt-6 rounded-2xl border border-(--app-border) bg-(--app-surface) p-6 text-sm leading-7"
		>
			<p class="flex items-center gap-2 font-semibold text-(--app-text)">
				<i class="fa-solid fa-server text-(--app-accent)"></i>
				Self-hosting
			</p>
			<p class="mt-2 text-(--app-muted)">
				Tor is not bundled with LibreSearch — the server needs a reachable SOCKS5 proxy. Point the
				<code class="rounded bg-(--app-elevated) px-1.5 py-0.5 text-xs text-(--app-text)"
					>TOR_PROXY_URL</code
				>
				environment variable at it, for example
				<code class="rounded bg-(--app-elevated) px-1.5 py-0.5 text-xs text-(--app-text)"
					>socks5h://127.0.0.1:9050</code
				>
				for a local <code class="text-(--app-text)">tor</code> daemon. With no proxy reachable, the toggle
				surfaces a clear error rather than connecting directly.
			</p>
		</div>
	</section>

	<!-- FAQ -->
	<section class="mx-auto w-full max-w-[900px] px-6 py-12">
		<h2 class="text-2xl font-semibold tracking-tight">Frequently asked</h2>
		<div class="mt-6 space-y-3">
			{#each faqs as faq, i (i)}
				<details class="group rounded-2xl border border-(--app-border) bg-(--app-surface) p-5">
					<summary
						class="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-(--app-text) marker:content-none"
					>
						{faq.q}
						<i
							class="fa-solid fa-chevron-down text-xs text-(--app-muted) transition group-open:rotate-180"
						></i>
					</summary>
					<p class="mt-3 text-sm leading-6 text-(--app-muted)">{faq.a}</p>
				</details>
			{/each}
		</div>
	</section>

	<!-- Closing CTA -->
	<section class="mx-auto w-full max-w-[900px] px-6 pt-6 pb-16 text-center">
		<div class="rounded-3xl border border-(--app-border) bg-(--app-surface) px-6 py-12">
			<h2 class="text-2xl font-semibold tracking-tight">Ready to search anonymously?</h2>
			<p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-(--app-muted)">
				Turn on Tor routing in your settings, or read how we handle your data in the privacy policy.
			</p>
			<div class="mt-7 flex flex-wrap justify-center gap-3">
				<a
					href="/settings"
					class="inline-flex items-center gap-2 rounded-full bg-(--app-accent) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
				>
					<i class="fa-solid fa-sliders"></i>
					Enable in settings
				</a>
				<a
					href="/privacy"
					class="inline-flex items-center gap-2 rounded-full border border-(--app-border) px-6 py-3 text-sm font-semibold text-(--app-text) transition hover:border-(--app-accent)"
				>
					Privacy policy
				</a>
			</div>
		</div>
	</section>

	<SiteFooter />
</main>
