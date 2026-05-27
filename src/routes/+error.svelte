<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} — Launchpad</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center bg-[var(--app-background)] px-6 text-center text-[var(--app-text)]">
	<p class="mb-4 text-8xl font-bold tabular-nums text-[var(--app-accent)] opacity-40">{$page.status}</p>

	<h1 class="mb-3 text-2xl font-bold tracking-tight">
		{#if $page.status === 404}
			Page not found
		{:else if $page.status === 500}
			Something went wrong
		{:else}
			Unexpected error
		{/if}
	</h1>

	<p class="mb-10 max-w-sm text-sm leading-6 text-[var(--app-muted)]">
		{#if $page.status === 404}
			The page you're looking for doesn't exist or has been moved.
		{:else}
			An unexpected error occurred. Please try again.
		{/if}
	</p>

	<div class="flex flex-wrap items-center justify-center gap-3">
		<a
			href="/"
			class="inline-flex items-center gap-2 rounded-2xl bg-[var(--app-accent)] px-5 py-2.5 text-sm font-semibold text-[#111111] transition hover:opacity-90"
		>
			<i class="fa-solid fa-house text-xs"></i>
			Go home
		</a>
		<a
			href="/search?q="
			class="inline-flex items-center gap-2 rounded-2xl border border-[var(--app-border)] px-5 py-2.5 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
		>
			<i class="fa-solid fa-magnifying-glass text-xs"></i>
			Search
		</a>
	</div>
</main>
