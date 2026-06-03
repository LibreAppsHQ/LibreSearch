<script lang="ts">
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { categoryMeta, postsByDate } from '$lib/blog/posts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);

	const more = $derived(postsByDate.filter((p) => p.slug !== post.slug).slice(0, 2));

	function formatDate(iso: string): string {
		return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{post.title} - LibreSearch Blog</title>
	<meta name="description" content={post.description} />
	<link rel="canonical" href="https://libresearch.ca/blog/{post.slug}" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:url" content="https://libresearch.ca/blog/{post.slug}" />
	<meta property="og:image" content="https://libresearch.ca/og-image.png" />
	<meta property="article:published_time" content={post.date} />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<a
				href="/blog"
				class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)"
			>
				Blog
			</a>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="min-h-screen bg-(--app-background) text-(--app-text)">
	<article class="mx-auto w-full max-w-[760px] px-6 py-12 sm:py-16">
		<a
			href="/blog"
			class="inline-flex items-center gap-2 text-sm text-(--app-muted) transition hover:text-(--app-text)"
		>
			<i class="fa-solid fa-arrow-left text-xs"></i>
			All posts
		</a>

		<div class="mt-8 flex flex-wrap items-center gap-3">
			<span
				class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase {categoryMeta[
					post.category
				].fg} {categoryMeta[post.category].bg}"
			>
				{categoryMeta[post.category].label}
			</span>
			<time class="text-sm text-(--app-muted)" datetime={post.date}>
				{formatDate(post.date)}
			</time>
			<span class="text-sm text-(--app-muted)">·</span>
			<span class="text-sm text-(--app-muted)">{post.readingMinutes} min read</span>
		</div>

		<h1 class="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
		<p class="mt-5 text-lg leading-8 text-(--app-secondary)">{post.description}</p>

		<p class="mt-6 text-sm text-(--app-muted)">By {post.author}</p>

		<div class="mt-10 border-t border-(--app-border) pt-10">
			<div class="prose-app">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted, static authored post content -->
				{@html post.body}
			</div>
		</div>

		<!-- Soft CTA -->
		<div
			class="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-(--app-border) bg-(--app-surface) p-6 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<p class="font-semibold">Search without the surveillance.</p>
				<p class="mt-1 text-sm text-(--app-muted)">
					No logging, no profiles, no ads — just results.
				</p>
			</div>
			<a
				href="/"
				class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-(--app-accent) px-5 py-2.5 text-sm font-semibold text-[#111111] transition hover:opacity-90"
			>
				<i class="fa-solid fa-magnifying-glass text-xs"></i>
				Try LibreSearch
			</a>
		</div>
	</article>

	<!-- More posts -->
	{#if more.length}
		<section class="mx-auto w-full max-w-[760px] px-6 pb-16">
			<div class="border-t border-(--app-border) pt-10">
				<h2 class="mb-6 text-lg font-bold tracking-tight">Keep reading</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each more as p, i (i)}
						<a
							href="/blog/{p.slug}"
							class="group rounded-2xl border border-(--app-border) bg-(--app-surface) p-5 transition hover:border-(--app-accent)"
						>
							<span
								class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase {categoryMeta[
									p.category
								].fg} {categoryMeta[p.category].bg}"
							>
								{categoryMeta[p.category].label}
							</span>
							<h3
								class="mt-3 text-base leading-6 font-semibold transition group-hover:text-(--app-accent)"
							>
								{p.title}
							</h3>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<SiteFooter />
</main>

<style>
	/* Scoped prose styling for the trusted {@html} post body. Uses :global so it
	   reaches the rendered HTML, namespaced under .prose-app to avoid leaking. */
	.prose-app :global(h2) {
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		margin-top: 2.5rem;
		margin-bottom: 0.75rem;
		color: var(--app-text);
	}
	.prose-app :global(h3) {
		font-size: 1.2rem;
		line-height: 1.75rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 0.5rem;
		color: var(--app-text);
	}
	.prose-app :global(p) {
		font-size: 1.0625rem;
		line-height: 1.85rem;
		margin-bottom: 1.25rem;
		color: var(--app-secondary);
	}
	.prose-app :global(ul),
	.prose-app :global(ol) {
		margin: 0 0 1.25rem 1.25rem;
		color: var(--app-secondary);
	}
	.prose-app :global(ul) {
		list-style: disc;
	}
	.prose-app :global(ol) {
		list-style: decimal;
	}
	.prose-app :global(li) {
		font-size: 1.0625rem;
		line-height: 1.7rem;
		margin-bottom: 0.5rem;
		padding-left: 0.25rem;
	}
	.prose-app :global(strong) {
		color: var(--app-text);
		font-weight: 600;
	}
	.prose-app :global(a) {
		color: var(--app-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.prose-app :global(blockquote) {
		border-left: 3px solid var(--app-accent);
		padding: 0.25rem 0 0.25rem 1.25rem;
		margin: 0 0 1.25rem 0;
		font-style: italic;
		color: var(--app-text);
	}
	.prose-app :global(code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.9em;
		background: var(--app-hover);
		padding: 0.1rem 0.35rem;
		border-radius: 0.3rem;
	}
</style>
