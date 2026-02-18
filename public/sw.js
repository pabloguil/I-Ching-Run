/**
 * I Ching PWA — Service Worker
 *
 * Estrategia:
 * - Shell de la app (HTML/JS/CSS): Cache-first con red como fallback
 * - API (/api/*): Network-only (siempre en vivo)
 * - Google Fonts: Stale-while-revalidate
 */

const CACHE_NAME = 'iching-v1';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
];

// ---- Instalación: precachear assets críticos ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ---- Activación: limpiar caches antiguas ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ---- Fetch: estrategia por tipo de recurso ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API: siempre red, sin cachear
  if (url.pathname.startsWith('/api/')) return;

  // Google Fonts: stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Assets de la app: cache-first
  if (request.method === 'GET') {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline: devolver el shell de la app para rutas de navegación
    if (request.mode === 'navigate') {
      const fallback = await caches.match(OFFLINE_URL);
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || (await fetchPromise) || new Response('Offline', { status: 503 });
}
