export {};

const CACHE_NAME = 'remixense-v1';
const urlsToCache = ['/', '/manifest.json'];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache: Cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);
  const isFunctionsAnalyze = url.pathname.includes('/functions/v1/analyze-audio');
  const isSupabaseStorage = url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object');

  if (isFunctionsAnalyze || isSupabaseStorage) {
    // Network-only to avoid caching analysis endpoints and storage assets
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response: Response | undefined) => {
      return response || fetch(event.request);
    })
  );
});
