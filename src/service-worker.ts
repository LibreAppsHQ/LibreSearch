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

function networkFirst(request: Request): Promise<Response> {
	return fetch(request)
		.then((response) => {
			if (response.ok) {
				const clone = response.clone();
				caches.open(CACHE).then((cache) => cache.put(request, clone));
			}
			return response;
		})
		.catch(() => caches.match(request).then((cached) => cached ?? Response.error()));
}

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	if (event.request.method !== 'GET') return;
	if (url.origin !== self.location.origin) return;
	if (url.pathname.startsWith('/api/')) return;

	// HTML + client navigations must be network-first. Cache-first HTML keeps
	// old asset hashes after a deploy → 404 on /_app/immutable/* chunks.
	const acceptsHtml = event.request.headers.get('accept')?.includes('text/html');
	if (
		event.request.mode === 'navigate' ||
		acceptsHtml ||
		url.pathname.startsWith('/_app/') ||
		ASSETS.some((a) => url.pathname.endsWith(a.replace(/^\//, '')))
	) {
		event.respondWith(networkFirst(event.request));
		return;
	}

	// Static files (images, fonts, favicon): cache-first.
	event.respondWith(
		caches.match(event.request).then((cached) => cached || fetch(event.request))
	);
});
