<script lang="ts">
	import { reducedMotion } from '$lib/stores/motion';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { class: triggerClass = '' } = $props<{ class?: string }>();

	let open = $state(false);

	// Move the drawer to <body> so it isn't trapped inside an ancestor
	// that establishes a containing block (e.g. backdrop-blur headers).
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	const menuSections = [
		{
			title: 'Search',
			links: [{ label: 'Settings', href: '/settings', icon: 'fa-gear' }]
		},
		{
			title: 'Personalize',
			links: [{ label: 'Themes', href: '/themes', icon: 'fa-palette' }]
		},
		{
			title: 'Resources',
			links: [
				{ label: 'About Us', href: '/about', icon: null },
				{ label: 'Privacy Policy', href: '/privacy', icon: null }
			]
		}
	];
</script>

<button
	type="button"
	aria-label="Open menu"
	aria-expanded={open}
	onclick={() => (open = true)}
	class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-text)] transition hover:bg-[var(--app-hover)] {triggerClass}"
>
	<i class="fa-solid fa-bars text-xl"></i>
</button>

{#if open}
	<div use:portal>
		<button
			type="button"
			class="fixed inset-0 z-40 bg-black/40"
			aria-label="Close menu"
			onclick={() => (open = false)}
			transition:fly={{ duration: $reducedMotion ? 0 : 150 }}
		></button>

		<aside
			class="fixed top-0 right-0 z-50 h-full w-[min(20rem,85vw)] overflow-y-auto border-l border-[var(--app-border)] bg-[var(--app-background)] px-6 py-6 shadow-2xl shadow-black/50"
			transition:fly={{ x: 320, duration: $reducedMotion ? 0 : 220, easing: cubicOut }}
		>
			<div class="flex justify-end">
			<button
				type="button"
				aria-label="Close menu"
				onclick={() => (open = false)}
				class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
			>
				<i class="fa-solid fa-xmark text-xl"></i>
			</button>
		</div>

		<div class="mt-2 space-y-7">
			{#each menuSections as section}
				<div>
					<p class="px-1 text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase">
						{section.title}
					</p>
					<div class="mt-3 space-y-1">
						{#each section.links as link}
							<a
								href={link.href}
								onclick={() => (open = false)}
								class="flex items-center gap-3 rounded-lg px-2 py-2.5 text-base text-[var(--app-text)] transition hover:bg-[var(--app-hover)]"
							>
								{#if link.icon}
									<i class="fa-solid {link.icon} w-5 text-center text-[var(--app-muted)]"></i>
								{/if}
								{link.label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</aside>
	</div>
{/if}
