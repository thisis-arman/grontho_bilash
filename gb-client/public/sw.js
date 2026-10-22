// Grontho Bilash service worker: makes the site installable as an app,
// speeds up repeat visits, and shows a friendly page when offline.
//
// - Pages: always fetched from the network (so a new deploy shows up
//   straight away); the offline page is shown only if that fails.
// - /assets/* (hashed by Vite, never change) and /fonts/*: cache first.
// - API calls and anything from another site: not touched.
//
// Bump VERSION when changing this file so old caches are cleared.
const VERSION = "v1";
const STATIC_CACHE = `gb-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/logo-96.png", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("gb-") && k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isCacheableAsset = (url) =>
  url.origin === self.location.origin && (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/"));

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
  }
});
