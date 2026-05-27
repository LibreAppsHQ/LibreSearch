<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SearchSkeleton from '$lib/components/SearchSkeleton.svelte';
	import NoResults from '$lib/components/NoResults.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import ResultsList from '$lib/components/ResultsList.svelte';
	import SearchTabs from '$lib/components/SearchTabs.svelte';
	import Infobox from '$lib/components/Infobox.svelte';
	import NewsResultItem from '$lib/components/NewsResultItem.svelte';
	import VideoResultItem from '$lib/components/VideoResultItem.svelte';
	import VideoViewer from '$lib/components/VideoViewer.svelte';
	import ImageGrid from '$lib/components/ImageGrid.svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import AltchaChallenge from '$lib/components/AltchaChallenge.svelte';
	import { settingsStore, getToggle } from '$lib/stores/settings';
	import { historyStore } from '$lib/stores/history';
	import type { VideoResult } from '$lib/search';

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let query = $state('');
	let allResults = $state(data.results);
	let hasMore = $state(data.results.length >= (data.count ?? 10));
	let activeVideo = $state<VideoResult | null>(null);

	$effect(() => {
		query = data.query;
		allResults = data.results;
		hasMore = data.tab === 'web' && data.results.length >= (data.count ?? 10);
	});

	const MAX_PAGE = 10; // Brave caps offset at 9 → page 10 is the last reachable page
	let currentPage = $derived(data.page ?? 1);
	let canGoNext = $derived(hasMore && currentPage < MAX_PAGE);
	let pageNumbers = $derived.by(() => {
		const start = Math.max(1, currentPage - 2);
		const end = Math.min(MAX_PAGE, hasMore ? start + 4 : currentPage);
		const pages: number[] = [];
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	});

	let safesearch = $derived(getToggle($settingsStore, 'safe-search'));

	// Show skeletons while a search navigation is in flight so stale results
	// aren't left frozen on screen during the server round-trip.
	let loading = $derived(navigating.to?.url.pathname === '/search' && !!navigating.to?.url.searchParams.get('q'));
	let loadingTab = $derived(
		(navigating.to?.url.searchParams.get('t') as typeof data.tab) || 'web'
	);

	const freshnessLabels: Record<string, string> = {
		pd: 'Past day',
		pw: 'Past week',
		pm: 'Past month',
		py: 'Past year'
	};

	const regionOptions = [
		{ label: 'All regions', value: '' },
		{ label: 'United States', value: 'US' },
		{ label: 'United Kingdom', value: 'GB' },
		{ label: 'Canada', value: 'CA' },
		{ label: 'Australia', value: 'AU' },
		{ label: 'Germany', value: 'DE' },
		{ label: 'France', value: 'FR' },
		{ label: 'Japan', value: 'JP' },
		{ label: 'India', value: 'IN' },
		{ label: 'Brazil', value: 'BR' }
	];

	const timeOptions = [
		{ label: 'Any time', value: '' },
		{ label: 'Past day', value: 'pd' },
		{ label: 'Past week', value: 'pw' },
		{ label: 'Past month', value: 'pm' },
		{ label: 'Past year', value: 'py' }
	];

	const safeOptions = [
		{ label: 'Safe Search: On', value: '1' },
		{ label: 'Safe Search: Off', value: '' }
	];

	function buildUrl(overrides: Record<string, string | undefined>): string {
		const params = new URLSearchParams({ q: data.query });
		if (data.tab !== 'web') params.set('t', data.tab);
		if (data.freshness) params.set('f', data.freshness);
		if (data.safe) params.set('safe', '1');
		if (data.region) params.set('region', data.region);
		for (const [k, v] of Object.entries(overrides)) {
			if (v === undefined || v === '') params.delete(k);
			else params.set(k, v);
		}
		return `/search?${params}`;
	}

	function handleFreshnessChange(event: Event) {
		const val = (event.currentTarget as HTMLSelectElement).value;
		void goto(buildUrl({ f: val || undefined }));
	}

	onMount(() => {
		const input = document.querySelector<HTMLInputElement>('input[name="q"]');
		input?.focus();
		input?.setSelectionRange(query.length, query.length);
		if (data.query && getToggle($settingsStore, 'save-history')) historyStore.add(data.query);
	});

	function goToPage(p: number) {
		void goto(buildUrl({ p: p > 1 ? String(p) : undefined }));
		if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>{query ? `${query} - Launchpad` : 'Launchpad'}</title>
	<meta name="robots" content="noindex, noarchive, nofollow" />
</svelte:head>

<main class="min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
	<!-- Sticky header -->
	<header
		class="sticky top-0 z-20 border-b border-[var(--app-border)] bg-[var(--app-background)]/95 backdrop-blur"
	>
		<div class="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
			<div class="flex items-center gap-3 py-3 sm:gap-5">
				<a href="/" class="hidden shrink-0 text-lg font-semibold tracking-tight text-[var(--app-text)] sm:block">
					<Logo class="h-10 w-25 rounded-full" />
				</a>
				<div class="max-w-2xl flex-1">
					<SearchBar
						bind:query
						compact={true}
						placeholder="Search the web..."
						action="/search"
						showButton={true}
						{safesearch}
					/>
				</div>
				<SiteMenu class="shrink-0" />
			</div>

			<!-- Tabs row -->
			<div class="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<SearchTabs current={data.tab} query={data.query} freshness={data.freshness} />
			</div>
		</div>
	</header>

	<!-- Body -->
	{#if data.challengeRequired}
		<div class="mx-auto w-full max-w-[1200px] px-4 pt-5 pb-16 sm:px-6">
			<AltchaChallenge />
		</div>
	{:else}
	<div class="mx-auto w-full max-w-[1200px] px-4 pt-5 pb-16 sm:px-6 sm:pr-6">
		<!-- Filters row -->
		{#if data.query}
			<div class="mb-5 flex flex-wrap items-center gap-3">
				<CustomSelect
					value={data.region ?? ''}
					options={regionOptions}
					onchange={(val) => void goto(buildUrl({ region: val || undefined }))}
				/>
				<CustomSelect
					value={data.safe ? '1' : ''}
					options={safeOptions}
					onchange={(val) => void goto(buildUrl({ safe: val || undefined }))}
				/>
				{#if data.tab !== 'images'}
					<CustomSelect
						value={data.freshness ?? ''}
						options={timeOptions}
						onchange={(val) => void goto(buildUrl({ f: val || undefined }))}
					/>
				{/if}
			</div>
		{/if}

		{#if data.error}
			<p class="mb-6 max-w-2xl text-sm text-red-400">{data.error}</p>
		{/if}

		{#if data.freshness && data.query}
			<p class="mb-4 max-w-2xl text-xs text-[var(--app-muted)]">
				Filtered: <span class="text-[var(--app-text)]">{freshnessLabels[data.freshness]}</span>
				·
				<a href={buildUrl({ f: undefined })} class="text-[var(--app-accent)] hover:underline"
					>Clear</a
				>
			</p>
		{/if}

		{#if data.didYouMean}
			<p class="mb-4 max-w-2xl text-sm text-[var(--app-muted)]">
				Did you mean:
				<a
					href="/search?q={encodeURIComponent(data.didYouMean)}"
					class="font-medium italic text-[var(--app-accent)] hover:underline"
				>{data.didYouMean}</a>?
			</p>
		{/if}

		<!-- Two-column grid: left = results, right = infobox (web tab only) -->
		<div class={data.infobox && data.tab === 'web' && !loading ? 'flex gap-8' : ''}>
			<!-- Left / main column -->
			<div
				class={loading
					? loadingTab === 'images' || loadingTab === 'videos'
						? 'w-full'
						: 'max-w-2xl'
					: data.infobox && data.tab === 'web'
						? 'max-w-2xl min-w-0 flex-1'
						: data.tab === 'images' || data.tab === 'videos'
							? 'w-full'
							: 'max-w-2xl'}
			>
				{#if loading}
					<SearchSkeleton tab={loadingTab} />
				{:else if data.tab === 'web'}
					{#if allResults.length > 0}
						<p class="mb-3 text-xs font-medium text-[var(--app-muted)]">
							Web results{currentPage > 1 ? ` · page ${currentPage}` : ''}
						</p>
						<ResultsList results={allResults} />

						{#if currentPage > 1 || hasMore}
							<nav class="mt-10 flex items-center justify-center gap-2.5" aria-label="Pagination">
								{#if currentPage > 1}
									<button
										type="button"
										aria-label="Previous page"
										onclick={() => goToPage(currentPage - 1)}
										class="flex h-11 items-center justify-center rounded-full bg-[var(--app-surface)] px-5 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
									>
										Prev
									</button>
								{/if}

								{#each pageNumbers as p}
									<button
										type="button"
										aria-label={`Page ${p}`}
										aria-current={p === currentPage ? 'page' : undefined}
										onclick={() => goToPage(p)}
										class={p === currentPage
											? 'flex h-11 w-11 items-center justify-center rounded-full bg-[var(--app-accent)] text-sm font-semibold text-[#111] transition'
											: 'flex h-11 w-11 items-center justify-center rounded-full bg-[var(--app-surface)] text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)]'}
									>
										{p}
									</button>
								{/each}

								{#if canGoNext}
									<button
										type="button"
										aria-label="Next page"
										onclick={() => goToPage(currentPage + 1)}
										class="flex h-11 items-center justify-center rounded-full bg-[var(--app-surface)] px-6 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
									>
										Next
									</button>
								{/if}
							</nav>
						{/if}
					{:else if data.query && !data.error}
						<NoResults query={data.query} tab="web" />
					{:else if !data.query}
						<p class="text-sm text-[var(--app-muted)]">Search for something to begin.</p>
					{/if}
				{:else if data.tab === 'news'}
					{#if data.newsResults && data.newsResults.length > 0}
						<ol class="space-y-2">
							{#each data.newsResults as result}
								<li><NewsResultItem {result} /></li>
							{/each}
						</ol>
					{:else if data.query && !data.error}
						<NoResults query={data.query} tab="news" />
					{/if}
				{:else if data.tab === 'videos'}
					{#if data.videoResults && data.videoResults.length > 0}
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each data.videoResults as result}
								<VideoResultItem {result} onselect={(v) => (activeVideo = v)} />
							{/each}
						</div>
					{:else if data.query && !data.error}
						<NoResults query={data.query} tab="videos" />
					{/if}
				{:else if data.tab === 'images'}
					{#if data.imageResults && data.imageResults.length > 0}
						<ImageGrid images={data.imageResults} />
					{:else if data.query && !data.error}
						<NoResults query={data.query} tab="images" />
					{/if}
				{/if}
			</div>

			<!-- Right column: knowledge panel -->
			{#if data.infobox && data.tab === 'web' && !loading}
				<div class="hidden w-[380px] shrink-0 lg:block">
					<div class="sticky top-[120px]">
						<Infobox infobox={data.infobox} />
					</div>
				</div>
			{/if}
		</div>
	</div>
	{/if}
</main>

<SiteFooter />

{#if activeVideo}
	<VideoViewer video={activeVideo} onclose={() => (activeVideo = null)} />
{/if}
