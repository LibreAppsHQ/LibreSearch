<script lang="ts">
	let { size = 'md', class: className = '' }: { size?: 'sm' | 'md' | 'lg'; class?: string } = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-8 w-8'
	};
</script>

<i
	class="fa-solid fa-circle-notch fa-spin {sizeClasses[size]} {className}"
	aria-hidden="true"
></i>
