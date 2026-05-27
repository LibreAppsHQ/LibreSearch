<script lang="ts">
	// reCAPTCHA-style badge: collapsed to the logo tile on the right edge,
	// slides out on hover/focus to reveal the protection notice.
	// NOTE: the logo is a placeholder image for now — swap `placeholderLogo`.
	const Logo = '/altcha.svg';
</script>

<div class="group fixed top-1/2 right-0 z-40 -translate-y-1/2">
	<div
		class="translate-x-[calc(100%-4.25rem)] rounded-l-2xl p-2.5 transition-transform duration-300 ease-out group-focus-within:translate-x-0 group-hover:translate-x-0"
	>
		<div class="flex items-center gap-3 rounded-lg bg-[#4a72f5] py-2 pr-4 pl-2">
			<span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white">
				<img src={Logo} alt="ALTCHA logo placeholder" class="h-8 w-8" />
			</span>

			<!-- Text -->
			<div class="leading-tight whitespace-nowrap text-white">
				<p class="text-sm">
					protected by
					<a
						href="https://altcha.org"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold hover:underline">ALTCHA</a
					>
				</p>
				<p class="mt-0.5 text-xs text-white/85">
					<a href="/privacy" class="hover:underline">Privacy</a>
					<span class="mx-0.5">·</span>
					<a href="/terms" class="hover:underline">Terms</a>
				</p>
			</div>
		</div>
	</div>
</div>
