<script lang="ts">
	let {
		loading = false,
		disabled = false,
		type = 'button',
		variant = 'primary',
		children,
		onclick,
		class: className = ''
	}: {
		loading?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit';
		variant?: 'primary' | 'secondary' | 'ghost';
		children: any;
		onclick?: () => void;
		class?: string;
	} = $props();

	const variantClasses = {
		primary: 'bg-(--app-accent) text-[#111] hover:opacity-90',
		secondary: 'border border-(--app-border) text-(--app-button) hover:bg-(--app-hover)',
		ghost: 'text-(--app-button) hover:bg-(--app-hover)'
	};
</script>

<button
	{type}
	{disabled}
	onclick={onclick}
	class="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition disabled:opacity-40 {variantClasses[variant]} {className}"
	aria-busy={loading}
>
	{#if loading}
		<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>
	{/if}
	<span class={loading ? 'opacity-90' : ''}>{@render children()}</span>
</button>
