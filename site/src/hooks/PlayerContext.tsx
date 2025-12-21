import { createContext, useState, useCallback, useRef, type ReactNode, type MutableRefObject } from "react"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"
import { db } from "@/lib/store"

export type SetPlaylistAndTracksParams = {
    playlist: FuckingPlaylist
    tracks: FuckingTrack[]
    startingTrackIndex: number | undefined
}

export interface PlayerContextValue {
    playlist: FuckingPlaylist | null
    tracks: FuckingTrack[]
    setPlaylistAndTracks: (params: SetPlaylistAndTracksParams) => void
    initialTrackIndex: number
    initialTimeMs: number
    pendingTrackIndex: number | null
    clearPendingTrackIndex: () => void
    audioRef: MutableRefObject<HTMLAudioElement | null>
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
    const [pendingTrackIndex, setPendingTrackIndex] = useState<number | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const setPlaylistAndTracks = useCallback(({ playlist, tracks, startingTrackIndex }: SetPlaylistAndTracksParams) => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
        setPlaylist(playlist)
        setTracks(tracks)
        const trackIndex = startingTrackIndex ?? 0
        setPendingTrackIndex(trackIndex)
        const activeTrack = tracks[trackIndex]?.id ?? tracks[0]?.id
        db.setPlayerState({ lastPlaylistId: playlist.id, activeTrack, trackTimestamp: 0 })
    }, [])

    const clearPendingTrackIndex = useCallback(() => {
        setPendingTrackIndex(null)
    }, [])

    const value: PlayerContextValue = {
        playlist,
        tracks,
        setPlaylistAndTracks,
        initialTrackIndex,
        initialTimeMs,
        pendingTrackIndex,
        clearPendingTrackIndex,
        audioRef,
    }

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
