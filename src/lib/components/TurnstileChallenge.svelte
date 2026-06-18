<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

	const SITE_KEY = PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

	type State = 'loading' | 'verifying' | 'done' | 'error';
	let state = $state<State>('loading');
	let widgetId: string | undefined;

	async function run() {
		state = 'loading';
		try {
			if (!window.turnstile) {
				await new Promise<void>((resolve) => {
					const script = document.createElement('script');
					script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
					script.defer = true;
					script.onload = () => resolve();
					document.head.appendChild(script);
				});
			}

			const turnstileDiv = document.getElementById('turnstile-widget');
			if (!turnstileDiv || !window.turnstile) throw new Error('Turnstile widget not found');

			if (widgetId) window.turnstile.remove(widgetId);

			const token = await new Promise<string>((resolve) => {
				widgetId = window.turnstile!.render(turnstileDiv, {
					sitekey: SITE_KEY,
					theme: 'auto',
					callback: resolve,
					'error-callback': () => resolve(''),
					'expired-callback': () => resolve('')
				});
			});
			if (!token) throw new Error('Verification failed');

			state = 'verifying';
			const res = await fetch('/api/turnstile/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ token })
			});
			if (!res.ok) throw new Error('Verification failed');
			const data = (await res.json()) as { ok?: boolean };
			if (!data.ok) throw new Error('Verification rejected');

			state = 'done';
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
		We noticed unusual activity from your connection. Please confirm you're human to continue
		searching.
	</p>

	<div
		class="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-4"
	>
		<div id="turnstile-widget" class:hidden={state !== 'loading'}></div>

		{#if state === 'verifying'}
			<i class="fa-solid fa-spinner fa-spin text-(--app-accent)"></i>
			<span class="text-sm text-(--app-text)">Confirming\u2026</span>
		{:else if state === 'done'}
			<i class="fa-solid fa-circle-check text-emerald-400"></i>
			<span class="text-sm text-(--app-text)">Verified \u2014 loading your results\u2026</span>
		{:else if state === 'error'}
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

	<p class="mt-4 text-xs text-(--app-muted)">Protected by Cloudflare Turnstile</p>
</div>
