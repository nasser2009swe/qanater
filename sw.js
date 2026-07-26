const CACHE_NAME = 'qanater-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/ads.js',
  './js/ui.js',
  './js/service.js',
  './js/detail.js',
  './js/marketplace.js',
  './js/ad_detail.js',
  './js/supabase-config.js',
  './manifest.json',
  './pages/service.html',
  './pages/detail.html',
  './pages/extra.html',
  './pages/marketplace.html',
  './pages/add_ad.html',
  './pages/ad_detail.html',
  './admin/dashboard.html',
  './admin/login.html'
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
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Pass through Supabase and Chrome Extensions
  if (event.request.url.includes('supabase.co') || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  // Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cache valid responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(err => {
        console.warn('Network fetch failed for', event.request.url, err);
      });

      // Return cache instantly if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
