<script lang="ts">
	import { onMount } from 'svelte';
	import { settingsStore, type Setting, type SettingCategory } from '$lib/stores/settings';
	import { themeStore, themes, themeKeys } from '$lib/stores/theme';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type SettingGroup = { ids: string[] };

	const categoryGroups: Record<SettingCategory, SettingGroup[]> = {
		general: [
			{ ids: ['open-new-tab', 'autocomplete', 'save-history'] },
			{ ids: ['keyboard-shortcut', 'default-tab'] },
			{ ids: ['instant-answers'] },
			{ ids: ['enable-cache'] }
		],
		appearance: [
			{ ids: ['show-favicons', 'show-sitelinks', 'show-age'] },
			{ ids: ['compact-results', 'reduce-motion'] },
			{ ids: ['results-per-page', 'temperature-unit'] },
			{ ids: ['show-clock', 'datetime-format', 'clock-show-date', 'clock-show-seconds'] }
		],
		privacy: [
			{ ids: ['block-ads', 'block-trackers'] },
			{ ids: ['safe-search', 'filter-ads'] },
			{ ids: ['strip-tracking', 'no-referrer'] },
			{ ids: ['request-method'] },
			{ ids: ['save-history', 'history-retention'] },
			{ ids: ['search-region'] }
		]
	};

	const sections: Array<{ id: SettingCategory; label: string }> = [
		{ id: 'general', label: 'General' },
		{ id: 'appearance', label: 'Appearance' },
		{ id: 'privacy', label: 'Privacy and Safety' }
	];

	let activeSection = $state<SettingCategory>('general');
	let draft = $state<Setting[]>([]);
	let isDirty = $state(false);
	let savedFeedback = $state(false);

	onMount(() => {
		settingsStore.load();
		draft = structuredClone($settingsStore);

		// Scrollspy: highlight the tab for whichever section is in view.
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSection = (entry.target as HTMLElement).dataset.section as SettingCategory;
					}
				}
			},
			{ rootMargin: '-30% 0px -60% 0px', threshold: 0 }
		);
		for (const section of sections) {
			const el = document.getElementById(`sec-${section.id}`);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	});

	function scrollToSection(id: SettingCategory) {
		activeSection = id;
		document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function getSetting(id: string): Setting | undefined {
		return draft.find((s) => s.id === id);
	}

	function handleToggle(id: string) {
		draft = draft.map((s) =>
			s.id === id && s.type === 'toggle' ? { ...s, checked: !s.checked } : s
		);
		isDirty = true;
	}

	function handleSelect(id: string, value: string) {
		draft = draft.map((s) => (s.id === id && s.type === 'select' ? { ...s, value } : s));
		isDirty = true;
	}

	function save() {
		settingsStore.save(draft);
		isDirty = false;
		savedFeedback = true;
		setTimeout(() => (savedFeedback = false), 2500);
	}

	function discard() {
		draft = structuredClone($settingsStore);
		isDirty = false;
	}

	function resetAll() {
		if (confirm('Reset all settings to their defaults?')) {
			settingsStore.reset();
			draft = structuredClone($settingsStore);
			isDirty = false;
		}
	}

	function exportSettings() {
		const json = JSON.stringify($settingsStore, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const blobUrl = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = blobUrl;
		anchor.download = 'Launchpad-settings.json';
		anchor.click();
		URL.revokeObjectURL(blobUrl);
	}

	let importFileInput = $state<HTMLInputElement | null>(null);

	function triggerImport() {
		importFileInput?.click();
	}

	function handleImport(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const parsed = JSON.parse(e.target?.result as string) as unknown;
				if (settingsStore.import(parsed)) {
					draft = structuredClone($settingsStore);
					isDirty = false;
				}
			} catch {
				// Silently ignore malformed files
			}
		};
		reader.readAsText(file);
		// Reset so the same file can be re-imported if needed
		(event.currentTarget as HTMLInputElement).value = '';
	}
