const CACHE_NAME = 'qanater-v1';
const ASSETS_TO_CACHE = [
  '/qanater/',
  '/qanater/index.html',
  '/qanater/css/style.css',
  '/qanater/js/app.js',
  '/qanater/js/ads.js',
  '/qanater/manifest.json',
  '/qanater/data/services.json',
  '/qanater/data/listings.json',
  '/qanater/data/ads.json',
  '/qanater/pages/service.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => console.log('Cache install error', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Stale-while-revalidate strategy for data files, Cache First for others
  const isDataFile = event.request.url.includes('.json');
  
  if (isDataFile) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        }).catch(() => {
          return cache.match(event.request);
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        });
      }).catch(() => {
        // Fallback for offline if needed
        return new Response('Offline Content Not Available');
      })
    );
  }
});
