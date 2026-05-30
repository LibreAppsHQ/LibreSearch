<script lang="ts">
	import { reducedMotion } from '$lib/stores/motion';

	let { class: triggerClass = '' } = $props<{ class?: string }>();

	let swirling = $state(false);

	// Move the overlay to <body> so a `backdrop-filter` ancestor (e.g. the
	// sticky, blurred search-results header) can't trap our position:fixed
	// element inside its stacking context. Same trick SiteMenu uses.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	// Wipe every LibreSearch-owned key out of local storage: search history,
	// settings, theme — everything that lives on the device.
	function clearEverything() {
		if (typeof window === 'undefined') return;
		try {
			const keys: string[] = [];
			for (let i = 0; i < window.localStorage.length; i++) {
				const k = window.localStorage.key(i);
				if (k && k.startsWith('LibreSearch:')) keys.push(k);
			}
			keys.forEach((k) => window.localStorage.removeItem(k));
			window.sessionStorage.clear();
		} catch {
			// Storage unavailable — nothing to clear.
		}
	}

	function swirl() {
		if (swirling) return;

		// Reduced motion: skip the spectacle, just clear and reset.
		if ($reducedMotion) {
			clearEverything();
			window.location.href = '/';
			return;
		}

		swirling = true;
		// Clear partway through, while the whirlpool covers the screen.
		setTimeout(clearEverything, 650);
		// Hard navigation home re-initializes every store from the now-empty storage.
		setTimeout(() => {
			window.location.href = '/';
		}, 1400);
	}
</script>

<button
	type="button"
	aria-label="Wipe — delete all history, settings, and data"
	title="Delete everything"
	onclick={swirl}
	class="group inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-text)] transition hover:bg-[var(--app-hover)] {triggerClass}"
>
	<i
		class="fa-solid fa-rotate text-xl transition group-hover:text-cyan-500 {swirling
			? 'text-cyan-500'
			: ''}"
	></i>
</button>

{#if swirling}
	<div use:portal class="swirl-overlay" role="presentation" aria-hidden="true">
		<img class="swirl-gif" src="/animation2.gif" alt="" />
	</div>
{/if}

<style>
	.swirl-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		pointer-events: none;
		overflow: hidden;
		background: #000;
		animation: overlay-out 1.4s ease-in forwards;
	}

	/* The whirlpool animation, scaled to cover the screen over its black backdrop. */
	.swirl-gif {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@keyframes overlay-out {
		0%,
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
