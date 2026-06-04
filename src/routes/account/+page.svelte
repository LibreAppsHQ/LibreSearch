<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const isPro = $derived(data.plan === 'pro');
</script>

<svelte:head>
	<title>Account - LibreSearch</title>
	<meta name="description" content="Manage your LibreSearch account, plan, and settings." />
	<meta name="robots" content="noindex, nofollow" />
	<link rel="canonical" href="https://libresearch.ca/account" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">Account</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<section class="mx-auto w-full max-w-[760px] px-6 py-12 sm:py-16">
		<h1 class="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">Your account</h1>

		<!-- Identity -->
		<div class="rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p class="text-lg font-semibold">{data.user.name || 'LibreSearch user'}</p>
					<p class="mt-1 text-sm text-(--app-muted)">{data.user.email}</p>
				</div>
				<span
					class="rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase {isPro
						? 'bg-(--app-accent)/15 text-(--app-accent)'
						: 'bg-(--app-hover) text-(--app-muted)'}"
				>
					{isPro ? 'Pro' : 'Free'}
				</span>
			</div>
		</div>

		<!-- Plan -->
		<div class="mt-6 rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
			<h2 class="text-base font-semibold">Plan</h2>
			{#if isPro}
				<p class="mt-2 text-sm leading-6 text-(--app-muted)">
					You're on <span class="text-(--app-accent)">Pro</span>. Rate limits are lifted and you
					skip the bot-protection challenge. Billing management arrives in the next update.
				</p>
			{:else}
				<p class="mt-2 text-sm leading-6 text-(--app-muted)">
					You're on the Free plan. Pro lifts rate limits, skips the bot-protection challenge, and
					unlocks the Search API. Upgrade options are coming shortly.
				</p>
				<button
					type="button"
					disabled
					class="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-hover) px-5 py-2.5 text-sm font-semibold text-(--app-muted)"
				>
					Upgrade to Pro <span class="text-xs">(soon)</span>
				</button>
			{/if}
		</div>

		<!-- Privacy note -->
		<div class="mt-6 rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
			<h2 class="text-base font-semibold">Privacy</h2>
			<p class="mt-2 text-sm leading-6 text-(--app-muted)">
				Your account is never linked to your searches. We store your email and plan status only —
				queries are never written to a log tied to your identity.
			</p>
		</div>

		<!-- Sign out -->
		<form method="POST" action="/logout" class="mt-8">
			<button
				type="submit"
				class="inline-flex items-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-2.5 text-sm font-semibold text-(--app-text) transition hover:bg-(--app-hover)"
			>
				<i class="fa-solid fa-arrow-right-from-bracket"></i>
				Sign out
			</button>
		</form>
	</section>

	<SiteFooter />
</main>
