import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load SENTRY_* from .env.local (and shell) at config time so the
	// source-map upload plugin can authenticate during the build.
	const env = loadEnv(mode, process.cwd(), 'SENTRY_');
	const authToken = env.SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN;

	return {
		// sentrySvelteKit() must come before sveltekit(). Source maps upload only
		// when SENTRY_AUTH_TOKEN is present; otherwise the plugin no-ops the upload.
		plugins: [
			sentrySvelteKit({
				sourceMapsUploadOptions: {
					org: env.SENTRY_ORG || process.env.SENTRY_ORG,
					project: env.SENTRY_PROJECT || process.env.SENTRY_PROJECT,
					authToken
				}
			}),
			tailwindcss(),
			sveltekit()
		],
		// Pre-bundle Sentry so it isn't discovered late (avoids a dev re-optimize
		// + full reload, which surfaces as 504 "Outdated Optimize Dep").
		optimizeDeps: { include: ['@sentry/sveltekit'] },
		server: {
			fs: {
				allow: ['.']
			}
		}
	};
});
