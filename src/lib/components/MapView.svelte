<script lang="ts">
	import type { PlaceResult } from '$lib/search';

	let { places } = $props<{ places: PlaceResult[] }>();

	// The currently focused place — drives the embedded map.
	// svelte-ignore state_referenced_locally
	let selected = $state<PlaceResult>(places[0]);

	// Reset focus to the top hit whenever a new search comes in.
	$effect(() => {
		selected = places[0];
	});

	function embedSrc(place: PlaceResult): string {
		const params = new URLSearchParams({ layer: 'mapnik' });
		if (place.boundingBox) {
			const [south, north, west, east] = place.boundingBox;
			params.set('bbox', `${west},${south},${east},${north}`);
		} else {
			const d = 0.01;
			params.set('bbox', `${place.lon - d},${place.lat - d},${place.lon + d},${place.lat + d}`);
		}
		params.set('marker', `${place.lat},${place.lon}`);
		return `https://www.openstreetmap.org/export/embed.html?${params}`;
	}

	function osmLink(place: PlaceResult): string {
		return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}`;
	}

	function directionsLink(place: PlaceResult): string {
		return `https://www.openstreetmap.org/directions?to=${place.lat}%2C${place.lon}`;
	}

	function placeLabel(place: PlaceResult): string {
		return [place.type, place.category].filter(Boolean).join(' · ').replace(/_/g, ' ');
	}
</script>

<div class="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
	<!-- Results list -->
	<ol class="order-2 space-y-1.5 lg:order-1">
		{#each places as place (place.osmType ? `${place.osmType}${place.osmId}` : place.displayName)}
			<li>
				<button
					type="button"
					onclick={() => (selected = place)}
					aria-current={selected === place ? 'true' : undefined}
					class={selected === place
						? 'w-full rounded-xl border border-(--app-accent) bg-(--app-surface) p-3.5 text-left transition'
						: 'w-full rounded-xl border border-transparent bg-(--app-surface) p-3.5 text-left transition hover:bg-(--app-hover)'}
				>
					<p class="font-medium text-(--app-text)">{place.name}</p>
					<p class="mt-0.5 text-sm text-(--app-muted)">{place.displayName}</p>
					{#if placeLabel(place)}
						<span
							class="mt-2 inline-block rounded-full bg-(--app-hover) px-2 py-0.5 text-xs font-medium text-(--app-muted) capitalize"
						>
							{placeLabel(place)}
						</span>
					{/if}
					<div class="mt-2.5 flex gap-3 text-sm">
						<a
							href={osmLink(place)}
							target="_blank"
							rel="noopener noreferrer"
							class="text-(--app-accent) hover:underline"
							onclick={(e) => e.stopPropagation()}>View on OSM</a
						>
						<a
							href={directionsLink(place)}
							target="_blank"
							rel="noopener noreferrer"
							class="text-(--app-accent) hover:underline"
							onclick={(e) => e.stopPropagation()}>Directions</a
						>
					</div>
				</button>
			</li>
		{/each}
	</ol>

	<!-- Map -->
	<div class="order-1 lg:order-2">
		<div class="sticky top-[120px] overflow-hidden rounded-2xl border border-(--app-border)">
			<iframe
				title={`Map of ${selected.name}`}
				src={embedSrc(selected)}
				class="h-[320px] w-full lg:h-[560px]"
				loading="lazy"
				referrerpolicy="no-referrer"
			></iframe>
		</div>
		<p class="mt-2 px-1 text-xs text-(--app-muted)">
			Map data © <a
				href="https://www.openstreetmap.org/copyright"
				target="_blank"
				rel="noopener noreferrer"
				class="hover:underline">OpenStreetMap</a
			> contributors
		</p>
	</div>
</div>
