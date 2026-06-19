<script lang="ts">
	let { query } = $props<{ query: string }>();

	let terms = $state<string[]>([]);
	let strip = $state<HTMLDivElement>();
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	function updateScrollState() {
		if (!strip) return;
		canScrollLeft = strip.scrollLeft > 0;
		canScrollRight = strip.scrollLeft < strip.scrollWidth - strip.clientWidth - 1;
	}

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
				// Wait for DOM update then check scroll state
				setTimeout(updateScrollState, 0);
			} catch {
				/* ignore */
			}
		})();

		return () => controller.abort();
	});

	function href(term: string): string {
		return `/search?q=${encodeURIComponent(term)}&t=images`;
	}

	function scrollLeft() {
		strip?.scrollBy({ left: -320, behavior: 'smooth' });
	}

	function scrollRight() {
		strip?.scrollBy({ left: 320, behavior: 'smooth' });
	}
</script>

{#if terms.length > 0}
	<div class="relative mb-4">
		<!-- Scroll left button -->
		{#if canScrollLeft}
			<button
				type="button"
				aria-label="Scroll left"
				onclick={scrollLeft}
				class="absolute top-0 left-0 z-10 flex h-full w-10 items-center justify-start bg-gradient-to-r from-(--app-background) via-(--app-background) to-transparent text-(--app-muted) transition hover:text-(--app-button-hover)"
			>
				<i class="fa-solid fa-chevron-left"></i>
			</button>
		{/if}

		<div
			bind:this={strip}
			onscroll={updateScrollState}
			class="flex [scrollbar-width:none] gap-2 overflow-x-auto px-10 [&::-webkit-scrollbar]:hidden"
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

		<!-- Scroll right button -->
		{#if canScrollRight}
			<button
				type="button"
				aria-label="Scroll right"
				onclick={scrollRight}
				class="absolute top-0 right-0 flex h-full w-10 items-center justify-end bg-gradient-to-l from-(--app-background) via-(--app-background) to-transparent text-(--app-muted) transition hover:text-(--app-button-hover)"
			>
				<i class="fa-solid fa-chevron-right"></i>
			</button>
		{/if}
	</div>
{/if}
