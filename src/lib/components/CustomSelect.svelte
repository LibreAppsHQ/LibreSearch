<script lang="ts">
	let {
		value = $bindable(''),
		options = [],
		onchange
	} = $props<{
		value?: string;
		options: Array<{ label: string; value: string }>;
		onchange?: (value: string) => void;
	}>();

	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { reducedMotion } from '$lib/stores/motion';

	let open = $state(false);
	let buttonEl: HTMLButtonElement | null = null;
	let menuRight = $state(0);
	let menuTop = $state<number | null>(null);
	let menuBottom = $state<number | null>(null);
	let menuMaxHeight = $state(320);

	let currentLabel = $derived(
		options.find((o: { label: string; value: string }) => o.value === value)?.label ??
			options[0]?.label ??
			''
	);

	// Render the dropdown on <body> so an ancestor's overflow-hidden can't clip it.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	function position() {
		if (!buttonEl) return;
		const rect = buttonEl.getBoundingClientRect();
		const gap = 6;
		const margin = 12; // keep a little breathing room from the viewport edge
		menuRight = window.innerWidth - rect.right;

		const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
		const spaceAbove = rect.top - gap - margin;

		// Estimate the menu's natural height (~36px per row + 8px padding).
		const desired = options.length * 36 + 8;

		// Open upward when there isn't room below but there is more room above.
		if (desired > spaceBelow && spaceAbove > spaceBelow) {
			menuTop = null;
			menuBottom = window.innerHeight - rect.top + gap;
			menuMaxHeight = Math.max(120, spaceAbove);
		} else {
			menuBottom = null;
			menuTop = rect.bottom + gap;
			menuMaxHeight = Math.max(120, spaceBelow);
		}
	}

	function toggle() {
		if (!open) position();
		open = !open;
	}

	function select(val: string) {
		value = val;
		open = false;
		onchange?.(val);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window
	onkeydown={handleKeydown}
	onresize={() => (open = false)}
	onscroll={() => (open = false)}
/>

<div class="relative">
	<button
		bind:this={buttonEl}
		type="button"
		onclick={toggle}
		class="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-(--app-text) transition hover:text-(--app-accent) focus:outline-none"
	>
		<span>{currentLabel}</span>
		<i
			class="fa-solid fa-chevron-down text-[10px] text-(--app-muted) transition-transform duration-150"
			class:rotate-180={open}
		></i>
	</button>
</div>

{#if open}
	<div use:portal>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 z-[60]"
			aria-label="Close"
			tabindex="-1"
			onclick={() => (open = false)}
		></button>

		<!-- Dropdown -->
		<div
			class="fixed z-[61] min-w-[10rem] overflow-y-auto overscroll-contain rounded-sm border border-(--app-border) bg-(--app-elevated) shadow-2xl shadow-black/40"
			style="{menuTop !== null ? `top:${menuTop}px;` : ''}{menuBottom !== null
				? `bottom:${menuBottom}px;`
				: ''} right:{menuRight}px; max-height:{menuMaxHeight}px;"
			transition:fly={{
				y: menuBottom !== null ? 4 : -4,
				duration: $reducedMotion ? 0 : 140,
				easing: cubicOut
			}}
		>
			{#each options as opt (opt.value)}
				<button
					type="button"
					onclick={() => select(opt.value)}
					class={opt.value === value
						? 'flex w-full items-center justify-between gap-6 bg-(--app-hover) px-4 py-2 text-left text-sm font-medium text-(--app-text)'
						: 'flex w-full items-center px-4 py-2 text-left text-sm text-(--app-muted) transition hover:bg-(--app-hover) hover:text-(--app-text)'}
				>
					{opt.label}
					{#if opt.value === value}
						<i class="fa-solid fa-check text-[10px] text-(--app-accent)"></i>
					{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}
