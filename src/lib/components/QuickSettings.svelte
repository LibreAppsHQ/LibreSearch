<script lang="ts">
	import { reducedMotion } from '$lib/stores/motion';
	import { settingsStore, getToggle, getSelect } from '$lib/stores/settings';
	import { themeStore, themes, themeKeys } from '$lib/stores/theme';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let open = $state(false);

	let theme = $derived($themeStore);
	let safesearch = $derived(getSelect($settingsStore, 'safe-search', 'moderate'));
	let showClock = $derived(getToggle($settingsStore, 'show-clock', false));
	let autocomplete = $derived(getToggle($settingsStore, 'autocomplete', true));
	let openNewTab = $derived(getToggle($settingsStore, 'open-new-tab', false));
	let stripTracking = $derived(getToggle($settingsStore, 'strip-tracking', false));

	const safeSearchOptions = [
		{ label: 'Strict', value: 'strict' },
		{ label: 'Moderate', value: 'moderate' },
		{ label: 'Off', value: 'low' }
	];

	const toggles = $derived([
		{ id: 'show-clock', label: 'Homepage clock', checked: showClock, icon: 'fa-clock' },
		{
			id: 'autocomplete',
			label: 'Autocomplete',
			checked: autocomplete,
			icon: 'fa-wand-magic-sparkles'
		},
		{
			id: 'open-new-tab',
			label: 'Open in new tab',
			checked: openNewTab,
			icon: 'fa-arrow-up-right-from-square'
		},
		{
			id: 'strip-tracking',
			label: 'Strip tracking URLs',
			checked: stripTracking,
			icon: 'fa-link-slash'
		}
	]);

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	$effect(() => {
		if (!open) return;
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') open = false;
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div use:portal class="fixed right-6 bottom-14 z-50">
	{#if open}
		<button
			type="button"
			class="fixed inset-0 -z-10"
			aria-label="Close quick settings"
			onclick={() => (open = false)}
		></button>
	{/if}

	{#if open}
		<div
			class="absolute right-0 bottom-[calc(100%+0.875rem)] z-10 w-72 origin-bottom-right"
			role="menu"
			aria-label="Quick settings"
			transition:fly={{ y: 10, duration: $reducedMotion ? 0 : 200, easing: cubicOut }}
		>
			<div
				class="overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-card) shadow-[0_12px_48px_-8px_rgba(0,0,0,0.55)] ring-1 ring-(--app-border)/40"
			>
				<div class="flex items-center justify-between px-4 py-3">
					<p class="text-sm font-semibold text-(--app-text)">Quick settings</p>
					<button
						type="button"
						aria-label="Close"
						onclick={() => (open = false)}
						class="inline-flex h-7 w-7 items-center justify-center rounded-md text-(--app-muted) transition hover:bg-(--app-hover) hover:text-(--app-button-hover)"
					>
						<i class="fa-solid fa-xmark text-sm"></i>
					</button>
				</div>

				<div class="space-y-4 px-3 pb-3">
					<!-- Theme -->
					<div class="rounded-xl bg-(--app-surface) p-2.5">
						<p
							class="mb-2 px-1 text-[10px] font-semibold tracking-wider text-(--app-muted) uppercase"
						>
							Theme
						</p>
						<div class="grid grid-cols-4 gap-1.5">
							{#each themeKeys as key (key)}
								{@const palette = themes[key]}
								<button
									type="button"
									role="menuitemradio"
									aria-checked={theme === key}
									onclick={() => themeStore.setTheme(key)}
									class="flex flex-col items-center gap-1 rounded-lg py-1.5 transition {theme ===
									key
										? 'bg-(--app-accent)/15 ring-1 ring-(--app-accent)/50'
										: 'hover:bg-(--app-hover)'}"
								>
									<span
										class="h-5 w-5 rounded-full ring-1 ring-(--app-border)"
										style="background: {palette.background}; box-shadow: inset 0 0 0 2px {palette.accent}"
									></span>
									<span class="text-[9px] font-medium text-(--app-muted)">{palette.name}</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Safe search -->
					<div class="rounded-xl bg-(--app-surface) p-2.5">
						<p
							class="mb-2 px-1 text-[10px] font-semibold tracking-wider text-(--app-muted) uppercase"
						>
							Safe search
						</p>
						<div class="flex gap-1" role="group" aria-label="Safe search level">
							{#each safeSearchOptions as opt (opt.value)}
								<button
									type="button"
									role="menuitemradio"
									aria-checked={safesearch === opt.value}
									onclick={() => settingsStore.select('safe-search', opt.value)}
									class="flex-1 rounded-md px-1 py-1.5 text-[11px] font-medium transition {safesearch ===
									opt.value
										? 'bg-(--app-accent) text-[#0d1019]'
										: 'text-(--app-muted) hover:bg-(--app-hover) hover:text-(--app-button-hover)'}"
								>
									{opt.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Toggles -->
					<div class="overflow-hidden rounded-xl bg-(--app-surface)">
						{#each toggles as t, i (t.id)}
							<div
								class="flex items-center justify-between gap-3 px-3 py-2.5 {i > 0
									? 'border-t border-(--app-border)/60'
									: ''}"
							>
								<span class="flex min-w-0 items-center gap-2 text-[13px] text-(--app-text)">
									<i
										class="fa-solid {t.icon} w-3.5 shrink-0 text-center text-[10px] text-(--app-muted)"
									></i>
									<span class="truncate">{t.label}</span>
								</span>
								<button
									type="button"
									role="menuitemcheckbox"
									aria-checked={t.checked}
									aria-label={t.label}
									onclick={() => settingsStore.toggle(t.id)}
									class={t.checked
										? 'relative h-5 w-9 shrink-0 rounded-full bg-[#2dd4bf] transition-colors'
										: 'relative h-5 w-9 shrink-0 rounded-full bg-(--app-hover) ring-1 ring-(--app-border) transition-colors ring-inset'}
								>
									<span
										class={t.checked
											? 'absolute top-0.5 left-0.5 h-4 w-4 translate-x-4 rounded-full bg-(--app-toggle-knob) shadow transition-transform'
											: 'absolute top-0.5 left-0.5 h-4 w-4 translate-x-0 rounded-full bg-(--app-muted) transition-transform'}
									></span>
								</button>
							</div>
						{/each}
					</div>
				</div>

				<div class="border-t border-(--app-border)/60 px-4 py-2.5">
					<a
						href="/settings"
						role="menuitem"
						onclick={() => (open = false)}
						class="flex items-center justify-between text-xs font-medium text-(--app-muted) transition hover:text-(--app-accent)"
					>
						<span class="flex items-center gap-1.5">
							<i class="fa-solid fa-gear text-[10px]"></i>
							All settings
						</span>
						<i class="fa-solid fa-arrow-right text-[10px]"></i>
					</a>
				</div>
			</div>

			<!-- Caret pointing to trigger -->
			<div
				class="absolute right-4 -bottom-1.5 h-3 w-3 rotate-45 border-r border-b border-(--app-border) bg-(--app-card)"
				aria-hidden="true"
			></div>
		</div>
	{/if}

	<button
		type="button"
		aria-label="Quick settings"
		aria-expanded={open}
		aria-haspopup="true"
		onclick={() => (open = !open)}
		class="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-(--app-muted) transition {open
			? 'text-(--app-accent)'
			: 'hover:text-(--app-secondary)'}"
	>
		<i class="fa-solid fa-gear text-[15px]"></i>
	</button>
</div>
