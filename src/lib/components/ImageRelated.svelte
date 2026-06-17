<script lang="ts">
	let { query } = $props<{ query: string }>();

	let terms = $state<string[]>([]);
	let strip = $state<HTMLDivElement>();

	$effect(() => {
		const q = query.trim();
		terms = [];
		if (!q) return;

		const controller = new AbortController();
		(async () => {
			try {
				const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, {
					cache: 'no-store',
					credentials: 'omit',
					headers: { accept: 'application/json' },
					signal: controller.signal
				});
				const payload = (await res.json().catch(() => null)) as string[] | null;
				if (controller.signal.aborted || !Array.isArray(payload)) return;
				const lower = q.toLowerCase();
				terms = payload
					.map((t) => t.trim())
					.filter((t) => t && t.toLowerCase() !== lower)
					.slice(0, 14);
			} catch {
				/* ignore */
			}
		})();

		return () => controller.abort();
	});

	function href(term: string): string {
		return `/search?q=${encodeURIComponent(term)}&t=images`;
	}

	function scrollRight() {
		strip?.scrollBy({ left: 320, behavior: 'smooth' });
	}
</script>

{#if terms.length > 0}
	<div class="relative mb-4">
		<div
			bind:this={strip}
			class="flex [scrollbar-width:none] gap-2 overflow-x-auto pr-10 [&::-webkit-scrollbar]:hidden"
		>
			{#each terms as term (term)}
				<a
					href={href(term)}
					class="group flex shrink-0 items-center gap-2 overflow-hidden rounded-lg border border-(--app-border) bg-(--app-surface) text-sm font-medium whitespace-nowrap text-(--app-button) transition hover:bg-(--app-hover)"
				>
					<div class="flex h-10 w-10 items-center justify-center bg-(--app-hover)">
						<i class="fa-solid fa-image text-xs text-(--app-muted)"></i>
					</div>
					<span class="px-3 capitalize">{term}</span>
				</a>
			{/each}
		</div>

		<button
			type="button"
			aria-label="Scroll related searches"
			onclick={scrollRight}
			class="absolute top-0 right-0 flex h-full w-10 items-center justify-end bg-gradient-to-l from-(--app-background) via-(--app-background) to-transparent text-(--app-muted) transition hover:text-(--app-button-hover)"
		>
			<i class="fa-solid fa-chevron-right"></i>
		</button>
	</div>
{/if}
