<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SearchSkeleton from '$lib/components/SearchSkeleton.svelte';
	import NoResults from '$lib/components/NoResults.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import ResultsList from '$lib/components/ResultsList.svelte';
	import InstantAnswer from '$lib/components/InstantAnswer.svelte';
	import SearchTabs from '$lib/components/SearchTabs.svelte';
	import Infobox from '$lib/components/Infobox.svelte';
	import NewsResultItem from '$lib/components/NewsResultItem.svelte';
	import VideoResultItem from '$lib/components/VideoResultItem.svelte';
	import VideoViewer from '$lib/components/VideoViewer.svelte';
	import ImageGrid from '$lib/components/ImageGrid.svelte';
	import ImageRelated from '$lib/components/ImageRelated.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import BurnButton from '$lib/components/BurnButton.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import AltchaChallenge from '$lib/components/AltchaChallenge.svelte';
	import { settingsStore, getToggle, getSelect } from '$lib/stores/settings';
	import { historyStore } from '$lib/stores/history';
	import type { VideoResult } from '$lib/search';

	import { browser } from '$app/environment';
	import type { PageData, ActionData } from './$types';

	let { data: loadData, form } = $props<{ data: PageData; form: ActionData }>();

	// POST searches keep the query out of the URL, so the browser can't restore
	// the results page when the user navigates back from a result. We cache the
	// last rendered search in sessionStorage and re-hydrate it on a blank load.
	const SEARCH_CACHE_KEY = 'lp:lastSearch';
	let restored = $state<PageData | null>(null);

	// `form` = a fresh POST result, `loadData` = a GET load. When both are blank
	// (a POST back-navigation), fall back to the cached search.
	let base = $derived(form ?? loadData);
	let data = $derived(base.query ? base : (restored ?? base));

	let query = $state('');
	let allResults = $state(data.results);
	let hasMore = $state(data.results.length >= (data.count ?? 10));
	let activeVideo = $state<VideoResult | null>(null);

	$effect(() => {
		// Don't clobber what the user is actively typing in the search box.
		const input = typeof document !== 'undefined' ? document.activeElement : null;
		const typing = input instanceof HTMLInputElement && input.name === 'q';
		if (!typing) query = data.query;
		allResults = data.results;
		hasMore = data.tab === 'web' && data.results.length >= (data.count ?? 10);
	});

	// Persist the live search so a POST back-navigation can restore it.
	$effect(() => {
		if (!browser || !data.query) return;
		try {
			sessionStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(data));
		} catch {
			// sessionStorage may be unavailable (private mode / quota) — ignore.
		}
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

	let safesearch = $derived(
		getSelect($settingsStore, 'safe-search', 'moderate') as 'strict' | 'moderate' | 'low'
	);
	let instantAnswers = $derived(getToggle($settingsStore, 'instant-answers', true));

	// Show skeletons while a search navigation is in flight so stale results
	// aren't left frozen on screen during the server round-trip.
	let loading = $derived(
		navigating.to?.url.pathname === '/search' && !!navigating.to?.url.searchParams.get('q')
	);
	let loadingTab = $derived((navigating.to?.url.searchParams.get('t') as typeof data.tab) || 'web');

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
		{ label: 'Safe Search: Strict', value: 'strict' },
		{ label: 'Safe Search: Moderate', value: 'moderate' },
		{ label: 'Safe Search: Off', value: 'low' }
	];

	function buildUrl(overrides: Record<string, string | undefined>): string {
		const params = new URLSearchParams({ q: data.query });
		if (data.tab !== 'web') params.set('t', data.tab);
		if (data.freshness) params.set('f', data.freshness);
		if (data.safe !== 'moderate') params.set('safe', data.safe);
		if (data.region) params.set('region', data.region);
		for (const [k, v] of Object.entries(overrides)) {
			if (v === undefined || v === '') params.delete(k);
			else params.set(k, v);
		}
		return `/search?${params}`;
	}

	let requestMethod = $derived(getSelect($settingsStore, 'request-method', 'GET'));

	// Submit a navigation as a POST form so the query never lands in the URL.
	function submitPost(params: URLSearchParams) {
		const formEl = document.createElement('form');
		formEl.method = 'POST';
		formEl.action = '/search';
		for (const [k, v] of params) {
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = k;
			input.value = v;
			formEl.appendChild(input);
		}
		document.body.appendChild(formEl);
		formEl.submit();
	}

	// Filters, pagination, and tab switches reuse the same param set as `buildUrl`.
	// In GET mode we navigate to that URL; in POST mode we re-submit it as a form.
	function navigate(overrides: Record<string, string | undefined>) {
		const url = buildUrl(overrides);
		if (requestMethod === 'POST') {
			submitPost(new URLSearchParams(url.split('?')[1] ?? ''));
		} else {
			void goto(url);
		}
	}

	onMount(() => {
		// Blank load (e.g. back from a result in POST mode): re-hydrate the last search.
		if (!base.query) {
			try {
				const raw = sessionStorage.getItem(SEARCH_CACHE_KEY);
				if (raw) restored = JSON.parse(raw) as PageData;
			} catch {
				// ignore malformed / unavailable storage
			}
		}

		const input = document.querySelector<HTMLInputElement>('input[name="q"]');
		input?.focus();
		input?.setSelectionRange(query.length, query.length);
		if (data.query && getToggle($settingsStore, 'save-history')) historyStore.add(data.query);
	});

	function goToPage(p: number) {
		navigate({ p: p > 1 ? String(p) : undefined });
		if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>{data.query ? `${data.query} - LibreSearch` : 'LibreSearch'}</title>
	<meta name="robots" content="noindex, noarchive, nofollow" />
</svelte:head>

<main class="min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
	<!-- Sticky header -->
	<header
		class="sticky top-0 z-20 border-b border-[var(--app-border)] bg-[var(--app-background)]/95 backdrop-blur"
	>
		<div class="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
			<div class="flex items-center gap-4 py-3 sm:gap-6">
				<a href="/" class="hidden shrink-0 sm:block">
					<Logo class="h-10 w-auto" />
				</a>
				<div class="min-w-0 flex-1">
					<div class="max-w-3xl">
						<SearchBar
							bind:query
							compact={true}
							placeholder="Search the web..."
							action="/search"
							showButton={true}
							{safesearch}
						/>
					</div>
				</div>
				<a
					href="/privacy"
					class="hidden shrink-0 items-center gap-2 rounded-full bg-[var(--app-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--app-secondary)] transition hover:opacity-90 md:inline-flex"
				>
					<i class="fa-solid fa-shield-halved text-emerald-400"></i>
					Private Search
				</a>
				<BurnButton class="shrink-0" />
				<SiteMenu class="shrink-0" />
			</div>

			<!-- Tabs row, aligned under the search bar -->
			<div class="flex gap-4 sm:gap-6">
				<div class="hidden w-25 shrink-0 sm:block"></div>
				<div
					class="min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden"
				>
					<SearchTabs current={data.tab} query={data.query} freshness={data.freshness} />
				</div>
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
						onchange={(val) => navigate({ region: val || undefined })}
					/>
					<CustomSelect
						value={data.safe}
						options={safeOptions}
						onchange={(val) => navigate({ safe: val === 'moderate' ? undefined : val })}
					/>
					{#if data.tab !== 'images' && data.tab !== 'maps'}
						<CustomSelect
							value={data.freshness ?? ''}
							options={timeOptions}
							onchange={(val) => navigate({ f: val || undefined })}
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
					<button
						type="button"
						onclick={() => navigate({ f: undefined })}
						class="text-[var(--app-accent)] hover:underline">Clear</button
					>
				</p>
			{/if}

			<!-- Two-column grid: left = results, right = infobox (web tab only) -->
			<div class={data.infobox && data.tab === 'web' && !loading ? 'flex gap-8' : ''}>
				<!-- Left / main column -->
				<div
					class={loading
						? loadingTab === 'images' || loadingTab === 'videos' || loadingTab === 'maps'
							? 'w-full'
							: 'max-w-2xl'
						: data.infobox && data.tab === 'web'
							? 'max-w-2xl min-w-0 flex-1'
							: data.tab === 'images' || data.tab === 'videos' || data.tab === 'maps'
								? 'w-full'
								: 'max-w-2xl'}
				>
					{#if loading}
						<SearchSkeleton tab={loadingTab} />
					{:else if data.tab === 'web'}
						{#if instantAnswers}
							<InstantAnswer query={data.query} />
						{/if}
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
							<ImageRelated query={data.query} />
							<ImageGrid images={data.imageResults} />
						{:else if data.query && !data.error}
							<NoResults query={data.query} tab="images" />
						{/if}
					{:else if data.tab === 'shopping'}
						{#if allResults.length > 0}
							<p class="mb-3 text-xs font-medium text-[var(--app-muted)]">Shopping results</p>
							<ResultsList results={allResults} />
						{:else if data.query && !data.error}
							<NoResults query={data.query} tab="shopping" />
						{/if}
					{:else if data.tab === 'maps'}
						{#if data.placeResults && data.placeResults.length > 0}
							<MapView places={data.placeResults} />
						{:else if data.query && !data.error}
							<NoResults query={data.query} tab="maps" />
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
