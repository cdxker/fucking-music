import type { PlaylistId, TrackId, FuckingTrack, FuckingPlaylist } from "@/shared/types"
import { db } from "./store"

/**
 * Randomly link songs in the library using the existing next_tracks field.
 * Each track gets 2-4 random connections to tracks in other playlists.
 * Called when new songs are added to create discovery paths.
 */
export function shuffleAssociations(): void {
    const playlists = db.getPlaylists()
    const allTracks: { playlistId: PlaylistId; track: FuckingTrack }[] = []

    // Collect all tracks from all playlists
    for (const playlist of playlists) {
        const tracks = db.getTracks(playlist.id)
        for (const track of tracks) {
            allTracks.push({ playlistId: playlist.id, track })
        }
    }

    if (allTracks.length < 2) return

    // For each track, assign random connections via next_tracks
    for (const { playlistId, track } of allTracks) {
        // Get tracks from OTHER playlists only
        const otherTracks = allTracks.filter((t) => t.playlistId !== playlistId)
        if (otherTracks.length === 0) continue

        // Shuffle and pick 2-4 random connections
        const shuffled = [...otherTracks].sort(() => Math.random() - 0.5)
        const connectionCount = Math.min(2 + Math.floor(Math.random() * 3), shuffled.length)
        const connections = shuffled.slice(0, connectionCount)

        // Build next_tracks record
        const nextTracks: Record<PlaylistId, TrackId> = {}
        for (const conn of connections) {
            nextTracks[conn.playlistId] = conn.track.id
        }

        // Update the track with new associations
        const updatedTrack: FuckingTrack = {
            ...track,
            next_tracks: nextTracks,
        }

        db.updateTrack(playlistId, updatedTrack)
    }
}

/**
 * Get left and right track associations for the current track.
 * Reads directly from the track's next_tracks field.
 */
export function getLeftRightTracks(
    playlistId: PlaylistId,
    trackId: TrackId
): {
    left: { playlist: FuckingPlaylist; track: FuckingTrack } | null
    right: { playlist: FuckingPlaylist; track: FuckingTrack } | null
} {
    const track = db.getTrack(trackId)
    if (!track || !track.next_tracks) {
        return { left: null, right: null }
    }

    const linkedPlaylistIds = Object.keys(track.next_tracks) as PlaylistId[]

    // Get first two associations as left/right
    const leftPlaylistId = linkedPlaylistIds[0]
    const rightPlaylistId = linkedPlaylistIds[1]

    let left: { playlist: FuckingPlaylist; track: FuckingTrack } | null = null
    let right: { playlist: FuckingPlaylist; track: FuckingTrack } | null = null

    if (leftPlaylistId) {
        const leftPlaylist = db.getPlaylist(leftPlaylistId)
        const leftTrackId = track.next_tracks[leftPlaylistId]
        const leftTrack = db.getTrack(leftTrackId)
        if (leftPlaylist && leftTrack) {
            left = { playlist: leftPlaylist, track: leftTrack }
        }
    }

    if (rightPlaylistId) {
        const rightPlaylist = db.getPlaylist(rightPlaylistId)
        const rightTrackId = track.next_tracks[rightPlaylistId]
        const rightTrack = db.getTrack(rightTrackId)
        if (rightPlaylist && rightTrack) {
            right = { playlist: rightPlaylist, track: rightTrack }
        }
    }

    return { left, right }
}

/**
 * Get all linked tracks for a given track (for mockup 2 sidebar display).
 */
export function getAllLinkedTracks(
    playlistId: PlaylistId,
    trackId: TrackId
): Array<{ playlist: FuckingPlaylist; track: FuckingTrack }> {
    const track = db.getTrack(trackId)
    if (!track || !track.next_tracks) return []

    const links: Array<{ playlist: FuckingPlaylist; track: FuckingTrack }> = []

    for (const [linkedPlaylistId, linkedTrackId] of Object.entries(track.next_tracks)) {
        const playlist = db.getPlaylist(linkedPlaylistId as PlaylistId)
        const linkedTrack = db.getTrack(linkedTrackId)
        if (playlist && linkedTrack) {
            links.push({ playlist, track: linkedTrack })
        }
    }

    return links
}
