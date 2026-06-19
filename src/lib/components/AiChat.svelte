<script lang="ts">
	import { onMount, tick } from 'svelte';

	let { query } = $props<{ query: string }>();

	type Message = {
		role: 'user' | 'assistant' | 'system';
		content: string;
		sources?: Array<{ title: string; url: string }>;
		isStreaming?: boolean;
	};

	let messages = $state<Message[]>([]);
	let inputValue = $state('');
	let isLoading = $state(false);
	let scrollContainer = $state<HTMLDivElement>();
	let abortController = $state<AbortController | null>(null);

	// Initialize with the search query as first message
	$effect(() => {
		if (query && messages.length === 0) {
			sendMessage(query, false);
		}
	});

	async function scrollToBottom() {
		await tick();
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}

	async function sendMessage(content: string, isFollowUp = true) {
		if (!content.trim() || isLoading) return;

		// Add user message
		if (isFollowUp) {
			messages = [...messages, { role: 'user', content: content.trim() }];
		} else {
			messages = [{ role: 'user', content: content.trim() }];
		}
		inputValue = '';
		isLoading = true;

		// Add placeholder for assistant response
		messages = [...messages, { role: 'assistant', content: '', isStreaming: true }];
		await scrollToBottom();

		abortController = new AbortController();

		try {
			const response = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: messages
						.filter((m) => !m.isStreaming)
						.map((m) => ({ role: m.role, content: m.content }))
				}),
				signal: abortController.signal
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const data = await response.json();

			// Update the last message with the response
			messages = messages.map((m, i) =>
				i === messages.length - 1
					? {
							role: 'assistant',
							content: data.answer || 'Sorry, I could not generate a response.',
							sources: data.sources,
							isStreaming: false
						}
					: m
				);
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				messages = messages.filter((m) => !m.isStreaming);
			} else {
				messages = messages.map((m, i) =>
					i === messages.length - 1
						? {
								role: 'assistant',
								content: 'Sorry, there was an error generating a response. Please try again.',
								isStreaming: false
							}
						: m
					);
			}
		} finally {
			isLoading = false;
			abortController = null;
			await scrollToBottom();
		}
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		sendMessage(inputValue);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage(inputValue);
		}
	}

	function stopGeneration() {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	}

	onMount(() => {
		scrollToBottom();
	});
</script>

<div class="flex h-full flex-col">
	<!-- Chat messages - fills remaining space -->
	<div bind:this={scrollContainer} class="flex-1 space-y-6 overflow-y-auto px-4 pt-4">
		{#if messages.length === 0}
			<div class="flex h-full flex-col items-center justify-center text-center">
				<div
					class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--app-accent)/10"
				>
					<i class="fa-solid fa-robot text-2xl text-(--app-accent)"></i>
				</div>
				<h3 class="mb-2 text-lg font-semibold text-(--app-text)">AI Mode</h3>
				<p class="max-w-sm text-sm text-(--app-muted)">
					Ask follow-up questions and explore topics in depth. The AI uses search results to
					provide accurate, up-to-date answers.
				</p>
			</div>
		{:else}
			{#each messages as message, i (i)}
				<div class="flex gap-4">
					{#if message.role === 'user'}
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--app-accent) text-[#111]"
						>
							<i class="fa-solid fa-user text-xs"></i>
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium text-(--app-text)">You</p>
							<div class="mt-1 text-[15px] leading-relaxed text-(--app-text)">
								{message.content}
							</div>
						</div>
					{:else}
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--app-accent)/10"
						>
							<i class="fa-solid fa-robot text-xs text-(--app-accent)"></i>
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium text-(--app-accent)">Assistant</p>
							{#if message.isStreaming}
								<div class="mt-2 flex items-center gap-2">
									<div class="flex gap-1">
										<div
											class="h-2 w-2 animate-bounce rounded-full bg-(--app-accent)"
											style="animation-delay: 0ms"
										></div>
										<div
											class="h-2 w-2 animate-bounce rounded-full bg-(--app-accent)"
											style="animation-delay: 150ms"
										></div>
										<div
											class="h-2 w-2 animate-bounce rounded-full bg-(--app-accent)"
											style="animation-delay: 300ms"
										></div>
									</div>
									<button
										type="button"
										onclick={stopGeneration}
										class="ml-2 text-xs text-(--app-muted) hover:text-(--app-text)"
									>
										Stop
									</button>
								</div>
							{:else}
								<div
									class="prose prose-sm mt-1 max-w-none text-[15px] leading-relaxed text-(--app-text)"
								>
									{message.content}
								</div>
								{#if message.sources && message.sources.length > 0}
									<div class="mt-3 flex flex-wrap gap-2">
										{#each message.sources as source (source.url)}
											<a
												href={source.url}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-1.5 rounded-full border border-(--app-border) bg-(--app-surface) px-3 py-1 text-xs text-(--app-muted) transition hover:border-(--app-accent) hover:text-(--app-accent)"
											>
												<i class="fa-solid fa-link text-[10px]"></i>
												<span class="max-w-[150px] truncate">{source.title}</span>
											</a>
										{/each}
									</div>
								{/if}
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<!-- Input area - always at bottom -->
	<div class="border-t border-(--app-border) bg-(--app-background) px-4 py-3">
		<form onsubmit={handleSubmit} class="relative max-w-4xl mx-auto">
			<textarea
				bind:value={inputValue}
				onkeydown={handleKeydown}
				placeholder="Ask a follow-up question..."
				rows="2"
				class="w-full resize-none rounded-xl border border-(--app-border) bg-(--app-surface) px-4 py-3 pr-12 text-sm text-(--app-text) placeholder:text-(--app-muted) focus:border-(--app-accent) focus:outline-none"
				disabled={isLoading}
			></textarea>
			<button
				type="submit"
				disabled={isLoading || !inputValue.trim()}
				aria-label="Send message"
				class="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg bg-(--app-accent) text-[#111] transition hover:opacity-80 disabled:opacity-40"
			>
				<i class="fa-solid fa-paper-plane text-xs"></i>
			</button>
		</form>
		<p class="mt-2 text-center text-xs text-(--app-muted)">
			AI can make mistakes. Verify important information.
		</p>
	</div>
</div>
