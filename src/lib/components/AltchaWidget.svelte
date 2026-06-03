<script lang="ts">
	// Inline, checkbox-style ALTCHA widget for forms.
	// Fetches a server-signed proof-of-work challenge, solves it in the browser,
	// confirms with the server, and flips `verified` to true. No third party,
	// no tracking, nothing leaves the device beyond the solved challenge.

	type State = 'idle' | 'solving' | 'verifying' | 'done' | 'error';

	// eslint-disable-next-line no-useless-assignment -- write-only bindable prop default
	let { verified = $bindable(false) }: { verified?: boolean } = $props();
	let state = $state<State>('idle');

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

	// Reset so a spent (single-use) solution can be re-solved, e.g. after a failed send.
	export function reset() {
		state = 'idle';
		verified = false;
	}

	async function run() {
		if (state === 'solving' || state === 'verifying' || state === 'done') return;
		state = 'solving';
		verified = false;
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
			verified = true;
		} catch {
			state = 'error';
			verified = false;
		}
	}
</script>

<div
	class="flex items-center gap-3 rounded-xl border border-(--app-border) bg-(--app-surface) px-4 py-3"
>
	{#if state === 'done'}
		<i class="fa-solid fa-circle-check text-lg text-emerald-400"></i>
		<span class="text-sm text-(--app-text)">Verified — you're human</span>
	{:else if state === 'solving' || state === 'verifying'}
		<i class="fa-solid fa-spinner fa-spin text-lg text-(--app-accent)"></i>
		<span class="text-sm text-(--app-text)">
			{state === 'solving' ? 'Verifying you’re human…' : 'Confirming…'}
		</span>
	{:else}
		<button
			type="button"
			onclick={run}
			class="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-(--app-border) bg-transparent transition hover:border-(--app-accent) focus:ring-2 focus:ring-(--app-accent)/30 focus:outline-none"
			aria-label="Verify you're human"
		></button>
		<button type="button" onclick={run} class="text-left text-sm text-(--app-text)">
			{#if state === 'error'}
				Verification failed — tap to retry
			{:else}
				I’m human
			{/if}
		</button>
	{/if}

	<span class="ml-auto text-xs text-(--app-muted)">
		Protected by
		<a
			href="https://altcha.org"
			target="_blank"
			rel="noopener noreferrer"
			class="text-(--app-accent) hover:underline">ALTCHA</a
		>
	</span>
</div>
