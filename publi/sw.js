/* RBF Motos - Service Worker
 * Estratégia network-first (evita servir versões antigas após deploy):
 *  - Navegação (HTML): network-first, cache só como fallback offline
 *  - Assets (JS/CSS/img): network-first (nomes com hash → sempre pega o novo),
 *    cache usado apenas quando offline
 *  - Outras origens (API em outra porta, CDNs): ignora (deixa o navegador tratar)
 */
const CACHE_VERSION = 'rbf-v3';
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

// ===== WEB PUSH: notificações do portal do cliente =====
self.addEventListener('push', (event) => {
  let data = { title: 'RBF Motos', body: 'Você tem uma nova atualização.', url: '/portal' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/file.png',
      badge: '/file.png',
      data: { url: data.url || '/portal' },
      vibrate: [100, 50, 100],
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const alvo = (event.notification.data && event.notification.data.url) || '/portal';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/portal') && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(alvo);
    }),
  );
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
