<script lang="ts">
	import { env } from '$env/dynamic/public';
	import SiteMenu from '$lib/components/SiteMenu.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	// Web3Forms posts the form to a public endpoint, then forwards the message
	// to whatever inbox is tied to the access key. The key is intentionally
	// browser-visible — Web3Forms expects this. When unset, the form is hidden
	// and users are pointed at the direct email address instead.
	const accessKey = env.PUBLIC_WEB3FORMS_KEY ?? '';
	const formEnabled = accessKey.length > 0;

	const subjectOptions = [
		{ value: 'General', label: 'General inquiry' },
		{ value: 'Privacy', label: 'Privacy / data request' },
		{ value: 'Security', label: 'Security disclosure' },
		{ value: 'Press', label: 'Press / media' }
	];

	let name = $state('');
	let email = $state('');
	let subject = $state('General');
	let message = $state('');
	// Honeypot — real users leave this empty; spam bots fill every field.
	let botcheck = $state('');
	let submitting = $state(false);
	let result = $state<{ type: 'success' | 'error'; msg: string } | null>(null);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (botcheck) return; // silently drop bot submissions

		if (!name.trim() || !email.trim() || !message.trim()) {
			result = { type: 'error', msg: 'Please fill in your name, email, and message.' };
			return;
		}
		if (!accessKey) {
			result = {
				type: 'error',
				msg: 'Contact form isn’t configured yet. Email info@libresearch.ca directly.'
			};
			return;
		}

		submitting = true;
		result = null;
		try {
			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', accept: 'application/json' },
				body: JSON.stringify({
					access_key: accessKey,
					name,
					email,
					subject: `[${subject}] ${name} via LibreSearch`,
					message,
					from_name: 'LibreSearch Contact Form',
					replyto: email,
					botcheck
				})
			});
			const data = (await response.json().catch(() => null)) as {
				success?: boolean;
				message?: string;
			} | null;

			if (response.ok && data?.success) {
				result = { type: 'success', msg: 'Thanks — your message is on its way. We’ll reply soon.' };
				name = '';
				email = '';
				subject = 'General';
				message = '';
			} else {
				result = {
					type: 'error',
					msg: data?.message ?? 'Couldn’t send. Try again, or email info@libresearch.ca.'
				};
			}
		} catch {
			result = {
				type: 'error',
				msg: 'Network error. Please try again or email info@libresearch.ca.'
			};
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Contact - LibreSearch</title>
	<meta
		name="description"
		content="Get in touch with the LibreSearch team — feedback, privacy questions, security disclosures, or press inquiries."
	/>
	<link rel="canonical" href="https://libresearch.ca/contact" />
	<meta property="og:title" content="Contact - LibreSearch" />
	<meta
		property="og:description"
		content="Reach the LibreSearch team about privacy, security, press, or general feedback."
	/>
	<meta property="og:url" content="https://libresearch.ca/contact" />
</svelte:head>

<!-- Sticky header — matches /about and /compare -->
<header class="sticky top-0 z-20 bg-[var(--app-background)]">
	<div class="mx-auto w-full max-w-[1400px] px-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center py-5">
			<a href="/" class="justify-self-start">
				<Logo class="h-10 w-25 rounded-full" />
			</a>
			<p class="justify-self-center text-2xl font-bold tracking-tight text-[var(--app-text)]">
				Contact
			</p>
			<SiteMenu class="justify-self-end" />
		</div>
	</div>
</header>

<main class="bg-[var(--app-background)] text-[var(--app-text)]">
	<!-- Hero -->
	<section class="mx-auto w-full max-w-[1100px] px-6 pt-12 pb-10 text-center sm:pt-20">
		<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Get in touch</h1>
		<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--app-muted)] sm:text-lg">
			Privacy questions, security reports, press, or general feedback — drop us a line and we'll
			reply soon.
		</p>
	</section>

	<section class="mx-auto w-full max-w-[1100px] px-6 pb-20">
		<div class="grid gap-8 lg:grid-cols-[1fr_360px]">
			{#if formEnabled}
				<!-- Form -->
				<form
					onsubmit={submit}
					class="rounded-2xl border border-[var(--app-border)] bg-[#171b25]/80 p-7 backdrop-blur-sm"
					novalidate
				>
					<!-- Honeypot: real users never see/fill this; bots autofill it. -->
					<input
						type="text"
						name="botcheck"
						bind:value={botcheck}
						tabindex="-1"
						autocomplete="off"
						aria-hidden="true"
						style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;"
					/>

					<div class="grid gap-5 sm:grid-cols-2">
						<label class="block">
							<span class="mb-2 block text-sm font-medium text-[var(--app-text)]">Name</span>
							<input
								type="text"
								bind:value={name}
								required
								autocomplete="name"
								maxlength="100"
								class="w-full rounded-xl border border-[var(--app-border)] bg-transparent px-4 py-2.5 text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent)]/30 focus:outline-none"
								placeholder="Your name"
							/>
						</label>
						<label class="block">
							<span class="mb-2 block text-sm font-medium text-[var(--app-text)]">Email</span>
							<input
								type="email"
								bind:value={email}
								required
								autocomplete="email"
								maxlength="200"
								class="w-full rounded-xl border border-[var(--app-border)] bg-transparent px-4 py-2.5 text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent)]/30 focus:outline-none"
								placeholder="you@example.com"
							/>
						</label>
					</div>

					<label class="mt-5 block">
						<span class="mb-2 block text-sm font-medium text-[var(--app-text)]">Topic</span>
						<select
							bind:value={subject}
							class="w-full rounded-xl border border-[var(--app-border)] bg-[#171b25] px-4 py-2.5 text-[var(--app-text)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent)]/30 focus:outline-none"
						>
							{#each subjectOptions as opt (opt.value)}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</label>

					<label class="mt-5 block">
						<span class="mb-2 block text-sm font-medium text-[var(--app-text)]">Message</span>
						<textarea
							bind:value={message}
							required
							rows="6"
							maxlength="5000"
							class="w-full resize-y rounded-xl border border-[var(--app-border)] bg-transparent px-4 py-3 text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent)]/30 focus:outline-none"
							placeholder="What's on your mind?"
						></textarea>
						<span class="mt-1 block text-xs text-[var(--app-muted)]">{message.length} / 5000</span>
					</label>

					{#if result}
						<div
							class={result.type === 'success'
								? 'mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300'
								: 'mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300'}
							role={result.type === 'success' ? 'status' : 'alert'}
						>
							{result.msg}
						</div>
					{/if}

					<button
						type="submit"
						disabled={submitting}
						class="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--app-accent)] px-6 py-2.5 text-sm font-semibold text-[#111] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if submitting}
							<i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
							Sending…
						{:else}
							<i class="fa-solid fa-paper-plane text-xs"></i>
							Send message
						{/if}
					</button>
				</form>
			{:else}
				<!-- Form disabled: backend not configured. Point users at email. -->
				<div
					class="rounded-2xl border border-[var(--app-border)] bg-[#171b25]/80 p-7 backdrop-blur-sm"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400"
					>
						<i class="fa-solid fa-envelope-open-text text-xl"></i>
					</div>
					<h2 class="text-xl font-semibold text-[var(--app-text)]">
						Contact form isn't configured yet
					</h2>
					<p class="mt-3 text-sm leading-7 text-[var(--app-muted)]">
						We haven't wired up the web form on this site yet. In the meantime, please email us
						directly — we read every message and reply within a couple of business days.
					</p>
					<a
						href="mailto:info@libresearch.ca"
						class="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--app-accent)] px-6 py-2.5 text-sm font-semibold text-[#111] transition hover:opacity-90"
					>
						<i class="fa-solid fa-paper-plane text-xs"></i>
						info@libresearch.ca
					</a>
				</div>
			{/if}

			<!-- Sidebar: direct email + notes -->
			<aside class="space-y-6">
				<div
					class="rounded-2xl border border-[var(--app-border)] bg-[#171b25]/80 p-6 backdrop-blur-sm"
				>
					<div
						class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400"
					>
						<i class="fa-solid fa-envelope text-xl"></i>
					</div>
					<h2 class="text-lg font-semibold text-[var(--app-text)]">Or email us directly</h2>
					<p class="mt-2 text-sm leading-7 text-[var(--app-muted)]">
						Prefer your own mail client? Reach us straight at:
					</p>
					<a
						href="mailto:info@libresearch.ca"
						class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--app-accent)] hover:underline"
					>
						info@libresearch.ca
						<i class="fa-solid fa-arrow-right text-xs"></i>
					</a>
				</div>

				<div class="rounded-2xl border border-[var(--app-border)] bg-[#171b25]/60 p-6">
					<h2 class="mb-3 text-sm font-semibold tracking-wider text-[var(--app-muted)] uppercase">
						A few notes
					</h2>
					<ul class="space-y-3 text-sm leading-6 text-[var(--app-muted)]">
						<li>
							<span class="text-[var(--app-text)]">Response time.</span> Usually within two business days.
							Security reports get triaged within 72 hours.
						</li>
						<li>
							<span class="text-[var(--app-text)]">PGP.</span> Ask in your first message and we'll send
							a key for encrypted follow-ups.
						</li>
						<li>
							<span class="text-[var(--app-text)]">Bugs.</span> Non-sensitive bugs and feature requests
							are best filed on our repo.
						</li>
					</ul>
				</div>
			</aside>
		</div>
	</section>
</main>

<SiteFooter />
