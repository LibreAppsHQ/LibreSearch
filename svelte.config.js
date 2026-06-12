import vercelAdapter from '@sveltejs/adapter-vercel';
import nodeAdapter from '@sveltejs/adapter-node';

// Self-hosted builds (Docker, bare Node) use adapter-node; Vercel stays the
// default. Select with `ADAPTER=node pnpm build` — the Dockerfile sets this.
const adapter = process.env.ADAPTER === 'node' ? nodeAdapter : vercelAdapter;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		version: {
			// Poll for new deploys every 5 min. When a new version is detected the
			// `updated` store flips, letting us force a full page reload on the next
			// navigation instead of fetching stale chunks from the old build.
			pollInterval: 300_000
		}
	}
};

export default config;
