import { createContext, useState, useCallback, useRef, type ReactNode, type RefObject, type Dispatch, type SetStateAction } from "react"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"
import { db } from "@/lib/store"

export type SetPlaylistAndTracksParams = {
    playlist: FuckingPlaylist
    tracks: FuckingTrack[]
    startingTrackIndex: number
}

export interface PlayerContextValue {
    playlist?: FuckingPlaylist;
    tracks: FuckingTrack[]
    setPlaylistAndTracks: (params: SetPlaylistAndTracksParams) => void
    initialTrackIndex: number
    initialTimeMs: number
    audioRef?: RefObject<HTMLAudioElement | null>
    currentTrackIndex: number
    setCurrentTrackIndex: Dispatch<SetStateAction<number>>
}

export const PlayerContext = createContext<PlayerContextValue>({
    tracks: [],
    setPlaylistAndTracks: () => {},
    initialTrackIndex: 0,
    initialTimeMs: 0,
    currentTrackIndex: 0,
    setCurrentTrackIndex: () => {},
    audioRef: undefined
})

interface PlayerProviderProps {
    children: ReactNode
    initialPlaylist?: FuckingPlaylist,
    initialTracks: FuckingTrack[]
    initialTrackIndex: number
    initialTimeMs: number
}

export function PlayerProvider({
    children,
    initialPlaylist = undefined,
    initialTracks = [],
    initialTrackIndex = 0,
    initialTimeMs = 0,
}: PlayerProviderProps) {
    const [playlist, setPlaylist] = useState<FuckingPlaylist | undefined>(initialPlaylist)
    const [tracks, setTracks] = useState<FuckingTrack[]>(initialTracks)
    const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const setPlaylistAndTracks = useCallback(
        ({ playlist, tracks, startingTrackIndex = 0 }: SetPlaylistAndTracksParams) => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.removeAttribute("src")
                audioRef.current.load()
            }
            setPlaylist(playlist)
            setTracks(tracks)
            setCurrentTrackIndex(startingTrackIndex)
            const activeTrack = tracks[startingTrackIndex]?.id;
            db.setPlayerState({ lastPlaylistId: playlist.id, activeTrack, trackTimestamp: 0 })
        },
        []
    )

    const value: PlayerContextValue = {
        playlist,
        tracks,
        setPlaylistAndTracks,
        initialTrackIndex,
        initialTimeMs,
        audioRef,
        currentTrackIndex,
        setCurrentTrackIndex,
    }

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
