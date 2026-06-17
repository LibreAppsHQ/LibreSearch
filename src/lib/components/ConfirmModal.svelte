<script lang="ts">
	let {
		open = false,
		title = 'Are you sure?',
		message = '',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		onconfirm,
		oncancel
	}: {
		open: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') oncancelling();
	}

	function oncancelling() {
		oncancel();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-(--app-background)/95"
		onclick={oncancelling}
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<div
			class="mx-4 w-full max-w-sm rounded-2xl border border-(--app-border) bg-(--app-card) p-6 shadow-xl"
			onclick={(e) => e.stopPropagation()}
		>
			<h3 id="confirm-title" class="text-lg font-semibold text-(--app-text)">{title}</h3>
			{#if message}
				<p class="mt-2 text-sm text-(--app-muted)">{message}</p>
			{/if}
			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					onclick={oncancelling}
					class="rounded-full border border-(--app-border) px-5 py-2 text-sm font-medium text-(--app-button) transition hover:bg-(--app-hover)"
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					onclick={() => {
						onconfirm();
						oncancel();
					}}
					class="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
