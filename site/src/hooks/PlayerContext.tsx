import { createContext, useState, useCallback, type ReactNode } from "react"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"
import { db } from "@/lib/store"

export interface PlayerContextValue {
    playlist: FuckingPlaylist | null
    tracks: FuckingTrack[]
    setPlaylistAndTracks: (playlist: FuckingPlaylist, tracks: FuckingTrack[]) => void
    initialTrackIndex: number
    initialTimeMs: number
}

export const PlayerContext = createContext<PlayerContextValue | null>(null)

interface PlayerProviderProps {
    children: ReactNode
    initialPlaylist: FuckingPlaylist | null
    initialTracks: FuckingTrack[]
    initialTrackIndex: number
    initialTimeMs: number
}

export function PlayerProvider({
    children,
    initialPlaylist = null,
    initialTracks = [],
    initialTrackIndex = 0,
    initialTimeMs = 0,
}: PlayerProviderProps) {
    const [playlist, setPlaylist] = useState<FuckingPlaylist | null>(initialPlaylist)
    const [tracks, setTracks] = useState<FuckingTrack[]>(initialTracks)

    const setPlaylistAndTracks = useCallback((newPlaylist: FuckingPlaylist, newTracks: FuckingTrack[]) => {
        setPlaylist(newPlaylist)
        setTracks(newTracks)
        db.setPlayerState({ lastPlaylistId: newPlaylist.id, activeTrack: newTracks[0]?.id, trackTimestamp: 0 })
    }, [])

    const value: PlayerContextValue = {
        playlist,
        tracks,
        setPlaylistAndTracks,
        initialTrackIndex,
        initialTimeMs,
    }

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
