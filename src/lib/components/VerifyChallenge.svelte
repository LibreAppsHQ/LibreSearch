<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let verified = $state(false);
	let verifying = $state(false);
	let error = $state(false);

	async function verify() {
		if (!verified) return;
		verifying = true;
		error = false;
		try {
			const res = await fetch('/api/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ checked: true })
			});
			if (!res.ok) throw new Error('Verification failed');
			const data = (await res.json()) as { ok?: boolean };
			if (!data.ok) throw new Error('Verification rejected');
			await invalidateAll();
		} catch {
			error = true;
			verifying = false;
		}
	}
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
		class="mt-6 flex w-full flex-col items-center gap-3 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-4"
	>
		<label class="flex cursor-pointer items-center gap-3">
			<input
				type="checkbox"
				bind:checked={verified}
				class="h-5 w-5 accent-(--app-accent)"
			/>
			<span class="text-sm text-(--app-text)">I am human</span>
		</label>

		{#if error}
			<p class="text-sm text-red-400">Verification failed. Please try again.</p>
		{/if}

		<button
			type="button"
			disabled={!verified || verifying}
			onclick={verify}
			class="mt-2 rounded-full bg-(--app-accent) px-6 py-2 text-sm font-semibold text-[#111] transition hover:opacity-90 disabled:opacity-40"
		>
			{#if verifying}
				<i class="fa-solid fa-spinner fa-spin mr-1"></i> Confirming...
			{:else}
				Continue
			{/if}
		</button>
	</div>
</div>
