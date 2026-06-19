<script lang="ts">
	import type { SearchTab } from '$lib/search';
	import { settingsStore, getToggle } from '$lib/stores/settings';

	type Citation = { title: string; url: string };

	let { query, tab }: { query: string; tab: SearchTab } = $props();

	let openInNewTab = $derived(getToggle($settingsStore, 'open-new-tab'));

	let answer = $state<string | null>(null);
	let sources = $state<Citation[]>([]);
	let loading = $state(false);

	function hostname(url: string): string {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	}

	// Re-fetch whenever the query changes on the web tab. Other tabs show nothing.
	$effect(() => {
		const q = query;
		const isWeb = tab === 'web';
		answer = null;
		sources = [];

		if (!q || !isWeb) {
			loading = false;
			return;
		}

		loading = true;
		const controller = new AbortController();

		fetch(`/api/answer?q=${encodeURIComponent(q)}`, { signal: controller.signal })
			.then((r) => (r.ok ? r.json() : { answer: null, sources: [] }))
			.then((data: { answer: string | null; sources?: Citation[] }) => {
				answer = data.answer;
				sources = data.sources ?? [];
			})
			.catch(() => {
				answer = null;
				sources = [];
			})
			.finally(() => {
				loading = false;
			});

		return () => controller.abort();
	});
</script>

{#if loading || answer}
	<section
		class="mb-5 rounded-sm border border-(--app-border) bg-(--app-surface) p-4"
		aria-label="AI answer"
	>
		<div class="mb-2 flex items-center gap-2 text-xs font-semibold text-(--app-accent)">
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			<span>AI answer</span>
			<span class="rounded bg-(--app-hover) px-2 py-0.5 text-[10px] text-(--app-muted)">Beta</span>
		</div>

		{#if loading}
			<div class="flex items-center gap-2 text-sm text-(--app-muted)">
				<i class="fa-solid fa-circle-notch fa-spin"></i>
				<span>Generating an answer…</span>
			</div>
		{:else if answer}
			<p class="text-sm leading-6 whitespace-pre-line text-(--app-text)">{answer}</p>

			{#if sources.length > 0}
				<div class="mt-3 flex flex-wrap gap-2">
					{#each sources as source, i (i)}
						<a
							href={source.url}
							target={openInNewTab ? '_blank' : '_self'}
							rel="noopener noreferrer"
							title={source.title}
							class="inline-flex max-w-[220px] items-center gap-1.5 rounded bg-(--app-hover) px-2.5 py-1 text-[11px] text-(--app-secondary) transition hover:opacity-80"
						>
							<span class="text-(--app-muted)">{i + 1}</span>
							<span class="truncate">{hostname(source.url)}</span>
						</a>
					{/each}
				</div>
			{/if}

			<p class="mt-3 text-xs text-(--app-muted)">
				AI-generated from search results — verify important details.
			</p>
		{/if}
	</section>
{/if}
