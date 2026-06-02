<script lang="ts">
	import { onMount } from 'svelte';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Risk = 'high' | 'medium' | 'low';
	interface Item {
		label: string;
		value: string;
		risk: Risk;
		note: string;
	}

	let items = $state<Item[]>([]);
	let ip = $state('…');
	let canvasHash = $state('…');
	let scored = $state(false);
	let highCount = $state(0);

	function n(v: unknown): string {
		if (v === undefined || v === null || v === '') return 'unavailable';
		return String(v);
	}

	async function sha256Short(input: string): Promise<string> {
		const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
		return [...new Uint8Array(buf)]
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
			.slice(0, 16);
	}

	function canvasFingerprint(): string {
		try {
			const c = document.createElement('canvas');
			c.width = 240;
			c.height = 60;
			const ctx = c.getContext('2d');
			if (!ctx) return '';
			ctx.textBaseline = 'top';
			ctx.font = "16px 'Arial'";
			ctx.fillStyle = '#f60';
			ctx.fillRect(0, 0, 240, 60);
			ctx.fillStyle = '#069';
			ctx.fillText('LibreSearch fingerprint 🔒', 4, 8);
			ctx.fillStyle = 'rgba(102,204,0,0.7)';
			ctx.fillText('LibreSearch fingerprint 🔒', 6, 10);
			return c.toDataURL();
		} catch {
			return '';
		}
	}

	function webgl(): { vendor: string; renderer: string } {
		try {
			const c = document.createElement('canvas');
			const gl = (c.getContext('webgl') ||
				c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
			if (!gl) return { vendor: '', renderer: '' };
			const dbg = gl.getExtension('WEBGL_debug_renderer_info');
			if (!dbg) return { vendor: '', renderer: '' };
			return {
				vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) as string,
				renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string
			};
		} catch {
			return { vendor: '', renderer: '' };
		}
	}

	onMount(async () => {
		const nav = navigator as Navigator & {
			deviceMemory?: number;
			globalPrivacyControl?: boolean;
			connection?: { effectiveType?: string };
		};

		const gl = webgl();
		const raw = canvasFingerprint();
		canvasHash = raw ? await sha256Short(raw) : 'blocked';

		const dnt =
			nav.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1';
		const gpc = nav.globalPrivacyControl === true;

		const list: Item[] = [
			{
				label: 'User agent',
				value: n(nav.userAgent),
				risk: 'high',
				note: 'Browser, version, OS and engine — a strong identifier on its own.'
			},
			{
				label: 'Platform',
				value: n(nav.platform),
				risk: 'medium',
				note: 'Your operating-system family.'
			},
			{
				label: 'Languages',
				value: n(nav.languages?.join(', ')),
				risk: 'medium',
				note: 'Preferred languages hint at your region.'
			},
			{
				label: 'Timezone',
				value: n(Intl.DateTimeFormat().resolvedOptions().timeZone),
				risk: 'high',
				note: 'Narrows you to a geographic area regardless of IP.'
			},
			{
				label: 'Screen',
				value: `${screen.width}×${screen.height} @ ${window.devicePixelRatio}x, ${screen.colorDepth}-bit`,
				risk: 'high',
				note: 'Resolution + pixel ratio + color depth combine into a distinctive value.'
			},
			{
				label: 'Viewport',
				value: `${window.innerWidth}×${window.innerHeight}`,
				risk: 'low',
				note: 'Window size — changes as you resize, so weaker on its own.'
			},
			{
				label: 'CPU cores',
				value: n(nav.hardwareConcurrency),
				risk: 'medium',
				note: 'Logical processor count.'
			},
			{
				label: 'Device memory',
				value: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'unavailable',
				risk: 'low',
				note: 'Approximate RAM, rounded by the browser.'
			},
			{
				label: 'Touch points',
				value: n(nav.maxTouchPoints),
				risk: 'low',
				note: 'Distinguishes touch devices from desktops.'
			},
			{
				label: 'Connection',
				value: n(nav.connection?.effectiveType),
				risk: 'low',
				note: 'Rough network speed class.'
			},
			{
				label: 'GPU vendor',
				value: n(gl.vendor),
				risk: 'high',
				note: 'WebGL exposes your graphics hardware — highly identifying.'
			},
			{
				label: 'GPU renderer',
				value: n(gl.renderer),
				risk: 'high',
				note: 'Exact GPU model string via WebGL.'
			},
			{
				label: 'Canvas fingerprint',
				value: canvasHash,
				risk: 'high',
				note: 'How your device renders text/graphics produces a stable hash used to track you.'
			},
			{
				label: 'Cookies enabled',
				value: n(nav.cookieEnabled),
				risk: 'low',
				note: 'Whether sites can store cookies.'
			},
			{
				label: 'Do Not Track',
				value: dnt ? 'on' : 'off / not set',
				risk: 'low',
				note: 'A request sites are free to ignore — and most do.'
			},
			{
				label: 'Global Privacy Control',
				value: gpc ? 'on' : 'off / not set',
				risk: 'low',
				note: 'A legally-recognized opt-out signal in some regions.'
			}
		];

		items = list;
		highCount = list.filter((i) => i.risk === 'high').length;
		scored = true;

		try {
			const r = await fetch('/api/ip', { cache: 'no-store' });
			const d = (await r.json()) as { ip?: string };
			ip = d.ip || 'hidden';
		} catch {
			ip = 'hidden';
		}
	});

	const riskClass: Record<Risk, string> = {
		high: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
		medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
		low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
	};
