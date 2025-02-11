const CACHE_NAME = "otakarakuta-researcher-v1"
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/manifest.json",
  "/button.mp3",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
      )
    }),
  )
})

self.addEventListener("fetch", (event) => {
  // マニフェストファイルの特別な処理
  if (event.request.url.endsWith("manifest.json")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Manifest fetch failed")
          }
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        }),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

