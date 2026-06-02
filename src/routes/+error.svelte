<script lang="ts">
	import { page } from '$app/stores';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let query = $state('');

	function copy(status: number): { title: string; body: string } {
		switch (status) {
			case 404:
				return {
					title: 'Page not found',
					body: "The page you're looking for doesn't exist, has been renamed, or never existed in the first place. Try searching for what you were after."
				};
			case 403:
				return {
					title: 'Forbidden',
					body: "You don't have permission to view this. If you believe this is a mistake, get in touch."
				};
			case 429:
				return {
					title: 'Too many requests',
					body: "You've been rate-limited to keep the service fast for everyone. Take a breath and try again in a minute."
				};
			case 500:
				return {
					title: 'Something went wrong',
					body: "Our server hit an unexpected error. We're notified automatically and we'll look at it."
				};
			case 502:
			case 503:
			case 504:
				return {
					title: 'The search index is unreachable',
					body: 'Our upstream search provider may be having a moment. Try again shortly.'
				};
			default:
				return {
					title: 'Unexpected error',
					body: 'An unexpected error occurred. Try again, or head back home.'
				};
		}
	}

	let { title, body } = $derived(copy($page.status));
</script>

<svelte:head>
	<title>{$page.status} - LibreSearch</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main
	class="flex min-h-screen flex-col items-center justify-center bg-(--app-background) px-6 py-16 text-center text-(--app-text)"
>
	<a href="/" class="mb-10 inline-flex" aria-label="LibreSearch home">
		<Logo class="h-12 w-30" />
	</a>

	<p class="mb-4 text-8xl font-bold text-(--app-accent) tabular-nums opacity-40">
		{$page.status}
	</p>

	<h1 class="mb-3 text-2xl font-bold tracking-tight">{title}</h1>

	<p class="mb-10 max-w-md text-sm leading-6 text-(--app-muted)">{body}</p>

	<form
		action="/search"
		method="get"
		class="mb-8 flex w-full max-w-md items-center gap-2 rounded-2xl border border-(--app-border) bg-(--app-surface) px-4 py-2.5 focus-within:border-(--app-accent)"
	>
		<i class="fa-solid fa-magnifying-glass text-sm text-(--app-muted)"></i>
		<input
			type="search"
			name="q"
			autocomplete="off"
			autocapitalize="off"
			autocorrect="off"
			spellcheck="false"
			placeholder="Try a search instead"
			bind:value={query}
			class="min-w-0 flex-1 bg-transparent text-sm text-(--app-text) placeholder:text-(--app-muted) focus:outline-none"
		/>
		<button
			type="submit"
			class="rounded-xl bg-(--app-accent) px-3 py-1.5 text-xs font-semibold text-[#0d1019] transition hover:opacity-90"
		>
			Search
		</button>
	</form>
</main>

<SiteFooter />
