<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type CheckStatus = 'pending' | 'ok' | 'degraded' | 'down';

	type Check = {
		id: string;
		name: string;
		desc: string;
		url: string;
		status: CheckStatus;
		latencyMs: number | null;
	};

	let checks = $state<Check[]>([
		{
			id: 'app',
			name: 'Web application',
			desc: 'The frontend that you are looking at right now.',
			url: '/api/health',
			status: 'pending',
			latencyMs: null
		},
		{
			id: 'ip',
			name: 'IP lookup',
			desc: 'Powers the "what is my IP" instant answer.',
			url: '/api/ip',
			status: 'pending',
			latencyMs: null
		},
		{
			id: 'static',
			name: 'Static assets',
			desc: 'Icons, fonts, and images served from the CDN.',
			url: '/favicon.svg',
			status: 'pending',
			latencyMs: null
		}
	]);

	let lastCheckedAt = $state<number | null>(null);
	let checking = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function classify(ok: boolean, latencyMs: number): CheckStatus {
		if (!ok) return 'down';
		if (latencyMs > 1500) return 'degraded';
		return 'ok';
	}

	async function ping(url: string): Promise<{ ok: boolean; latencyMs: number }> {
		const start = performance.now();
		try {
			const r = await fetch(url, { cache: 'no-store' });
			return { ok: r.ok, latencyMs: Math.round(performance.now() - start) };
		} catch {
			return { ok: false, latencyMs: Math.round(performance.now() - start) };
		}
	}

	async function runChecks() {
		if (checking) return;
		checking = true;
		const results = await Promise.all(
			checks.map(async (c) => {
				const { ok, latencyMs } = await ping(c.url);
				return { ...c, status: classify(ok, latencyMs), latencyMs };
			})
		);
		checks = results;
		lastCheckedAt = Date.now();
		checking = false;
	}

	let overall = $derived<CheckStatus>(
		checks.some((c) => c.status === 'down')
			? 'down'
			: checks.some((c) => c.status === 'degraded')
				? 'degraded'
				: checks.every((c) => c.status === 'ok')
					? 'ok'
					: 'pending'
	);

	let overallCopy = $derived(
		overall === 'ok'
			? { title: 'All systems operational', tone: 'emerald', icon: 'fa-circle-check' }
			: overall === 'degraded'
				? { title: 'Degraded performance', tone: 'amber', icon: 'fa-triangle-exclamation' }
				: overall === 'down'
					? { title: 'Partial outage', tone: 'rose', icon: 'fa-triangle-exclamation' }
					: { title: 'Checking…', tone: 'sky', icon: 'fa-circle-notch' }
	);

	const toneClasses: Record<string, { bar: string; text: string; bg: string; ring: string }> = {
		emerald: {
			bar: 'bg-emerald-500',
			text: 'text-emerald-400',
			bg: 'bg-emerald-500/10',
			ring: 'ring-emerald-500/30'
		},
		amber: {
			bar: 'bg-amber-500',
			text: 'text-amber-400',
			bg: 'bg-amber-500/10',
			ring: 'ring-amber-500/30'
		},
		rose: {
			bar: 'bg-rose-500',
			text: 'text-rose-400',
			bg: 'bg-rose-500/10',
			ring: 'ring-rose-500/30'
		},
		sky: {
			bar: 'bg-sky-500',
			text: 'text-sky-400',
			bg: 'bg-sky-500/10',
			ring: 'ring-sky-500/30'
		}
	};

	function checkTone(s: CheckStatus): string {
		if (s === 'ok') return 'emerald';
		if (s === 'degraded') return 'amber';
		if (s === 'down') return 'rose';
		return 'sky';
	}

	function checkLabel(s: CheckStatus): string {
		if (s === 'ok') return 'Operational';
		if (s === 'degraded') return 'Degraded';
		if (s === 'down') return 'Down';
		return 'Checking';
	}

	function formatRelative(ts: number | null): string {
		if (ts === null) return 'never';
		const sec = Math.floor((Date.now() - ts) / 1000);
		if (sec < 5) return 'just now';
		if (sec < 60) return `${sec}s ago`;
		const min = Math.floor(sec / 60);
		if (min < 60) return `${min} min ago`;
		return new Date(ts).toLocaleTimeString();
	}

	let nowTick = $state(0);

	onMount(() => {
		runChecks();
		// Auto-refresh every 60s; tick a counter every 5s so the relative
		// timestamp re-renders.
		intervalId = setInterval(() => {
			nowTick++;
			if (nowTick % 12 === 0) runChecks();
		}, 5000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	// Re-derive last-checked label every time nowTick changes (every 5s).
	let lastCheckedLabel = $derived.by(() => {
		void nowTick;
		return formatRelative(lastCheckedAt);
	});
</script>

<svelte:head>
	<title>System Status - LibreSearch</title>
	<meta
		name="description"
		content="Live status of the LibreSearch web application, API, and static asset delivery. Updated automatically."
	/>
	<link rel="canonical" href="https://libresearch.ca/status" />
	<meta property="og:title" content="System Status - LibreSearch" />
	<meta
		property="og:description"
		content="Real-time health of LibreSearch services."
	/>
	<meta property="og:url" content="https://libresearch.ca/status" />
</svelte:head>

<header class="sticky top-0 z-20 bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-[var(--app-text)]">
				Status
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-[var(--app-background)] text-[var(--app-text)]">
	<section class="mx-auto w-full max-w-[900px] px-6 py-12 sm:py-16">
		<!-- Overall banner -->
		<div
			class="flex flex-col items-start gap-4 rounded-2xl border p-6 ring-1 sm:flex-row sm:items-center sm:justify-between {toneClasses[
				overallCopy.tone
			].bg} {toneClasses[overallCopy.tone].ring} border-[var(--app-border)]"
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl {toneClasses[
						overallCopy.tone
					].bg} {toneClasses[overallCopy.tone].text}"
				>
					<i
						class="fa-solid {overallCopy.icon} text-xl {overall === 'pending'
							? 'fa-spin'
							: ''}"
					></i>
				</div>
				<div>
					<h1 class="text-xl font-bold tracking-tight">{overallCopy.title}</h1>
					<p class="mt-1 text-xs text-[var(--app-muted)]">
						Last checked {lastCheckedLabel} · auto-refresh every 60s
					</p>
				</div>
			</div>
			<button
				type="button"
				onclick={runChecks}
				disabled={checking}
				class="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-xs text-[var(--app-text)] transition hover:bg-[var(--app-hover)] disabled:opacity-60"
			>
				<i class="fa-solid fa-rotate {checking ? 'fa-spin' : ''}"></i>
				{checking ? 'Checking' : 'Refresh now'}
			</button>
		</div>

		<!-- Per-service rows -->
		<div
			class="mt-8 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]"
		>
			{#each checks as c, i}
				<div
					class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between {i > 0
						? 'border-t border-[var(--app-border)]'
						: ''}"
				>
					<div class="flex items-center gap-4">
						<span
							class="inline-flex h-3 w-3 shrink-0 rounded-full {toneClasses[checkTone(c.status)]
								.bar}"
							class:animate-pulse={c.status === 'pending'}
						></span>
						<div>
							<p class="text-base font-semibold text-[var(--app-text)]">{c.name}</p>
							<p class="mt-0.5 text-xs leading-5 text-[var(--app-muted)]">{c.desc}</p>
						</div>
					</div>
					<div class="flex items-center gap-4 pl-7 sm:pl-0">
						{#if c.latencyMs !== null}
							<span class="font-mono text-xs text-[var(--app-muted)] tabular-nums">
								{c.latencyMs} ms
							</span>
						{/if}
						<span
							class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase {toneClasses[
								checkTone(c.status)
							].bg} {toneClasses[checkTone(c.status)].text}"
						>
							{checkLabel(c.status)}
						</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- Notes -->
		<div class="mt-10 grid gap-4 sm:grid-cols-2">
			<div
				class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-sm leading-6 text-[var(--app-muted)]"
			>
				<div class="mb-2 flex items-center gap-2 text-[var(--app-text)]">
					<i class="fa-solid fa-circle-info text-[var(--app-accent)]"></i>
					<span class="font-semibold">About these checks</span>
				</div>
				<p>
					Each check is a live HTTP request from your browser to the listed endpoint. Latency
					reflects what you experience, not a server-side average. Endpoints over 1.5s are flagged
					degraded.
				</p>
			</div>
			<div
				class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-sm leading-6 text-[var(--app-muted)]"
			>
				<div class="mb-2 flex items-center gap-2 text-[var(--app-text)]">
					<i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
					<span class="font-semibold">Report an incident</span>
				</div>
				<p>
					Seeing red and we haven't said anything? File a quick note on the
					<a
						href="https://github.com/Arcbasehq/LibreSearch/issues"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[var(--app-accent)] hover:underline">GitHub issues</a
					>
					tracker or via <a href="/contact" class="text-[var(--app-accent)] hover:underline">/contact</a>.
				</p>
			</div>
		</div>

		<p class="mt-8 text-xs text-[var(--app-muted)]">
			Historic uptime data isn't tracked here yet. A dedicated status host (e.g.
			status.libresearch.ca) is on the roadmap.
		</p>
	</section>

	<SiteFooter />
</main>
