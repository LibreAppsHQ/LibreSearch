<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
</script>

<footer class="border-t border-[var(--app-border)] bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1100px] px-6 py-12">
		<div class="flex flex-col gap-8 sm:flex-row sm:justify-between">
			<!-- Brand -->
			<div class="max-w-xs space-y-3">
				<a href="/" class="flex items-center gap-3">
					<div class="h-28 w-35"><Logo class="h-45 w-40" /></div>
				</a>
				<p class="text-sm leading-6 text-[var(--app-muted)]">
					A private search engine that puts you in control. No tracking, no profiles, no ads.
				</p>
			</div>

			<!-- Links -->
			<div class="flex gap-16">
				<div class="space-y-3">
					<p class="text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase">
						Search
					</p>
					<ul class="space-y-2 text-sm">
						<li>
							<a href="/" class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								>Home</a
							>
						</li>
						<li>
							<a
								href="/search?q=news"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">News</a
							>
						</li>
						<li>
							<a
								href="/search?q=videos&t=videos"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Videos</a
							>
						</li>
						<li>
							<a
								href="/search?q=images&t=images"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Images</a
							>
						</li>
						<li>
							<a
								href="/syntax"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Syntax</a
							>
						</li>
					</ul>
				</div>
				<div class="space-y-3">
					<p class="text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase">
						Product
					</p>
					<ul class="space-y-2 text-sm">
						<li>
							<a
								href="/about"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">About</a
							>
						</li>
						<li>
							<a
								href="/donate"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Donate</a
							>
						</li>
						<li>
							<a
								href="/settings"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Settings</a
							>
						</li>
						<li>
							<a
								href="/settings#appearance"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Themes</a
							>
						</li>
						<li>
							<a
								href="/extension"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								>Extension</a
							>
						</li>
						<li>
							<a
								href="/changelog"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								>Changelog</a
							>
						</li>
					</ul>
				</div>
				<div class="space-y-3">
					<p class="text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase">
						Company
					</p>
					<ul class="space-y-2 text-sm">
						<li>
							<a
								href="https://arcbase.one"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								target="_blank">Arcbase</a
							>
						</li>
						<li>
							<a
								href="https://ai.arcbase.one"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								target="_blank">OtterAI</a
							>
						</li>
						<li>
							<a
								href="/press"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Press</a
							>
						</li>
						<li>
							<a
								href="/enterprise"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								>Enterprise</a
							>
						</li>
						<li>
							<a
								href="/contact"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								>Contact</a
							>
						</li>
						<li>
							<a
								href="/terms"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Terms</a
							>
						</li>
					</ul>
				</div>
				<div class="space-y-3">
					<p class="text-xs font-semibold tracking-widest text-[var(--app-muted)] uppercase">
						Trust
					</p>
					<ul class="space-y-2 text-sm">
						<li>
							<a
								href="/privacy"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Privacy</a
							>
						</li>
						<li>
							<a
								href="/trust"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								>Trust Center</a
							>
						</li>
						<li>
							<a
								href="/transparency"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
								>Transparency</a
							>
						</li>
						<li>
							<a
								href="/security"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Security</a
							>
						</li>
						<li>
							<a
								href="/status"
								class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]">Status</a
							>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div
			class="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[var(--app-border)] pt-8 sm:flex-row sm:items-center"
		>
			<div class="flex items-center gap-3">
				<p class="text-xs text-[var(--app-muted)]">
					&copy; {new Date().getFullYear()} LibreSearch. Built for privacy.
				</p>
				<span class="text-[var(--app-muted)]">·</span>
				<span
					class="rounded-full border border-[var(--app-border)] bg-[#171b25]/80 px-2 py-0.5 text-xs text-[var(--app-muted)] backdrop-blur-sm"
					>v0.4.5</span
				>
			</div>
			<div class="flex items-center gap-4">
				<a
					href="https://github.com/Arcbasehq/LibreSearch"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
				>
					<i class="fa-brands fa-github text-base"></i>
				</a>
				<a
					href="https://mastodon.social/@libresearch"
					target="_blank"
					rel="me noopener noreferrer"
					aria-label="Mastodon"
					class="text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
				>
					<i class="fa-brands fa-mastodon text-base"></i>
				</a>
			</div>
		</div>
	</div>
</footer>
