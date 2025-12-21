import { useState, useEffect } from "react"
import { db } from "@/lib/store"
import type { FuckingTrack, FuckingPlaylist, PlaylistId, TrackId } from "@/shared/types"

export interface TrackNeighbor {
    track: FuckingTrack
    playlist: FuckingPlaylist
}

export interface TrackNeighbors {
    left: TrackNeighbor | null
    right: TrackNeighbor | null
}

/**
 * Hook to retrieve the left and right neighbor tracks for a given track.
 * Returns tracks from different playlists based on the next_tracks associations.
 */
export function useTrackNeighbors(trackId: TrackId | null): TrackNeighbors {
    const [neighbors, setNeighbors] = useState<TrackNeighbors>({ left: null, right: null })

    useEffect(() => {
        if (!trackId) {
            setNeighbors({ left: null, right: null })
            return
        }

        const currentTrack = db.getTrack(trackId)
        if (!currentTrack || !currentTrack.next_tracks) {
            setNeighbors({ left: null, right: null })
            return
        }

        // Get all associated tracks from next_tracks
        const playlistIds = Object.keys(currentTrack.next_tracks) as PlaylistId[]

        if (playlistIds.length === 0) {
            setNeighbors({ left: null, right: null })
            return
        }

        // Get left neighbor (first associated track)
        let leftNeighbor: TrackNeighbor | null = null
        if (playlistIds.length > 0) {
            const leftPlaylistId = playlistIds[0]
            const leftTrackId = currentTrack.next_tracks[leftPlaylistId]
            const leftTrack = db.getTrack(leftTrackId)
            const leftPlaylist = db.getPlaylist(leftPlaylistId)

            if (leftTrack && leftPlaylist) {
                leftNeighbor = { track: leftTrack, playlist: leftPlaylist }
            }
        }

        // Get right neighbor (second associated track if available)
        let rightNeighbor: TrackNeighbor | null = null
        if (playlistIds.length > 1) {
            const rightPlaylistId = playlistIds[1]
            const rightTrackId = currentTrack.next_tracks[rightPlaylistId]
            const rightTrack = db.getTrack(rightTrackId)
            const rightPlaylist = db.getPlaylist(rightPlaylistId)

            if (rightTrack && rightPlaylist) {
                rightNeighbor = { track: rightTrack, playlist: rightPlaylist }
            }
        }

        setNeighbors({ left: leftNeighbor, right: rightNeighbor })
    }, [trackId])

    return neighbors
}
