const CACHE_VERSION = "v3"; // Cambia versión cuando actualices
const CACHE_NAME = `kocobot-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/CHAT-ACR0/",
  "/CHAT-ACR0/index.html",
  "/CHAT-ACR0/icon-192.png",
  "/CHAT-ACR0/icon-512.png"
];

// 🔹 INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key))) // 🔥 Borra TODOS los caches
    ).then(() =>
      caches.open(CACHE_NAME).then(cache =>
        cache.addAll(STATIC_ASSETS)
      )
    )
  );
});

// 🔹 ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// 🔹 FETCH (Network First)
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone); // 🔄 Actualiza caché con versión nueva
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // Si no hay internet usa caché
  );
});
