<script lang="ts">
 	let {
		value = $bindable(''),
		options = [],
		onchange,
		'aria-label': ariaLabel = ''
	} = $props<{
		value?: string;
		options: Array<{ label: string; value: string }>;
		onchange?: (value: string) => void;
		'aria-label'?: string;
	}>();

	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { reducedMotion } from '$lib/stores/motion';

	let open = $state(false);
	let activeIndex = $state(-1);
	let buttonEl: HTMLButtonElement | null = null;
	let optionEls: Array<HTMLButtonElement | null> = $state([]);
	let menuRight = $state(0);
	let menuTop = $state<number | null>(null);
	let menuBottom = $state<number | null>(null);
	let menuMaxHeight = $state(320);

	// Stable ids so the trigger can point at the active option via aria-activedescendant.
	const uid = Math.random().toString(36).slice(2, 9);
	const menuId = `cs-menu-${uid}`;
	const optId = (i: number) => `cs-opt-${uid}-${i}`;

	let currentIndex = $derived(
		options.findIndex((o: { label: string; value: string }) => o.value === value)
	);
	let currentLabel = $derived(
		(currentIndex >= 0 ? options[currentIndex]?.label : options[0]?.label) ?? ''
	);

	// Type-ahead: collected keystrokes jump to a matching label, cleared after a pause.
	let typeBuffer = '';
	let typeTimer: ReturnType<typeof setTimeout> | null = null;

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

	function openMenu() {
		position();
		activeIndex = currentIndex >= 0 ? currentIndex : 0;
		open = true;
	}

	function closeMenu(refocus = true) {
		open = false;
		activeIndex = -1;
		if (refocus) buttonEl?.focus();
	}

	function toggle() {
		if (open) closeMenu(false);
		else openMenu();
	}

	function select(val: string) {
		value = val;
		closeMenu();
		onchange?.(val);
	}

	function move(delta: number) {
		const n = options.length;
		if (n === 0) return;
		activeIndex = (activeIndex + delta + n) % n;
	}

	// Keep the highlighted option scrolled into view (long lists, e.g. region).
	$effect(() => {
		if (open && activeIndex >= 0) optionEls[activeIndex]?.scrollIntoView({ block: 'nearest' });
	});

	function typeAhead(char: string) {
		if (typeTimer) clearTimeout(typeTimer);
		typeBuffer += char.toLowerCase();
		typeTimer = setTimeout(() => (typeBuffer = ''), 600);
		const start = open ? Math.max(activeIndex, 0) : Math.max(currentIndex, 0);
		const n = options.length;
		for (let i = 0; i < n; i++) {
			const idx = (start + i) % n;
			if (options[idx].label.toLowerCase().startsWith(typeBuffer)) {
				if (!open) openMenu();
				activeIndex = idx;
				return;
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				open ? move(1) : openMenu();
				break;
			case 'ArrowUp':
				e.preventDefault();
				open ? move(-1) : openMenu();
				break;
			case 'Home':
				if (open) {
					e.preventDefault();
					activeIndex = 0;
				}
				break;
			case 'End':
				if (open) {
					e.preventDefault();
					activeIndex = options.length - 1;
				}
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (open && activeIndex >= 0) select(options[activeIndex].value);
				else openMenu();
				break;
			case 'Escape':
				if (open) {
					e.preventDefault();
					closeMenu();
				}
				break;
			case 'Tab':
				if (open) closeMenu(false);
				break;
			default:
				if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
					e.preventDefault();
					typeAhead(e.key);
				}
		}
	}
</script>

<svelte:window
	onresize={() => open && closeMenu(false)}
	onscroll={() => open && closeMenu(false)}
/>

<div class="relative">
	<button
		bind:this={buttonEl}
		type="button"
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={menuId}
		aria-activedescendant={open && activeIndex >= 0 ? optId(activeIndex) : undefined}
		aria-label={ariaLabel || undefined}
		onclick={toggle}
		onkeydown={handleKeydown}
		class={open
			? 'flex min-w-[10rem] items-center justify-between gap-3 rounded-sm border border-(--app-button)/70 bg-(--app-card) px-3 py-1 text-sm font-medium text-(--app-button) focus:outline-none'
			: 'flex min-w-[10rem] items-center justify-between gap-3 rounded-sm border border-(--app-border) bg-(--app-card) px-3 py-1 text-sm font-medium text-(--app-button) transition hover:border-(--app-muted) hover:text-(--app-button-hover) focus:outline-none'}
	>
		<span>{currentLabel}</span>
		<i
			class="fa-solid fa-chevron-down text-[11px] text-(--app-muted) transition-transform duration-150"
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
			onclick={() => closeMenu(false)}
		></button>

		<!-- Dropdown -->
		<div
			id={menuId}
			role="listbox"
			class="fixed z-[61] min-w-[10rem] overflow-y-auto overscroll-contain rounded-sm border border-(--app-border) bg-(--app-card) shadow-2xl shadow-black/40"
			style="{menuTop !== null ? `top:${menuTop}px;` : ''}{menuBottom !== null
				? `bottom:${menuBottom}px;`
				: ''} right:{menuRight}px; max-height:{menuMaxHeight}px;"
			transition:fly={{
				y: menuBottom !== null ? 4 : -4,
				duration: $reducedMotion ? 0 : 140,
				easing: cubicOut
			}}
		>
			{#each options as opt, i (opt.value)}
				<button
					bind:this={optionEls[i]}
					id={optId(i)}
					type="button"
					role="option"
					aria-selected={opt.value === value}
					tabindex="-1"
					onclick={() => select(opt.value)}
					onmousemove={() => (activeIndex = i)}
					class={`flex w-full items-center justify-between gap-6 px-4 py-2 text-left text-sm transition ${
						i === activeIndex ? 'bg-(--app-hover)' : ''
					} ${
						opt.value === value
							? 'font-medium text-(--app-button-hover)'
							: 'text-(--app-muted) hover:text-(--app-button-hover)'
					}`}
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