</script>

<svelte:head>
	<title>Settings - Launchpad</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#snippet toggleSwitch(id: string, checked: boolean, label: string)}
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label}
		onclick={() => handleToggle(id)}
		class={checked
			? 'relative h-6 w-11 shrink-0 rounded-full bg-[#2dd4bf] transition-colors'
			: 'relative h-6 w-11 shrink-0 rounded-full bg-[var(--app-hover)] ring-1 ring-[var(--app-border)] transition-colors ring-inset'}
	>
		<span
			class={checked
				? 'absolute top-0.5 left-0.5 h-5 w-5 translate-x-5 rounded-full bg-white shadow transition-transform'
				: 'absolute top-0.5 left-0.5 h-5 w-5 translate-x-0 rounded-full bg-[var(--app-muted)] transition-transform'}
		></span>
	</button>
{/snippet}

<header class="sticky top-0 z-30">
	<!-- Black brand bar -->
	<div class="bg-black">
		<div class="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
			<div class="flex items-center gap-4 py-3">
				<a href="/" class="shrink-0">
					<img src="/2.svg" alt="Launchpad logo" class="h-10 w-25" />
				</a>
				<div class="h-7 w-px bg-white/25"></div>
				<span class="text-lg font-medium text-white">Settings</span>
				<SiteMenu class="ml-auto shrink-0 text-white!" />
			</div>
		</div>
	</div>

	<!-- Underline tab bar (scroll anchors) -->
	<div class="border-b border-[var(--app-border)] bg-[var(--app-background)]/95 backdrop-blur">
		<div class="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
			<nav
				class="-mb-px flex [scrollbar-width:none] items-center gap-7 overflow-x-auto [&::-webkit-scrollbar]:hidden"
			>
				{#each sections as section (section.id)}
					<button
						type="button"
						onclick={() => scrollToSection(section.id)}
						class={activeSection === section.id
							? 'shrink-0 border-b-2 border-[var(--app-accent)] py-3 text-sm font-semibold text-[var(--app-text)]'
							: 'shrink-0 border-b-2 border-transparent py-3 text-sm font-medium text-[var(--app-muted)] transition hover:text-[var(--app-text)]'}
					>
						{section.label}
					</button>
				{/each}
			</nav>
		</div>
	</div>
</header>

<main class="min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
	<div class="mx-auto w-full max-w-[1100px] px-4 py-10 pb-32 sm:px-6">
		<div class="flex flex-col gap-12 lg:flex-row lg:items-start">
			<!-- Left: stacked sections -->
			<div class="min-w-0 flex-1 space-y-14">
				{#each sections as section (section.id)}
					<section id={`sec-${section.id}`} data-section={section.id} class="scroll-mt-32">
						<h2 class="mb-5 text-3xl font-bold tracking-tight">{section.label}</h2>

						<!-- Theme picker lives at the top of Appearance -->
						{#if section.id === 'appearance'}
							<div class="mb-5 flex flex-wrap gap-3">
								{#each themeKeys as key (key)}
									{@const theme = themes[key]}
									<button
										type="button"
										onclick={() => themeStore.setTheme(key)}
										class="group flex flex-col items-center gap-2"
									>
										<div
											class="relative h-[76px] w-[104px] overflow-hidden rounded-xl border-2 transition"
											style="background:{theme.background}; border-color:{$themeStore === key
												? theme.accent
												: 'rgba(255,255,255,0.12)'}"
										>
											<div
												class="mx-3 mt-3 h-1.5 rounded-full"
												style="background:{theme.accent}"
											></div>
											<div
												class="mx-3 mt-2 h-1 rounded-full opacity-40"
												style="background:{theme.text}"
											></div>
											<div
												class="mx-3 mt-1.5 h-1 w-3/4 rounded-full opacity-25"
												style="background:{theme.text}"
											></div>
											<div
												class="mx-3 mt-1.5 h-1 w-1/2 rounded-full opacity-25"
												style="background:{theme.text}"
											></div>
											{#if $themeStore === key}
												<div
													class="absolute bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-[#4a9eff]"
												>
													<i class="fa-solid fa-check text-[9px] text-white"></i>
												</div>
											{/if}
										</div>
										<span
											class="text-xs font-medium transition"
											style={$themeStore === key
												? `color:${theme.accent}`
												: 'color:var(--app-muted)'}>{theme.name}</span
										>
									</button>
								{/each}
							</div>
						{/if}

						<div
							class="divide-y divide-[var(--app-border)] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]"
						>
							{#each categoryGroups[section.id] as group, gi (gi)}
								{#each group.ids as id (id)}
									{@const setting = getSetting(id)}
									{#if setting}
										<div class="flex items-center justify-between gap-8 px-5 py-4">
											<div class="min-w-0 space-y-0.5">
												<p class="text-[15px] font-semibold text-[var(--app-text)]">
													{setting.name}
												</p>
												<p class="text-sm leading-5 text-[var(--app-muted)]">
													{setting.description}
												</p>
											</div>

											{#if setting.type === 'toggle'}
												{@render toggleSwitch(setting.id, setting.checked, setting.name)}
											{:else if setting.type === 'select'}
												<CustomSelect
													value={setting.value}
													options={setting.options}
													onchange={(val) => handleSelect(setting.id, val)}
												/>
											{/if}
										</div>
									{/if}
								{/each}

								{#if gi < categoryGroups[section.id].length - 1}
									<div class="border-t border-[var(--app-border)]"></div>
								{/if}
							{/each}
						</div>
					</section>
				{/each}
			</div>

			<!-- Right: save panel -->
			<aside class="w-full shrink-0 lg:sticky lg:top-32 lg:w-80">
				<button
					type="button"
					onclick={save}
					disabled={!isDirty}
					class={isDirty
						? 'w-full rounded-lg bg-[var(--app-accent)] px-5 py-2.5 text-sm font-semibold text-[#111111] transition hover:opacity-90'
						: 'w-full cursor-default rounded-lg bg-[var(--app-accent)]/40 px-5 py-2.5 text-sm font-semibold text-[#111111]/70'}
				>
					{savedFeedback ? 'Settings saved ✓' : 'Save your settings'}
				</button>

				<p class="mt-4 text-sm leading-6 text-[var(--app-muted)]">
					This saves your settings <span class="font-semibold text-[var(--app-text)]"
						>locally in your browser</span
					>. Launchpad never stores them on a server, and nothing is tied to your identity.
				</p>

				{#if isDirty}
					<button
						type="button"
						onclick={discard}
						class="mt-3 text-sm text-[var(--app-muted)] underline-offset-2 transition hover:text-[var(--app-text)] hover:underline"
					>
						Discard changes
					</button>
				{/if}

				<hr class="my-6 border-[var(--app-border)]" />

				<p class="mb-3 text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase">
					Back up your settings
				</p>
				<div class="space-y-2">
					<button
						type="button"
						onclick={exportSettings}
						class="flex w-full items-center gap-2 rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
					>
						<i class="fa-solid fa-download text-xs"></i>
						Export settings
					</button>
					<button
						type="button"
						onclick={triggerImport}
						class="flex w-full items-center gap-2 rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
					>
						<i class="fa-solid fa-upload text-xs"></i>
						Import settings
					</button>
					<button
						type="button"
						onclick={resetAll}
						class="flex w-full items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
					>
						<i class="fa-solid fa-rotate-left text-xs"></i>
						Reset all to defaults
					</button>
				</div>

				<input
					bind:this={importFileInput}
					type="file"
					accept="application/json,.json"
					class="sr-only"
					onchange={handleImport}
				/>
			</aside>
		</div>
	</div>
</main>

<SiteFooter />
