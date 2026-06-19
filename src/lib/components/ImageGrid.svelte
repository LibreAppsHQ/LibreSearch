<script lang="ts">
	import type { ImageResult } from '$lib/search';
	import { settingsStore, getToggle } from '$lib/stores/settings';

	let { images } = $props<{ images: ImageResult[] }>();

	let openInNewTab = $derived(getToggle($settingsStore, 'open-new-tab'));

	const ROW_HEIGHT = 200;

	let selected = $state<number | null>(null);
	let rowEnd = $state(0);
	let caretLeft = $state(0);
	let copied = $state(false);

	let gridEl = $state<HTMLDivElement>();
	let els = $state<HTMLElement[]>([]);

	let active = $derived(selected !== null ? images[selected] : null);

	function ratio(image: ImageResult): number {
		if (image.width && image.height && image.height > 0) {
			return Math.min(Math.max(image.width / image.height, 0.5), 2.5);
		}
		return 1.5;
	}

	function domain(image: ImageResult): string {
		try {
			return new URL(image.url).hostname.replace(/^www\./, '');
		} catch {
			return image.source ?? '';
		}
	}

	function favicon(image: ImageResult): string {
		const d = domain(image);
		return d ? `https://icons.duckduckgo.com/ip3/${d}.ico` : '';
	}

	function computeLayout(index: number) {
		let end = index;
		for (let i = index; i + 1 < images.length; i++) {
			const a = els[i];
			const b = els[i + 1];
			if (!a || !b) break;
			if (b.offsetLeft > a.offsetLeft) end = i + 1;
			else break;
		}
		rowEnd = end;
		const el = els[index];
		if (el) caretLeft = el.offsetLeft + el.offsetWidth / 2;
	}

	function open(index: number) {
		if (selected === index) {
			selected = null;
			return;
		}
		copied = false;
		computeLayout(index);
		selected = index;
	}

	function close() {
		selected = null;
	}

	function step(delta: number) {
		if (selected === null) return;
		const next = (selected + delta + images.length) % images.length;
		copied = false;
		computeLayout(next);
		selected = next;
	}

	async function copyUrl() {
		if (!active) return;
		try {
			await navigator.clipboard.writeText(active.imageUrl);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			copied = false;
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (selected === null) return;
		if (event.key === 'Escape') close();
		else if (event.key === 'ArrowLeft') step(-1);
		else if (event.key === 'ArrowRight') step(1);
	}

	// Track previous selected value to only add/remove listener when crossing null boundary
	let prevSelected: number | null = $state(null);
	
	$effect(() => {
		// Only act when transitioning between null and non-null
		if (selected !== null && prevSelected === null) {
			const onResize = () => selected !== null && computeLayout(selected);
			window.addEventListener('resize', onResize);
			prevSelected = selected;
			return () => {
				window.removeEventListener('resize', onResize);
				prevSelected = null;
			};
		} else if (selected === null) {
			prevSelected = null;
		}
	});

	$effect(() => {
		void images;
		selected = null;
		copied = false;
		els = [];
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div bind:this={gridEl} class="relative flex flex-wrap gap-1.5">
	{#each images as image, i (image.imageUrl)}
		{@const r = ratio(image)}
		{@const d = domain(image)}
		{@const f = favicon(image)}
		<button
			type="button"
			bind:this={els[i]}
			onclick={() => open(i)}
			aria-pressed={selected === i}
			class="group flex min-w-0 flex-col text-left"
			style={`flex-grow:${r};flex-basis:${Math.round(r * ROW_HEIGHT)}px;`}
			title={image.title}
		>
			<div class="overflow-hidden rounded-lg" style={`height:${ROW_HEIGHT}px;`}>
				<img
					src={image.thumbnail}
					alt={image.title}
					loading="lazy"
					decoding="async"
					class="h-full w-full object-cover transition duration-200 group-hover:brightness-110"
					class:ring-2={selected === i}
					class:ring-(--app-accent)={selected === i}
					onerror={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = 'none';
					}}
				/>
			</div>
			<div class="mt-1.5 flex items-center gap-1.5 px-0.5">
				{#if f}
					<img
						src={f}
						alt=""
						class="h-3.5 w-3.5 rounded-sm"
						loading="lazy"
						onerror={(e) => {
							(e.currentTarget as HTMLImageElement).style.display = 'none';
						}}
					/>
				{/if}
				<span class="truncate text-xs text-(--app-muted)">{d || image.source}</span>
			</div>
			<p class="mt-0.5 truncate px-0.5 text-[13px] leading-tight text-(--app-text)">
				{image.title}
			</p>
		</button>

		{#if active && selected !== null && i === rowEnd}
			<div class="relative w-full basis-full">
				<i
					class="fa-solid fa-chevron-up absolute -top-6 text-2xl text-(--app-accent)"
					style={`left:${caretLeft}px;transform:translateX(-50%);`}
				></i>

				<div class="relative rounded-2xl border border-(--app-border) bg-(--app-surface) p-5">
					<button
						type="button"
						onclick={close}
						aria-label="Close preview"
						class="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-(--app-muted) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
					>
						<i class="fa-solid fa-xmark"></i>
					</button>

					<div class="flex flex-col gap-6 md:flex-row">
						<a
							href={active.url}
							target={openInNewTab ? '_blank' : '_self'}
							rel="noreferrer noopener"
							class="block shrink-0"
						>
							<img
								src={active.imageUrl}
								alt={active.title}
								class="max-h-[420px] w-full rounded-xl object-contain md:w-[420px]"
								onerror={(e) => {
									const img = e.currentTarget as HTMLImageElement;
									if (active && img.src !== active.thumbnail) img.src = active.thumbnail;
								}}
							/>
						</a>

						<div class="min-w-0 flex-1 pr-10">
							<a
								href={active.url}
								target={openInNewTab ? '_blank' : '_self'}
								rel="noreferrer noopener"
								class="text-xl font-medium text-(--app-accent) hover:underline"
							>
								{active.title}
							</a>
							<p class="mt-2 truncate text-sm text-(--app-muted)">{active.url}</p>

							<a
								href={active.url}
								target={openInNewTab ? '_blank' : '_self'}
								rel="noreferrer noopener"
								class="mt-4 inline-flex items-center gap-2 text-sm text-(--app-accent) hover:underline"
							>
								<i class="fa-solid fa-up-right-from-square text-xs"></i>
								Visit {domain(active)}
							</a>

							{#if active.width && active.height}
								<p class="mt-4 text-sm text-(--app-muted)">
									{active.width} × {active.height}
								</p>
							{/if}

							<div class="mt-4 flex flex-wrap gap-3">
								<a
									href={active.imageUrl}
									target="_blank"
									rel="noreferrer noopener"
									class="inline-flex items-center gap-2 rounded-full border border-(--app-border) px-4 py-2 text-sm font-medium text-(--app-button) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
								>
									<i class="fa-solid fa-image text-xs"></i>
									View image
								</a>
								<button
									type="button"
									onclick={copyUrl}
									class="inline-flex items-center gap-2 rounded-full border border-(--app-border) px-4 py-2 text-sm font-medium text-(--app-button) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
								>
									<i class="fa-solid {copied ? 'fa-check' : 'fa-copy'} text-xs"></i>
									{copied ? 'Copied' : 'Copy URL'}
								</button>
							</div>
						</div>
					</div>

					<div class="absolute right-5 bottom-5 flex gap-2">
						<button
							type="button"
							onclick={() => step(-1)}
							aria-label="Previous image"
							class="flex h-10 w-10 items-center justify-center rounded-full border border-(--app-border) text-(--app-button) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
						>
							<i class="fa-solid fa-chevron-left text-xs"></i>
						</button>
						<button
							type="button"
							onclick={() => step(1)}
							aria-label="Next image"
							class="flex h-10 w-10 items-center justify-center rounded-full border border-(--app-border) text-(--app-button) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
						>
							<i class="fa-solid fa-chevron-right text-xs"></i>
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/each}
</div>
