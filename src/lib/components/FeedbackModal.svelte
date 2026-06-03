<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { onclose }: { onclose: () => void } = $props();

	const accessKey = env.PUBLIC_WEB3FORMS_KEY ?? '';

	type Rating = 'dislike' | 'neutral' | 'like';

	let rating = $state<Rating | null>(null);
	let message = $state('');
	let submitting = $state(false);
	let success = $state(false);
	let error = $state('');

	const ratings: { value: Rating; label: string; icon: string }[] = [
		{ value: 'dislike', label: "I don't like it", icon: 'fa-face-frown' },
		{ value: 'neutral', label: 'Neutral', icon: 'fa-face-meh' },
		{ value: 'like', label: 'I like it', icon: 'fa-face-smile' }
	];

	async function submit() {
		if (!rating) {
			error = 'Please select a rating.';
			return;
		}
		submitting = true;
		error = '';
		try {
			const ratingLabel = ratings.find((r) => r.value === rating)?.label ?? rating;
			const res = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', accept: 'application/json' },
				body: JSON.stringify({
					access_key: accessKey,
					subject: `[Feedback] ${ratingLabel} — LibreSearch`,
					name: 'Anonymous',
					email: 'info@libresearch.ca',
					from_name: 'LibreSearch Feedback',
					message: `Rating: ${ratingLabel}\n\n${message || '(no comment)'}`,
					botcheck: ''
				})
			});
			const data = (await res.json()) as { success: boolean; message?: string };
			if (data.success) {
				success = true;
			} else {
				error = data.message ?? 'Something went wrong. Please try again.';
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			submitting = false;
		}
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	aria-label="Feedback"
	tabindex="-1"
	onmousedown={handleBackdrop}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
>
	<div
		class="relative w-full max-w-md rounded-sm border border-(--app-border) bg-(--app-elevated) p-6 shadow-2xl shadow-black/50"
	>
		<!-- Close -->
		<button
			type="button"
			aria-label="Close feedback"
			onclick={onclose}
			class="absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-(--app-muted) transition"
		>
			<i class="fa-solid fa-xmark"></i>
		</button>

		{#if success}
			<div class="text-center">
				<p class="text-2xl font-bold text-(--app-text)">Thank You!</p>
				<p class="mt-4 text-sm text-(--app-muted)">
					Your feedback helps improve the LibreSearch experience.
				</p>
				<p class="mt-2 text-sm text-(--app-muted)">
					Need additional help? <a href="/contact" class="text-(--app-accent) underline"
						>Contact us</a
					>
				</p>
				<button
					type="button"
					onclick={onclose}
					class="mt-8 rounded-lg bg-(--app-accent) px-6 py-2 text-sm font-medium text-[#111] transition hover:opacity-90"
				>
					Close
				</button>
			</div>
		{:else}
			<h2 class="mb-6 text-center text-lg font-bold text-(--app-text)">
				How would you rate your experience with LibreSearch?*
			</h2>

			<!-- Rating -->
			<div class="mb-6 flex justify-center gap-4">
				{#each ratings as r}
					<button
						type="button"
						onclick={() => (rating = r.value)}
						class={`flex w-32 flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
							rating === r.value
								? 'border-(--app-accent) bg-(--app-accent)/10'
								: 'border-(--app-border) hover:border-(--app-accent)/50 hover:bg-(--app-hover)'
						}`}
					>
						<span
							class="flex h-12 w-12 items-center justify-center rounded-full bg-(--app-surface) text-2xl text-(--app-text)"
						>
							<i class="fa-solid {r.icon}"></i>
						</span>
						<span class="text-xs text-(--app-text)">{r.label}</span>
						<span
							class={`h-4 w-4 rounded-full border-2 ${rating === r.value ? 'border-(--app-accent) bg-(--app-accent)' : 'border-(--app-muted)'}`}
						></span>
					</button>
				{/each}
			</div>

			<!-- Reason -->
			<p class="mb-2 text-sm font-semibold text-(--app-text)">
				What is the reason for your rating?
			</p>
			<textarea
				bind:value={message}
				placeholder="Let us know how we can do better!"
				rows="4"
				class="w-full border border-(--app-border) bg-(--app-surface) px-3 py-2.5 text-sm text-(--app-text) placeholder:text-(--app-muted) focus:border-(--app-accent)/60 focus:ring-2 focus:ring-(--app-accent)/20 focus:outline-none"
			></textarea>

			{#if error}
				<p class="mt-2 text-xs text-red-400">{error}</p>
			{/if}

			<button
				type="button"
				onclick={submit}
				disabled={submitting}
				class="mt-4 w-full rounded-lg bg-(--app-accent) py-3 text-sm font-semibold text-[#111] transition hover:opacity-90 disabled:opacity-50"
			>
				{submitting ? 'Submitting…' : 'Submit Feedback'}
			</button>

			<p class="mt-3 text-center text-xs text-(--app-muted)">*Required</p>
			<p class="mt-1 text-center text-xs text-(--app-muted)">
				Feedback you are providing is <span class="font-medium text-(--app-text)"
					><a href="/privacy" class="text-(--app-accent) underline">fully anonymous</a></span
				>
			</p>
		{/if}
	</div>
</div>
