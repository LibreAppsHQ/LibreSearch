<script lang="ts">
	import { onMount } from 'svelte';
	import { settingsStore, getToggle, getSelect } from '$lib/stores/settings';
	import { formatDate, formatTime } from '$lib/datetime';

	let show = $derived(getToggle($settingsStore, 'show-clock', false));
	let format = $derived(getSelect($settingsStore, 'datetime-format', 'mdy12'));
	let showDate = $derived(getToggle($settingsStore, 'clock-show-date', true));
	let showSeconds = $derived(getToggle($settingsStore, 'clock-show-seconds', false));

	let now = $state(new Date());

	onMount(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	let timeLabel = $derived(formatTime(now, format, showSeconds));
	let dateLabel = $derived(formatDate(now, format));
</script>

{#if show}
	<div class="leading-none tabular-nums select-none" aria-label="Current date and time">
		<div class="text-5xl font-bold tracking-tight text-(--app-text) sm:text-6xl">
			{timeLabel}
		</div>
		{#if showDate}
			<div class="mt-2 text-base font-medium text-(--app-muted) sm:text-lg">
				{dateLabel}
			</div>
		{/if}
	</div>
{/if}
