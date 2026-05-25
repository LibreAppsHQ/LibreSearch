<script lang="ts">
	import { onMount } from 'svelte';
	import {
		settingsStore,
		getToggle,
		type Setting,
		type SettingCategory
	} from '$lib/stores/settings';
	import { themeStore, themes, themeKeys } from '$lib/stores/theme';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import CustomSelect from '$lib/components/CustomSelect.svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { reducedMotion } from '$lib/stores/motion';

	let query = $state('');
	let safesearch = $derived(getToggle($settingsStore, 'safe-search'));

	type SettingGroup = { ids: string[] };

	const categoryGroups: Record<SettingCategory, SettingGroup[]> = {
		general: [
			{ ids: ['open-new-tab', 'autocomplete', 'save-history'] },
			{ ids: ['keyboard-shortcut', 'default-tab'] },
			{ ids: ['enable-cache'] }
		],
		appearance: [
			{ ids: ['show-favicons', 'show-sitelinks', 'show-age'] },
			{ ids: ['compact-results', 'reduce-motion'] }
		],
		privacy: [
			{ ids: ['block-ads', 'block-trackers'] },
			{ ids: ['safe-search', 'filter-ads'] },
			{ ids: ['strip-tracking', 'no-referrer'] },
			{ ids: ['save-history', 'history-retention'] },
			{ ids: ['search-region'] }
		]
	};

	const tabs: Array<{ id: SettingCategory; label: string }> = [
		{ id: 'general', label: 'General' },
		{ id: 'appearance', label: 'Appearance' },
		{ id: 'privacy', label: 'Privacy' }
	];

	let activeTab = $state<SettingCategory>('general');
	let draft = $state<Setting[]>([]);
	let isDirty = $state(false);
	let savedFeedback = $state(false);

	onMount(() => {
		settingsStore.load();
		draft = structuredClone($settingsStore);
	});

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
		anchor.download = 'arcsearch-settings.json';
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
	<title>Settings - ArcSearch</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<header
	class="sticky top-0 z-20 border-b border-[var(--app-border)] bg-[var(--app-background)]/95 backdrop-blur"
>
	<div class="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
		<div class="flex items-center gap-3 py-3 sm:gap-5">
			<a href="/" class="hidden shrink-0 sm:block">
				<img src="/logo1.png" alt="ArcSearch logo" class="h-10 w-25 rounded-full" />
			</a>
			<div class="max-w-2xl flex-1">
				<SearchBar
					bind:query
					compact={true}
					placeholder="Search the web..."
					action="/search"
					showButton={true}
					{safesearch}
				/>
			</div>
			<SiteMenu class="shrink-0" />
		</div>
	</div>
</header>

