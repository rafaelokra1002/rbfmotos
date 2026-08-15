/* RBF Motos - Service Worker
 * Estratégia network-first (evita servir versões antigas após deploy):
 *  - Navegação (HTML): network-first, cache só como fallback offline
 *  - Assets (JS/CSS/img): network-first (nomes com hash → sempre pega o novo),
 *    cache usado apenas quando offline
 *  - Outras origens (API em outra porta, CDNs): ignora (deixa o navegador tratar)
 */
const CACHE_VERSION = 'rbf-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.add(OFFLINE_URL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)),
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
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação -> network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(OFFLINE_URL, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL).then((r) => r || caches.match(request))),
    );
    return;
  }

  // Assets -> network-first (evita chunk antigo após deploy)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
