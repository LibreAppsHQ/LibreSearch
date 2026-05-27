<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>About the design - Launchpad</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta
		name="description"
		content="Why Launchpad's interface looks a lot like Startpage's — an honest note on design inspiration."
	/>
</svelte:head>

<!-- Sticky header -->
<header class="sticky top-0 z-20 bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-[var(--app-text)]">
				About the design
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
	<article class="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
		<div
			class="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-accent)]/15 text-[var(--app-accent)]"
		>
			<i class="fa-solid fa-palette text-2xl"></i>
		</div>

		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
			Yes, this looks a lot like Startpage.
		</h1>
		<p class="mt-5 text-lg leading-8 text-[var(--app-secondary)]">
			If you've used <a
				href="https://www.startpage.com"
				target="_blank"
				rel="noopener noreferrer"
				class="text-[var(--app-accent)] hover:underline">Startpage</a
			>, the resemblance is hard to miss. That's not an accident, and we'd rather be upfront about
			it than pretend otherwise.
		</p>

		<div class="mt-10 space-y-8 text-[15px] leading-7 text-[var(--app-muted)]">
			<section>
				<h2 class="mb-2 text-lg font-semibold text-[var(--app-text)]">We learned from the best</h2>
				<p>
					Startpage has spent years refining what a calm, privacy-first search interface should feel
					like: generous spacing, an honest settings page, a results layout that gets out of your
					way. When we set out to build Launchpad, we studied interfaces we admired — and theirs
					kept coming out on top. So our layout, our settings structure, and our tone borrow heavily
					from what they got right.
				</p>
			</section>

			<section>
				<h2 class="mb-2 text-lg font-semibold text-[var(--app-text)]">
					Good privacy UX shouldn't be reinvented for its own sake
				</h2>
				<p>
					Familiar patterns lower the bar for people switching away from surveillance-heavy search
					engines. If the toggles, tabs, and result cards feel like something you already know how
					to use, that's a feature — not a coincidence. We'd rather you spend zero seconds
					relearning an interface and all your attention on the fact that nobody is logging your
					searches.
				</p>
			</section>

			<section>
				<h2 class="mb-2 text-lg font-semibold text-[var(--app-text)]">What's actually ours</h2>
				<p>
					The look is inspired by Startpage; the engine underneath is our own. Launchpad is an
					independent project with its own search backend, its own privacy model, and its own code.
					We're not affiliated with Startpage, and nothing here is copied from their codebase — only
					the design sensibility.
				</p>
			</section>

			<section>
				<h2 class="mb-2 text-lg font-semibold text-[var(--app-text)]">Credit where it's due</h2>
				<p>
					So: thank you, Startpage, for setting a high bar for what private search can look like. If
					you like this interface, you'll probably like theirs too — go check them out.
				</p>
			</section>
		</div>

		<div class="mt-12 flex flex-wrap gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 rounded-xl bg-[var(--app-accent)] px-5 py-2.5 text-sm font-semibold text-[#111111] transition hover:opacity-90"
			>
				<i class="fa-solid fa-magnifying-glass text-xs"></i>
				Start searching
			</a>
			<a
				href="https://www.startpage.com"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] px-5 py-2.5 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
			>
				Visit Startpage
				<i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
			</a>
		</div>
	</article>
</main>

<SiteFooter />
