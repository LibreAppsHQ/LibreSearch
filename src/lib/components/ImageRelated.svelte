<script lang="ts">
	let { query } = $props<{ query: string }>();

	let terms = $state<string[]>([]);
	let strip = $state<HTMLDivElement>();

	// Pull related terms from the suggest endpoint (Brave images has no related data).
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
				/* ignore — strip just stays empty */
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
	<div class="relative mb-5">
		<div
			bind:this={strip}
			class="flex [scrollbar-width:none] gap-2.5 overflow-x-auto pr-10 [&::-webkit-scrollbar]:hidden"
		>
			{#each terms as term (term)}
				<a
					href={href(term)}
					class="shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-medium whitespace-nowrap text-[var(--app-text)] capitalize transition hover:bg-[var(--app-hover)]"
				>
					{term}
				</a>
			{/each}
		</div>

		<!-- Right scroll affordance -->
		<button
			type="button"
			aria-label="Scroll related searches"
			onclick={scrollRight}
			class="absolute top-0 right-0 flex h-full w-10 items-center justify-end bg-gradient-to-l from-[var(--app-background)] via-[var(--app-background)] to-transparent text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
		>
			<i class="fa-solid fa-chevron-right"></i>
		</button>
	</div>
{/if}