<main class="min-h-screen bg-[var(--app-background)] text-[var(--app-text)]">
	<div class="mx-auto w-full max-w-[1100px] px-4 py-8 pb-32 sm:px-6 sm:py-12">
		<!-- Page title + tabs row -->
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
			<h1 class="text-2xl font-bold tracking-tight">Search Settings</h1>
			<div class="flex items-center gap-2 overflow-x-auto">
				{#each tabs as tab (tab.id)}
					<button
						type="button"
						onclick={() => (activeTab = tab.id)}
						class={activeTab === tab.id
							? 'rounded-full bg-[var(--app-hover)] px-4 py-1.5 text-sm font-semibold text-[var(--app-text)] ring-1 ring-white/20'
							: 'rounded-full px-4 py-1.5 text-sm font-medium text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]'}
					>
						{tab.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="flex gap-8">
			<!-- Left: settings list -->
			<div class="min-w-0 flex-1 animate-fade-in">
				<!-- Theme picker (Appearance tab only) -->
				{#if activeTab === 'appearance'}
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
									<div class="mx-3 mt-3 h-1.5 rounded-full" style="background:{theme.accent}"></div>
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
									style={$themeStore === key ? `color:${theme.accent}` : 'color:var(--app-muted)'}
									>{theme.name}</span
								>
							</button>
						{/each}
					</div>
				{/if}

				<div class="divide-y divide-[var(--app-border)] border border-[var(--app-border)] bg-[var(--app-surface)]">
					{#each categoryGroups[activeTab] as group, gi (gi)}
						{#each group.ids as id (id)}
							{@const setting = getSetting(id)}
							{#if setting}
								<div class="flex items-center justify-between gap-8 px-5 py-4">
									<!-- Label + description -->
									<div class="min-w-0 space-y-0.5">
										<p class="text-[15px] font-semibold text-[var(--app-text)]">{setting.name}</p>
										<p class="text-sm leading-5 text-[var(--app-muted)]">{setting.description}</p>
									</div>

									<!-- Control -->
									{#if setting.type === 'toggle'}
										<button
											type="button"
											onclick={() => handleToggle(setting.id)}
											class={setting.checked
												? 'shrink-0 rounded-lg bg-[var(--app-accent)] px-4 py-1.5 text-sm font-semibold text-[#111111] transition hover:opacity-90'
												: 'shrink-0 rounded-lg bg-[var(--app-hover)] px-4 py-1.5 text-sm font-semibold text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]'}
										>
											{setting.checked ? 'On' : 'Off'}
										</button>
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

						<!-- Divider between groups (not after last group) -->
						{#if gi < categoryGroups[activeTab].length - 1}
							<div class="border-t-2 border-[var(--app-border)]"></div>
						{/if}
					{/each}
				</div>

				<!-- Action buttons row -->
				<div class="mt-6 flex flex-wrap items-center gap-3">
					<button
						type="button"
						onclick={exportSettings}
						class="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
					>
						<i class="fa-solid fa-download text-xs"></i>
						Export settings
					</button>

					<button
						type="button"
						onclick={triggerImport}
						class="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
					>
						<i class="fa-solid fa-upload text-xs"></i>
						Import settings
					</button>

					<button
						type="button"
						onclick={resetAll}
						class="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
					>
						<i class="fa-solid fa-rotate-left text-xs"></i>
						Reset all to defaults
					</button>
				</div>

				<!-- Hidden file input for import -->
				<input
					bind:this={importFileInput}
					type="file"
					accept="application/json,.json"
					class="sr-only"
					onchange={handleImport}
				/>
			</div>

			<!-- Right: sidebar cards -->
			<div class="hidden w-72 shrink-0 space-y-4 lg:block">
				<!-- Privacy card -->
				<div class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-center">
					<div
						class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400"
					>
						<i class="fa-solid fa-shield-halved text-2xl"></i>
					</div>
					<p class="text-base font-semibold text-[var(--app-text)]">Private by design</p>
					<p class="mt-2 text-sm leading-6 text-[var(--app-muted)]">
						ArcSearch never logs your queries. All settings are stored locally in your browser.
					</p>
				</div>

				<!-- Keyboard shortcuts card -->
				<div class="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
					<p class="mb-3 text-sm font-semibold text-[var(--app-text)]">Keyboard shortcuts</p>
					<dl class="space-y-2">
						{#each [['/', 'Focus search'], ['Esc', 'Close suggestions'], ['↑ ↓', 'Navigate suggestions'], ['Enter', 'Select suggestion']] as [key, desc]}
							<div class="flex items-center justify-between gap-2">
								<dd class="text-xs text-[var(--app-muted)]">{desc}</dd>
								<dt>
									<kbd
										class="rounded border border-[var(--app-border)] bg-[var(--app-hover)] px-1.5 py-0.5 font-mono text-xs text-[var(--app-text)]"
										>{key}</kbd
									>
								</dt>
							</div>
						{/each}
					</dl>
				</div>
			</div>
		</div>
	</div>
</main>

<!-- Sticky save bar -->
{#if isDirty || savedFeedback}
	<div
		class="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--app-border)] bg-[var(--app-background)]/95 px-6 py-4 backdrop-blur"
		transition:fly={{ y: 60, duration: $reducedMotion ? 0 : 220, easing: cubicOut }}
	>
		<div class="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
			{#if savedFeedback}
				<span class="flex items-center gap-2 text-sm text-emerald-400">
					<i class="fa-solid fa-check text-xs"></i>
					Settings saved
				</span>
				<div></div>
			{:else}
				<span class="text-sm text-[var(--app-muted)]">You have unsaved changes</span>
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={discard}
						class="rounded-xl px-4 py-2 text-sm text-[var(--app-muted)] transition hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
					>
						Discard
					</button>
					<button
						type="button"
						onclick={save}
						class="rounded-xl bg-[var(--app-accent)] px-5 py-2 text-sm font-semibold text-[#111111] transition hover:opacity-90"
					>
						Save changes
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
