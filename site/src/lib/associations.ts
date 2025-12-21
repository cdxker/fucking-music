import { db } from "./store"
import type { FuckingTrack, PlaylistId, TrackId } from "@/shared/types"

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

/**
 * Randomly links songs in the library to create left/right associations.
 * This creates a discovery path through the music collection by assigning
 * random neighbors to each track from different playlists.
 */
export function shuffleAssociations(): void {
    // Get all playlists and tracks
    const playlists = db.getPlaylists()
    if (playlists.length === 0) return

    // Collect all tracks from all playlists
    const allTracks: FuckingTrack[] = []
    const tracksByPlaylist = new Map<PlaylistId, FuckingTrack[]>()

    for (const playlist of playlists) {
        const tracks = db.getTracks(playlist.id)
        tracksByPlaylist.set(playlist.id, tracks)
        allTracks.push(...tracks)
    }

    if (allTracks.length === 0) return

    // Shuffle all tracks to create random associations
    const shuffledTracks = shuffleArray(allTracks)

    // For each track, assign random left/right neighbors
    for (let i = 0; i < shuffledTracks.length; i++) {
        const currentTrack = shuffledTracks[i]
        const nextTracks: Record<PlaylistId, TrackId> = {}

        // Get the track from its original playlist
        const playlistTracks = tracksByPlaylist.get(
            currentTrack.id.split("-").slice(0, -1).join("-") as PlaylistId
        )

        // Find the current track's playlist by checking which playlist contains it
        let currentPlaylistId: PlaylistId | undefined
        for (const [playlistId, tracks] of tracksByPlaylist.entries()) {
            if (tracks.some((t) => t.id === currentTrack.id)) {
                currentPlaylistId = playlistId
                break
            }
        }

        if (!currentPlaylistId) continue

        // Assign left neighbor (previous in shuffled array)
        const leftIndex = i === 0 ? shuffledTracks.length - 1 : i - 1
        const leftTrack = shuffledTracks[leftIndex]

        // Find playlist ID for left track
        for (const [playlistId, tracks] of tracksByPlaylist.entries()) {
            if (tracks.some((t) => t.id === leftTrack.id)) {
                nextTracks[playlistId] = leftTrack.id
                break
            }
        }

        // Assign right neighbor (next in shuffled array)
        const rightIndex = i === shuffledTracks.length - 1 ? 0 : i + 1
        const rightTrack = shuffledTracks[rightIndex]

        // Find playlist ID for right track
        for (const [playlistId, tracks] of tracksByPlaylist.entries()) {
            if (tracks.some((t) => t.id === rightTrack.id)) {
                // Only add if not already added (avoid duplicates)
                if (!nextTracks[playlistId]) {
                    nextTracks[playlistId] = rightTrack.id
                }
                break
            }
        }

        // Update the track with new associations
        const updatedTrack: FuckingTrack = {
            ...currentTrack,
            next_tracks: nextTracks,
        }

        db.updateTrack(updatedTrack)
    }

    console.log(`Shuffled associations for ${shuffledTracks.length} tracks`)
}
