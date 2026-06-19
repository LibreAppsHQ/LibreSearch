<script lang="ts">
	import { detectStockTerm } from '$lib/stock';

	type StockPoint = { t: number; c: number };
	type StockQuote = {
		symbol: string;
		name: string;
		exchange: string;
		currency: string;
		price: number;
		change: number;
		changePercent: number;
		open: number;
		high: number;
		low: number;
		prevClose: number;
		range: 'month' | 'year' | '5y';
		points: StockPoint[];
	};

	let { query }: { query: string } = $props();

	type Range = 'month' | 'year' | '5y';
	const RANGES: { key: Range; label: string }[] = [
		{ key: 'month', label: 'Month' },
		{ key: 'year', label: 'Year' },
		{ key: '5y', label: '5 years' }
	];

	let range = $state<Range>('month');
	let quote = $state<StockQuote | null>(null);
	let loading = $state(false);

	// Only worth a request when the query actually looks like a stock lookup.
	let match = $derived(detectStockTerm(query));

	function formatPrice(n: number): string {
		return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	const CURRENCY_SYMBOL: Record<string, string> = {
		USD: '$',
		EUR: '€',
		GBP: '£',
		JPY: '¥',
		CAD: '$',
		AUD: '$',
		CHF: '',
		CNY: '¥'
	};
	let symbolPrefix = $derived(quote ? (CURRENCY_SYMBOL[quote.currency] ?? '') : '');
	let up = $derived((quote?.change ?? 0) >= 0);

	// Re-fetch whenever the detected term or selected range changes. A new term
	// resets to the month view so a fresh search doesn't keep a stale range.
	$effect(() => {
		const t = match;
		const r = range;
		if (!t) {
			quote = null;
			loading = false;
			return;
		}

		loading = true;
		const controller = new AbortController();
		fetch(`/api/stock?q=${encodeURIComponent(query)}&range=${r}`, { signal: controller.signal })
			.then((res) => (res.ok ? res.json() : { quote: null }))
			.then((data: { quote: StockQuote | null }) => {
				quote = data.quote;
			})
			.catch(() => {
				quote = null;
			})
			.finally(() => {
				loading = false;
			});

		return () => controller.abort();
	});

	// ── Chart geometry ────────────────────────────────────────────────
	const W = 560;
	const H = 200;
	const PAD_R = 4;

	let chart = $derived.by(() => {
		const pts = quote?.points ?? [];
		if (pts.length < 2) return null;
		const values = pts.map((p) => p.c);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = max - min || 1;
		const stepX = (W - PAD_R) / (pts.length - 1);
		const y = (v: number) => H - ((v - min) / span) * H;

		const coords = pts.map((p, i) => ({ x: i * stepX, y: y(p.c) }));
		const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
		const area = `${line} L${coords[coords.length - 1].x},${H} L0,${H} Z`;

		// Five evenly spaced axis labels, top to bottom.
		const ticks = Array.from({ length: 5 }, (_, i) => {
			const value = max - (span * i) / 4;
			return { value, y: (H * i) / 4 };
		});

		return { line, area, ticks };
	});
</script>

{#if match && (loading || quote)}
	<section
		class="mb-6 max-w-2xl overflow-hidden rounded-sm border border-(--app-border) bg-(--app-surface)"
		aria-label="Stock quote"
	>
		{#if loading && !quote}
			<div class="p-5">
				<div class="flex items-center gap-2 text-sm text-(--app-muted)">
					<i class="fa-solid fa-circle-notch fa-spin"></i>
					<span>Loading stock data…</span>
				</div>
				<div class="mt-3 h-9 w-40 animate-pulse rounded bg-(--app-hover)"></div>
				<div class="mt-4 h-40 w-full animate-pulse rounded bg-(--app-hover)"></div>
			</div>
		{:else if quote}
			<div class="p-5">
				<!-- Header: company · exchange · ticker badge -->
				<div class="flex items-start justify-between gap-3">
					<span class="text-base font-medium text-(--app-text)">{quote.name}</span>
					{#if quote.exchange}
						<span class="hidden flex-1 truncate text-center text-sm text-(--app-muted) sm:block"
							>{quote.exchange}</span
						>
					{/if}
					<span
						class="shrink-0 rounded-lg border border-(--app-border) px-2.5 py-1 font-mono text-sm text-(--app-button)"
						>{quote.symbol}</span
					>
				</div>

				<!-- Price -->
				<div class="mt-3 flex items-baseline gap-2">
					<span class="text-4xl font-bold text-(--app-text) tabular-nums"
						>{symbolPrefix}{formatPrice(quote.price)}</span
					>
					<span class="text-2xl text-(--app-muted)">{quote.currency}</span>
				</div>
				<div
					class="mt-1 flex items-center gap-1.5 text-sm font-medium tabular-nums {up
						? 'text-emerald-400'
						: 'text-red-400'}"
				>
					<span>{up ? '+' : ''}{formatPrice(quote.change)}</span>
					<span>({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
					<i class={up ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'}></i>
				</div>

				<!-- Range toggle -->
				<div class="mt-4 flex gap-2">
					{#each RANGES as r (r.key)}
						<button
							type="button"
							onclick={() => (range = r.key)}
							class={range === r.key
								? 'rounded-lg bg-(--app-accent) px-3 py-1.5 text-sm font-semibold text-[#111]'
								: 'rounded-lg bg-(--app-hover) px-3 py-1.5 text-sm font-medium text-(--app-button) transition hover:opacity-90'}
						>
							{r.label}
						</button>
					{/each}
				</div>

				<!-- Chart -->
				<div class="relative mt-5 pr-8">
					{#if chart}
						<svg
							viewBox="0 0 {W} {H}"
							class="h-48 w-full overflow-visible"
							preserveAspectRatio="none"
							role="img"
							aria-label="{quote.name} price chart"
						>
							<defs>
								<linearGradient id="stock-fill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stop-color="var(--app-accent)" stop-opacity="0.18" />
									<stop offset="100%" stop-color="var(--app-accent)" stop-opacity="0" />
								</linearGradient>
							</defs>
							{#each chart.ticks as tick, i (i)}
								<line
									x1="0"
									x2={W}
									y1={tick.y}
									y2={tick.y}
									stroke="var(--app-border)"
									stroke-width="1"
									vector-effect="non-scaling-stroke"
								/>
							{/each}
							<path d={chart.area} fill="url(#stock-fill)" />
							<path
								d={chart.line}
								fill="none"
								stroke="var(--app-accent)"
								stroke-width="2"
								stroke-linejoin="round"
								stroke-linecap="round"
								vector-effect="non-scaling-stroke"
							/>
						</svg>
						<!-- Right-side axis labels -->
						<div class="absolute top-0 right-0 flex h-48 flex-col justify-between">
							{#each chart.ticks as tick, i (i)}
								<span class="text-[11px] text-(--app-muted) tabular-nums"
									>{tick.value.toFixed(tick.value < 10 ? 2 : 0)}</span
								>
							{/each}
						</div>
					{:else}
						<div
							class="flex h-48 items-center justify-center rounded-xl bg-(--app-hover)/40 text-sm text-(--app-muted)"
						>
							Price history unavailable
						</div>
					{/if}
				</div>

				<!-- Stats + attribution -->
				<div class="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:max-w-md">
					<div class="flex justify-between gap-4">
						<span class="text-(--app-muted)">Open</span>
						<span class="text-(--app-text) tabular-nums">{formatPrice(quote.open)}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-(--app-muted)">High</span>
						<span class="text-(--app-text) tabular-nums">{formatPrice(quote.high)}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-(--app-muted)">Prev close</span>
						<span class="text-(--app-text) tabular-nums">{formatPrice(quote.prevClose)}</span>
					</div>
					<div class="flex justify-between gap-4">
						<span class="text-(--app-muted)">Low</span>
						<span class="text-(--app-text) tabular-nums">{formatPrice(quote.low)}</span>
					</div>
				</div>
				<p class="mt-4 text-right text-xs text-(--app-muted)">
					Data provided by
					<a
						href="https://finnhub.io"
						target="_blank"
						rel="noopener noreferrer"
						class="text-(--app-secondary) hover:underline">Finnhub.io</a
					>
				</p>
			</div>
		{/if}
	</section>
{/if}
