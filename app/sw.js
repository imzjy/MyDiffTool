const VERSION = '1.0.0';
const CACHE_NAME = 'diff-tool-v' + VERSION;
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/bootstrap.min.css',
  './css/diff2html.min.css',
  './js/jquery.min.js',
  './js/lodash.min.js',
  './js/diff.min.js',
  './js/diff2html-ui.min.js',
  './js/main.js',
  './favicon/favicon.ico',
  './favicon/android-chrome-192x192.png',
  './favicon/android-chrome-512x512.png',
  './manifest.json'
];

// Install service worker and cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Force waiting service worker to become active
        console.log('[ServiceWorker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients
      self.clients.claim(),
      // Remove old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(() => {
      console.log('[ServiceWorker] Activated version:', VERSION);
      // Notify all clients about the update
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: VERSION
          });
        });
      });
    })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            // Add the response to cache for future offline use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch((error) => {
            console.log('[ServiceWorker] Fetch failed:', error);
            // You might want to return a custom offline page here
            return new Response('Offline - Unable to fetch resource');
          });
      })
  );
}); 