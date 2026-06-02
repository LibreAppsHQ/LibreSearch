import { env } from '$env/dynamic/private';
import { Agent, buildConnector, fetch as undiciFetch, type Dispatcher } from 'undici';
import { SocksClient, type SocksProxy } from 'socks';

// Routes upstream requests (Brave, Nominatim, DuckDuckGo suggest) through a Tor
// SOCKS5 proxy when the user enables "Route searches through Tor" in settings.
//
// Tor is *not* bundled — the deployment must expose a reachable SOCKS5 proxy and
// point TOR_PROXY_URL at it (e.g. `socks5h://127.0.0.1:9050` for a local `tor`
// daemon, or a managed Tor SOCKS endpoint in production). When no proxy is
// configured or it can't be reached, callers fall back to a direct fetch and the
// search still works — it just isn't anonymised. Use `socks5h://` so DNS is
// resolved by the proxy (over Tor), never locally, which avoids DNS leaks.

const DEFAULT_TOR_PROXY = 'socks5h://127.0.0.1:9050';

function getProxyUrl(): string | null {
	const raw = env.TOR_PROXY_URL?.trim();
	// An explicit empty string disables Tor entirely even if the toggle is on.
	if (raw === '') return null;
	return raw || DEFAULT_TOR_PROXY;
}

export function isTorConfigured(): boolean {
	return getProxyUrl() !== null;
}

function parseProxy(url: string): SocksProxy {
	const parsed = new URL(url);
	// socks5h: proxy does the DNS resolution (no local lookup → no DNS leak).
	const type = parsed.protocol === 'socks4:' || parsed.protocol === 'socks4a:' ? 4 : 5;
	const proxy: SocksProxy = {
		host: parsed.hostname,
		port: Number(parsed.port) || 9050,
		type
	};
	if (parsed.username) proxy.userId = decodeURIComponent(parsed.username);
	if (parsed.password) proxy.password = decodeURIComponent(parsed.password);
	return proxy;
}

// undici needs a TLS connector to wrap the raw socket for https targets.
const tlsConnector = buildConnector({});

let cachedDispatcher: { url: string; dispatcher: Dispatcher } | null = null;

function getDispatcher(): Dispatcher | null {
	const url = getProxyUrl();
	if (!url) return null;
	if (cachedDispatcher && cachedDispatcher.url === url) return cachedDispatcher.dispatcher;

	const proxy = parseProxy(url);

	const dispatcher = new Agent({
		connect: (opts, callback) => {
			const { hostname, protocol } = opts;
			const port = Number(opts.port) || (protocol === 'https:' ? 443 : 80);

			SocksClient.createConnection({
				proxy,
				command: 'connect',
				destination: { host: hostname, port },
				timeout: 10_000
			})
				.then(({ socket }) => {
					if (protocol === 'https:') {
						// Hand the tunnelled socket to undici's TLS connector so the
						// certificate is verified against the real destination host.
						tlsConnector({ ...opts, httpSocket: socket }, callback);
					} else {
						callback(null, socket);
					}
				})
				.catch((err) => callback(err as Error, null));
		}
	});

	cachedDispatcher = { url, dispatcher };
	return dispatcher;
}

// A `fetch`-shaped function that tunnels through Tor. Returns null when no proxy
// is configured so callers can fall back to a direct fetch.
export function getTorFetch(): typeof fetch | null {
	const dispatcher = getDispatcher();
	if (!dispatcher) return null;
	const torFetch = (async (
		input: Parameters<typeof fetch>[0],
		init?: Parameters<typeof fetch>[1]
	) => {
		try {
			return await undiciFetch(input as Parameters<typeof undiciFetch>[0], {
				...(init as Parameters<typeof undiciFetch>[1]),
				dispatcher
			});
		} catch (err) {
			// A failure to reach the SOCKS proxy (e.g. no Tor daemon running) surfaces
			// as a generic "fetch failed". Re-tag it so callers can show an actionable
			// message instead of a vague backend error — and so we never silently fall
			// back to a direct, de-anonymised connection.
			const proxy = getProxyUrl();
			throw new Error(
				`TOR_PROXY_UNREACHABLE: could not connect to the Tor proxy at ${proxy}. Is a Tor daemon running?`,
				{ cause: err }
			);
		}
	}) as unknown as typeof fetch;
	return torFetch;
}
