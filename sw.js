const CACHE_NAME = "demir-lingoo-v5";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./giriş-ekranı.jpg",
  "./ikon-192.png",
  "./ikon-512.png",
  "./mascot.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("demir-lingoo-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.ok) cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      if (event.request.mode === "navigate") {
        return (await cache.match("./index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
