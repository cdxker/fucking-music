const CACHE_NAME = "fucking-music-v1"

// Assets to cache on install
const PRECACHE_ASSETS = ["/", "/less", "/more"]

// Install - precache essential assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

// Fetch - network first, fallback to cache
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url)

    // Skip non-GET requests
    if (event.request.method !== "GET") return

    // Skip API routes (except audio proxy which we want to cache)
    if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/audio/proxy")) {
        return
    }

    // For audio proxy requests, try cache first (audio files are large)
    if (url.pathname.startsWith("/api/audio/proxy")) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached
                return fetch(event.request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone()
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone)
                        })
                    }
                    return response
                })
            })
        )
        return
    }

    // For app assets: network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone)
                    })
                }
                return response
            })
            .catch(() => {
                return caches.match(event.request)
            })
    )
})
