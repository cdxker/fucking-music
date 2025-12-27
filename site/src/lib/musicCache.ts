import type { TrackId } from "@/shared/types"

const DB_NAME = "fucking-music-cache"
const STORE_NAME = "audio-files"
const DB_VERSION = 1

export class MusicCache {
    private db: IDBDatabase | null = null
    private initialized = false

    async init(): Promise<void> {
        if (this.initialized) return
        if (typeof window === "undefined") return // SSR guard

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onerror = () => reject(request.error)

            request.onsuccess = () => {
                this.db = request.result
                this.initialized = true
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME)
                }
            }
        })
    }

    async getAudio(trackId: TrackId): Promise<Blob | null> {
        if (!this.db) return null

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, "readonly")
            const store = transaction.objectStore(STORE_NAME)
            const request = store.get(trackId)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result || null)
        })
    }

    async cacheAudio(trackId: TrackId, blob: Blob): Promise<void> {
        if (!this.db) return

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, "readwrite")
            const store = transaction.objectStore(STORE_NAME)
            const request = store.put(blob, trackId)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }

    async getOrFetch(trackId: TrackId, streamUrl: string): Promise<string> {
        const cached = await this.getAudio(trackId)
        if (cached) {
            return URL.createObjectURL(cached)
        }

        const proxyUrl = `/api/audio/proxy?url=${encodeURIComponent(streamUrl)}`
        const response = await fetch(proxyUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status}`)
        }

        const blob = await response.blob()

        await this.cacheAudio(trackId, blob)

        return URL.createObjectURL(blob)
    }

    async clearCache(): Promise<void> {
        if (!this.db) return

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, "readwrite")
            const store = transaction.objectStore(STORE_NAME)
            const request = store.clear()

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }

    async getCacheSize(): Promise<number> {
        if (!this.db) return 0

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, "readonly")
            const store = transaction.objectStore(STORE_NAME)
            const request = store.openCursor()
            let totalSize = 0

            request.onerror = () => reject(request.error)
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
                if (cursor) {
                    const blob = cursor.value as Blob
                    totalSize += blob.size
                    cursor.continue()
                } else {
                    resolve(totalSize)
                }
            }
        })
    }
}

// Singleton instance
export const musicCache = new MusicCache()
