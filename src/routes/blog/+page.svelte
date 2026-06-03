<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { postsByDate, categoryMeta } from '$lib/blog/posts';

	const featured = postsByDate[0];
	const rest = postsByDate.slice(1);

	function formatDate(iso: string): string {
		return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog - LibreSearch</title>
	<meta
		name="description"
		content="Writing on privacy, security, and how LibreSearch is built — from what search engines know about you to why we use proof-of-work instead of CAPTCHAs."
	/>
	<link rel="canonical" href="https://libresearch.ca/blog" />
	<meta property="og:title" content="Blog - LibreSearch" />
	<meta
		property="og:description"
		content="Writing on privacy, security, and how LibreSearch is built."
	/>
	<meta property="og:url" content="https://libresearch.ca/blog" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">Blog</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="min-h-screen bg-(--app-background) text-(--app-text)">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-16 sm:py-20">
		<p class="mb-3 text-xs font-semibold tracking-widest text-(--app-accent) uppercase">
			The LibreSearch Blog
		</p>
		<h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
			Privacy and security, explained plainly.
		</h1>
		<p class="mt-6 max-w-2xl text-lg leading-8 text-(--app-secondary)">
			Notes from the team on how surveillance actually works, how we defend against it, and the
			choices behind a search engine built to know as little about you as possible.
		</p>
	</section>

	<div class="border-t border-(--app-border)"></div>

	<!-- Featured post -->
	{#if featured}
		<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-16">
			<a
				href="/blog/{featured.slug}"
				class="group block overflow-hidden rounded-3xl border border-(--app-border) bg-(--app-surface) p-8 transition hover:border-(--app-accent) sm:p-10"
			>
				<div class="flex flex-wrap items-center gap-3">
					<span
						class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase {categoryMeta[
							featured.category
						].fg} {categoryMeta[featured.category].bg}"
					>
						{categoryMeta[featured.category].label}
					</span>
					<span class="text-xs text-(--app-muted)">Latest</span>
				</div>
				<h2
					class="mt-5 max-w-3xl text-2xl font-bold tracking-tight transition group-hover:text-(--app-accent) sm:text-3xl"
				>
					{featured.title}
				</h2>
				<p class="mt-4 max-w-2xl text-base leading-7 text-(--app-secondary)">
					{featured.description}
				</p>
				<div class="mt-6 flex items-center gap-3 text-sm text-(--app-muted)">
					<time datetime={featured.date}>{formatDate(featured.date)}</time>
					<span>·</span>
					<span>{featured.readingMinutes} min read</span>
				</div>
			</a>
		</section>

		<div class="border-t border-(--app-border)"></div>
	{/if}

	<!-- Post list -->
	<section class="mx-auto w-full max-w-[1100px] px-6 py-12 sm:py-16">
		<h2 class="mb-10 text-2xl font-bold tracking-tight">All posts</h2>
		<div class="grid gap-6 sm:grid-cols-2">
			{#each rest as post, i (i)}
				<a
					href="/blog/{post.slug}"
					class="group flex flex-col rounded-2xl border border-(--app-border) bg-(--app-surface) p-6 transition hover:border-(--app-accent)"
				>
					<span
						class="inline-flex w-fit items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase {categoryMeta[
							post.category
						].fg} {categoryMeta[post.category].bg}"
					>
						{categoryMeta[post.category].label}
					</span>
					<h3
						class="mt-4 text-lg font-semibold tracking-tight transition group-hover:text-(--app-accent)"
					>
						{post.title}
					</h3>
					<p class="mt-3 flex-1 text-sm leading-6 text-(--app-secondary)">
						{post.description}
					</p>
					<div class="mt-5 flex items-center gap-3 text-xs text-(--app-muted)">
						<time datetime={post.date}>{formatDate(post.date)}</time>
						<span>·</span>
						<span>{post.readingMinutes} min read</span>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<SiteFooter />
</main>
