<script lang="ts">
	import type { VideoResult } from '$lib/search';

	let { video, onclose } = $props<{
		video: VideoResult;
		onclose: () => void;
	}>();

	let watching = $state(false);

	type EmbedInfo = { url: string; platform: string };

	function getEmbedInfo(rawUrl: string): EmbedInfo | null {
		try {
			const u = new URL(rawUrl);
			const host = u.hostname.replace(/^(www\.|m\.)/, '');

			if (host === 'youtube.com' || host === 'youtu.be') {
				let id: string | null = null;
				if (host === 'youtu.be') {
					id = u.pathname.slice(1).split('?')[0];
				} else if (u.pathname.startsWith('/shorts/')) {
					id = u.pathname.split('/')[2];
				} else {
					id = u.searchParams.get('v');
				}
				if (id) {
					const params = new URLSearchParams({
						autoplay: '1',
						rel: '0',
						enablejsapi: '0', // disables JS API used for tracking
						iv_load_policy: '3', // no video annotations
						modestbranding: '1', // minimal YouTube branding
						playsinline: '1',
						origin: typeof window !== 'undefined' ? window.location.origin : ''
					});
					return {
						url: `https://www.youtube-nocookie.com/embed/${id}?${params}`,
						platform: 'YouTube'
					};
				}
			}

			if (host === 'vimeo.com') {
				const id = u.pathname.split('/').filter(Boolean)[0];
				if (id && /^\d+$/.test(id)) {
					const params = new URLSearchParams({
						autoplay: '1',
						dnt: '1',
						title: '0',
						byline: '0',
						portrait: '0'
					});
					return { url: `https://player.vimeo.com/video/${id}?${params}`, platform: 'Vimeo' };
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	function siteName(url: string): string {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return 'site';
		}
	}

	const embed = $derived(getEmbedInfo(video.url));
	const site = $derived(siteName(video.url));

	function watchOnSite() {
		window.open(video.url, '_blank', 'noopener,noreferrer');
		onclose();
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={handleKey} />

<!-- Backdrop — click to close; Escape handled by the window keydown above. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
	onclick={onclose}
	role="button"
	tabindex="-1"
	aria-label="Close video"
>
	<!-- Panel -->
	<div
		class="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-(--app-background) shadow-2xl shadow-black/60"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<!-- Close -->
		<button
			type="button"
			onclick={onclose}
			class="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
			aria-label="Close"
		>
			<i class="fa-solid fa-xmark text-xs"></i>
		</button>

		{#if watching && embed}
			<!-- ── Embedded player ── -->
			<div class="aspect-video w-full bg-black">
				<iframe
					src={embed.url}
					title={video.title}
					class="h-full w-full"
					allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
					referrerpolicy="origin"
					sandbox="allow-scripts allow-same-origin allow-presentation"
					loading="eager"
				></iframe>
			</div>
			<div class="flex items-center justify-between gap-4 px-5 py-3">
				<p class="min-w-0 truncate text-sm font-medium text-(--app-text)">{video.title}</p>
				<div class="flex shrink-0 items-center gap-3">
					<span class="flex items-center gap-1 text-xs text-emerald-500">
						<i class="fa-solid fa-shield-halved text-[10px]"></i>
						{embed?.platform === 'YouTube' ? 'youtube-nocookie.com' : 'Private embed'}
					</span>
					<button
						type="button"
						onclick={watchOnSite}
						class="text-xs text-(--app-muted) transition hover:text-(--app-text)"
					>
						Watch on {site}
						<i class="fa-solid fa-arrow-up-right-from-square ml-0.5 text-[10px]"></i>
					</button>
				</div>
			</div>
		{:else}
			<!-- ── Choice prompt ── -->
			<div class="relative">
				<!-- Thumbnail -->
				<div class="aspect-video w-full bg-black">
					{#if video.thumbnail}
						<img
							src={video.thumbnail}
							alt={video.title}
							class="h-full w-full object-cover opacity-60"
						/>
					{/if}
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
					></div>

					<!-- Play hint in centre -->
					<div class="absolute inset-0 flex items-center justify-center">
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 ring-2 ring-white/20 backdrop-blur-sm"
						>
							<i class="fa-solid fa-play ml-1 text-xl text-white"></i>
						</div>
					</div>

					<!-- Title + meta overlaid at bottom -->
					<div class="absolute right-0 bottom-0 left-0 p-5">
						<h2 class="mb-1 line-clamp-2 text-base leading-snug font-semibold text-white">
							{video.title}
						</h2>
						<div class="flex items-center gap-2 text-xs text-white/60">
							{#if video.publisher}<span>{video.publisher}</span>{/if}
							{#if video.duration}<span>·</span><span>{video.duration}</span>{/if}
							{#if video.views}<span>·</span><span>{video.views}</span>{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex flex-col gap-3 px-5 py-5 sm:flex-row">
				{#if embed}
					<button
						type="button"
						onclick={() => (watching = true)}
						class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--app-accent) px-5 py-3 text-sm font-semibold text-[#111111] transition hover:opacity-90"
					>
						<i class="fa-solid fa-play text-xs"></i>
						Watch here
					</button>
				{:else}
					<div
						class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--app-border) px-5 py-3 text-sm text-(--app-muted)"
					>
						<i class="fa-solid fa-circle-info text-xs"></i>
						Can't embed this video
					</div>
				{/if}
				<button
					type="button"
					onclick={watchOnSite}
					class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--app-border) bg-(--app-surface) px-5 py-3 text-sm font-medium text-(--app-text) transition hover:bg-(--app-hover)"
				>
					<i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
					Watch on {site}
				</button>
			</div>
		{/if}
	</div>
</div>
