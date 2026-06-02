<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	type State = 'solving' | 'verifying' | 'done' | 'error';
	let state = $state<State>('solving');

	interface Challenge {
		algorithm: string;
		challenge: string;
		salt: string;
		signature: string;
		maxnumber: number;
	}

	async function sha256Hex(input: string): Promise<string> {
		const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
		return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	async function solve(c: Challenge): Promise<number | null> {
		for (let n = 0; n <= c.maxnumber; n++) {
			if ((await sha256Hex(c.salt + n)) === c.challenge) return n;
			// Yield to the event loop periodically so the UI stays responsive.
			if (n % 1000 === 0) await new Promise((r) => setTimeout(r, 0));
		}
		return null;
	}

	async function run() {
		state = 'solving';
		try {
			const c: Challenge = await fetch('/api/altcha/challenge', { cache: 'no-store' }).then((r) =>
				r.json()
			);
			const number = await solve(c);
			if (number === null) throw new Error('No solution');

			state = 'verifying';
			const payload = btoa(
				JSON.stringify({
					algorithm: c.algorithm,
					challenge: c.challenge,
					number,
					salt: c.salt,
					signature: c.signature
				})
			);

			const res = await fetch('/api/altcha/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ payload })
			});
			if (!res.ok) throw new Error('Verification failed');

			state = 'done';
			// Re-run the page load — the server now sees us as verified.
			await invalidateAll();
		} catch {
			state = 'error';
		}
	}

	onMount(run);
</script>

<div class="mx-auto flex max-w-md flex-col items-center py-16 text-center">
	<div
		class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--app-accent)/15 text-(--app-accent)"
	>
		<i class="fa-solid fa-shield-halved text-2xl"></i>
	</div>

	<h1 class="text-xl font-semibold text-(--app-text)">Quick security check</h1>
	<p class="mt-2 text-sm leading-6 text-(--app-muted)">
		We noticed unusual activity from your connection. Your browser is solving a quick puzzle to
		confirm you're human — no clicks, no tracking, and nothing leaves your device.
	</p>

	<div
		class="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-4"
	>
		{#if state === 'solving'}
			<i class="fa-solid fa-spinner fa-spin text-(--app-accent)"></i>
			<span class="text-sm text-(--app-text)">Verifying you're human…</span>
		{:else if state === 'verifying'}
			<i class="fa-solid fa-spinner fa-spin text-(--app-accent)"></i>
			<span class="text-sm text-(--app-text)">Confirming…</span>
		{:else if state === 'done'}
			<i class="fa-solid fa-circle-check text-emerald-400"></i>
			<span class="text-sm text-(--app-text)">Verified — loading your results…</span>
		{:else}
			<i class="fa-solid fa-triangle-exclamation text-rose-400"></i>
			<span class="text-sm text-(--app-text)">Verification failed.</span>
			<button
				type="button"
				onclick={run}
				class="ml-2 rounded-lg bg-(--app-accent) px-3 py-1 text-xs font-semibold text-[#111111] transition hover:opacity-90"
			>
				Try again
			</button>
		{/if}
	</div>

	<p class="mt-4 text-xs text-(--app-muted)">
		Protected by ALTCHA · privacy-friendly, no CAPTCHA images
	</p>
</div>
