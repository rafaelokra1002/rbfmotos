/* RBF Motos - Service Worker
 * Estratégias:
 *  - Navegação (HTML): network-first com fallback ao cache (garante update quando online)
 *  - Assets estáticos (mesmo domínio): stale-while-revalidate
 *  - Requisições a outras origens (ex.: API em outra porta): network-only, sem cache
 */
const CACHE_VERSION = 'rbf-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Só lidamos com GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignorar outras origens (API em outra porta, CDNs, fontes) -> deixa o navegador tratar
  if (url.origin !== self.location.origin) return;

  // Navegação de páginas -> network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(OFFLINE_URL, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL).then((r) => r || caches.match(request))),
    );
    return;
  }

  // Assets estáticos -> stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
