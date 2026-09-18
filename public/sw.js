/* TerroirTrail installability service worker.
 *
 * Network-only by design: production deploys remain immediately authoritative
 * and we do not retain stale application HTML, JS, producer data, or user state.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(fetch(event.request));
});
