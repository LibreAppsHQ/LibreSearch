/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `libresearch-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

function cachePut(request: Request, response: Response): void {
	const clone = response.clone();
	void caches
		.open(CACHE)
		.then((cache) => cache.put(request, clone))
		.catch(() => {});
}

function networkFirst(request: Request): Promise<Response> {
	return fetch(request)
		.then((response) => {
			if (response.ok) cachePut(request, response);
			return response;
		})
		.catch(() =>
			caches
				.match(request)
				.then((cached) => cached ?? new Response('', { status: 504, statusText: 'Offline' }))
		);
}

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	if (event.request.method !== 'GET') return;
	if (url.origin !== self.location.origin) return;
	if (url.pathname.startsWith('/api/')) return;

	// SSR routes (/search, etc.) must bypass the SW. Intercepting navigations
	// turns transient network errors into page-breaking "Failed to fetch".
	if (event.request.mode === 'navigate') return;
	if (event.request.headers.get('accept')?.includes('text/html')) return;

	const isAppAsset =
		url.pathname.startsWith('/_app/') ||
		ASSETS.some((a) => url.pathname.endsWith(a.replace(/^\//, '')));

	if (isAppAsset) {
		event.respondWith(networkFirst(event.request));
		return;
	}

	// Static files (images, fonts, favicon): cache-first.
	event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)));
});
