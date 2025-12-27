const CACHE_NAME = "fucking-music-v1"

const PRECACHE_ASSETS = ["/", "/less", "/more"]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS)
        })
    )
    self.skipWaiting()
})

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

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url)

    if (event.request.method !== "GET") return

    if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/audio/proxy")) {
        return
    }

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