</script>

<svelte:head>
	<title>Browser Leak Test — What Your Browser Reveals | LibreSearch</title>
	<meta
		name="description"
		content="See what your browser leaks: user agent, screen, GPU, timezone, canvas fingerprint and more. Runs entirely in your browser — nothing is logged or stored."
	/>
	<link rel="canonical" href="https://libresearch.ca/fingerprint" />
	<meta property="og:title" content="Browser Leak Test | LibreSearch" />
	<meta
		property="og:description"
		content="What does your browser reveal about you? A private, in-browser fingerprint report."
	/>
	<meta property="og:url" content="https://libresearch.ca/fingerprint" />
</svelte:head>

<header class="sticky top-0 z-20 bg-(--app-background)">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-(--app-text)">
				Browser Leak Test
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-(--app-background) text-(--app-text)">
	<section class="mx-auto w-full max-w-[1100px] px-6 pt-12 pb-8 text-center sm:pt-20">
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
			What your browser leaks
		</h1>
		<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-(--app-muted) sm:text-lg">
			Every site you visit can read the signals below without permission. Combined, they form a
			“fingerprint” that can re-identify you even without cookies. This report runs entirely in your
			browser — nothing here is sent to us or stored.
		</p>
	</section>

	<section class="mx-auto w-full max-w-[1100px] px-6 pb-20">
		<!-- Summary -->
		<div
			class="mb-8 flex flex-col gap-4 rounded-2xl border border-(--app-border) bg-[#171b25]/80 p-6 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<p class="text-sm font-semibold tracking-wider text-(--app-muted) uppercase">Your IP</p>
				<p class="mt-1 font-mono text-lg text-(--app-text)">{ip}</p>
				<p class="mt-1 text-xs text-(--app-muted)">
					Looked up via our own endpoint — not logged. A VPN or Tor hides this.
				</p>
			</div>
			<div class="sm:text-right">
				<p class="text-sm font-semibold tracking-wider text-(--app-muted) uppercase">
					Strong signals
				</p>
				<p class="mt-1 text-lg text-(--app-text)">
					{#if scored}{highCount} high-risk traits exposed{:else}scanning…{/if}
				</p>
				<p class="mt-1 text-xs text-(--app-muted)">
					More distinctive traits = easier to track across sites.
				</p>
			</div>
		</div>

		<!-- Table -->
		<div class="overflow-hidden rounded-2xl border border-(--app-border)">
			{#each items as item (item.label)}
				<div
					class="flex flex-col gap-2 border-b border-(--app-border) bg-(--app-surface) p-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-4"
				>
					<div class="flex items-center gap-3 sm:w-48 sm:shrink-0">
						<span
							class="rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase {riskClass[
								item.risk
							]}"
						>
							{item.risk}
						</span>
						<span class="text-sm font-semibold text-(--app-text)">{item.label}</span>
					</div>
					<div class="min-w-0 flex-1">
						<p class="font-mono text-sm break-words text-(--app-text)">{item.value}</p>
						<p class="mt-1 text-xs leading-5 text-(--app-muted)">{item.note}</p>
					</div>
				</div>
			{:else}
				<div class="bg-(--app-surface) p-8 text-center text-sm text-(--app-muted)">
					Reading your browser signals…
				</div>
			{/each}
		</div>

		<!-- Defenses -->
		<div class="mt-8 rounded-2xl border border-(--app-border) bg-[#171b25]/60 p-6">
			<h2 class="mb-3 text-sm font-semibold tracking-wider text-(--app-muted) uppercase">
				How to leak less
			</h2>
			<ul class="space-y-2 text-sm leading-6 text-(--app-muted)">
				<li>
					<span class="text-(--app-text)">Use a privacy-hardened browser</span> — Tor Browser or
					Firefox with resist-fingerprinting normalise most of these values.
				</li>
				<li>
					<span class="text-(--app-text)">Hide your IP</span> — a VPN or Tor replaces the address shown
					above.
				</li>
				<li>
					<span class="text-(--app-text)">Search without being profiled</span> —
					<a href="/" class="text-(--app-accent) hover:underline">LibreSearch</a> never logs your queries
					or builds a profile in the first place.
				</li>
			</ul>
		</div>
	</section>
</main>

<SiteFooter />
