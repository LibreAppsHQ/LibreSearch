<script lang="ts">
	import { reducedMotion } from '$lib/stores/motion';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { class: triggerClass = '' } = $props<{ class?: string }>();

	let open = $state(false);

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
			title: 'Products',
			links: [{ label: 'LibreSearch Extension', href: '/extension', icon: '/ex-icon.png' }]
		},
		{
			title: 'Resources',
			links: [
				{ label: 'About Us', href: '/about', icon: null },
				{ label: 'Blog', href: '/blog', icon: null },
				{ label: 'Compare', href: '/compare', icon: null },
				{ label: 'Press', href: '/press', icon: null },
				{ label: 'Contact', href: '/contact', icon: null },
				{ label: 'Privacy Policy', href: '/privacy', icon: null },
				{ label: 'Terms of Service', href: '/terms', icon: null },
				{ label: 'Click me if interested in UI', href: '/design' },
				{ label: 'Donate', href: '/donate'}
			]
		}
	];
</script>

<button
	type="button"
	aria-label="Open menu"
	aria-expanded={open}
	onclick={() => (open = true)}
	class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-(--app-text) transition hover:bg-(--app-hover) {triggerClass}"
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
			class="fixed top-0 right-0 z-50 h-full w-[16rem] overflow-y-auto border-l border-(--app-border) bg-(--app-background) px-5 py-5 shadow-2xl shadow-black/50"
			transition:fly={{ x: 260, duration: $reducedMotion ? 0 : 220, easing: cubicOut }}
		>
			<div class="flex justify-end">
				<button
					type="button"
					aria-label="Close menu"
					onclick={() => (open = false)}
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--app-text) transition hover:bg-(--app-hover)"
				>
					<i class="fa-solid fa-xmark text-xl"></i>
				</button>
			</div>

			<div class="mt-2 space-y-6">
				{#each menuSections as section, i (i)}
					<div>
						<p
							class="px-0.5 text-xs font-semibold tracking-widest text-(--app-muted) uppercase"
						>
							{section.title}
						</p>

						<div class="mt-2 space-y-1">
							{#each section.links as link, i (i)}
								<a
									href={link.href}
									onclick={() => (open = false)}
									class="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-(--app-text) transition hover:bg-(--app-hover)"
								>
									{#if link.icon}
										{#if link.icon.startsWith('/')}
											<img src={link.icon} alt="" class="h-5 w-5 rounded-[4px]" />
										{:else}
											<i class="fa-solid {link.icon} w-5 text-center text-(--app-muted)"></i>
										{/if}
									{/if}
									{link.label}
								</a>
							{/each}
						</div>
					</div>

					{#if i < menuSections.length - 1}
						<div class="border-t border-[#3a435b]" />
					{/if}
				{/each}
			</div>
		</aside>
	</div>
{/if}
