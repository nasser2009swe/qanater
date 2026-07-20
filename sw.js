const CACHE_NAME = 'qanater-v0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/ads.js',
  './js/ui.js',
  './js/service.js',
  './js/detail.js',
  './js/supabase-config.js',
  './manifest.json',
  './pages/service.html',
  './pages/detail.html'
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
  // If request is for Supabase API, let it pass through network directly
  if (event.request.url.includes('supabase.co')) {
    return;
  }
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
});
