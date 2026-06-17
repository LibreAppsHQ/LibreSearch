<script lang="ts">
	import { env } from '$env/dynamic/public';

	const SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
	// Inline Turnstile widget for forms.
	// Loads Cloudflare Turnstile challenge, verifies with our server,
	// and flips `verified` to true.

	type State = 'idle' | 'loading' | 'verifying' | 'done' | 'error';

	// eslint-disable-next-line no-useless-assignment -- write-only bindable prop default
	let { verified = $bindable(false) }: { verified?: boolean } = $props();
	let state = $state<State>('idle');
	let widgetId: string | undefined;

	// Reset so a spent solution can be re-solved, e.g. after a failed send.
	export function reset() {
		state = 'idle';
		verified = false;
		if (widgetId) window.turnstile?.reset(widgetId);
		widgetId = undefined;
	}

	async function run() {
		if (state === 'loading' || state === 'verifying' || state === 'done') return;
		state = 'loading';
		verified = false;
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

			const token = await new Promise<string>((resolve) => {
				const turnstileDiv = document.getElementById('turnstile-widget-form');
				if (!turnstileDiv || !window.turnstile) throw new Error('Turnstile widget not found');
				widgetId = window.turnstile.render(turnstileDiv, {
					sitekey: SITE_KEY,
					theme: 'auto',
					size: 'compact',
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
	{:else if state === 'loading' || state === 'verifying'}
		<div id="turnstile-widget-form" class="h-[65px] w-[130px]"></div>
		<i class="fa-solid fa-spinner fa-spin text-lg text-(--app-accent)"></i>
		<span class="text-sm text-(--app-text)">
			{state === 'loading' ? 'Verifying you\u2019re human\u2026' : 'Confirming\u2026'}
		</span>
	{:else}
		<button
			type="button"
			onclick={run}
			class="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-(--app-border) bg-transparent transition hover:border-(--app-accent) focus:ring-2 focus:ring-(--app-accent)/30 focus:outline-none"
			aria-label="Verify you're human"
		></button>
		<button
			type="button"
			onclick={run}
			class="text-left text-sm text-(--app-button) hover:text-(--app-button-hover)"
		>
			{#if state === 'error'}
				Verification failed — tap to retry
			{:else}
				I'm human
			{/if}
		</button>
	{/if}

	<span class="ml-auto text-xs text-(--app-muted)">
		Protected by
		<a
			href="https://www.cloudflare.com/products/turnstile/"
			target="_blank"
			rel="noopener noreferrer"
			class="text-(--app-accent) hover:underline">Cloudflare Turnstile</a
		>
	</span>
</div>

