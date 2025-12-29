import {
    createContext,
    useState,
    useCallback,
    useRef,
    useEffect,
    useContext,
    type ReactNode,
} from "react"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"
import { musicCache } from "@/lib/musicCache"
import { db } from "@/lib/store"

export type SetPlaylistAndTracksParams = {
    playlist: FuckingPlaylist
    tracks: FuckingTrack[]
    startingTrackIndex: number
}

export interface PlayerContextValue {
    playlist?: FuckingPlaylist
    tracks: FuckingTrack[]
    setPlaylistAndTracks: (params: SetPlaylistAndTracksParams) => void

    currentTrackIndex: number
    currentTimeMs: number
    isPlaying: boolean
    currentTrack: FuckingTrack | null
    totalDuration: number

    togglePlayPause: () => void
    handleSeek: (value: number) => void
    handleTrackSelect: (index: number) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

interface PlayerProviderProps {
    children: ReactNode
    initialPlaylist?: FuckingPlaylist
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
    const [currentTimeMs, setCurrentTimeMs] = useState(initialTimeMs)
    const [isPlaying, setIsPlaying] = useState(true)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const initialSeekDone = useRef(false)
    const currentTimeMsRef = useRef(initialTimeMs)
    const currentBlobUrlRef = useRef<string | null>(null)

    const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null
    const totalDuration = currentTrack?.time_ms ?? 0

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
            setCurrentTimeMs(0)
            currentTimeMsRef.current = 0
            initialSeekDone.current = true
            const activeTrack = tracks[startingTrackIndex]?.id
            db.setPlayerState({ lastPlaylistId: playlist.id, activeTrack, trackTimestamp: 0 })
        },
        []
    )

    useEffect(() => {
        if (!currentTrack) return

        if (!audioRef.current) {
            audioRef.current = new Audio()
        }

        let cancelled = false

        const loadAudio = async () => {
            if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current)
                currentBlobUrlRef.current = null
            }

            let audioUrl: string

            if (currentTrack.audio.type === "youtube") {
                audioUrl = `/api/youtube/stream?id=${currentTrack.audio.id}`
            } else {
                audioUrl = await musicCache.getOrFetch(currentTrack.id, currentTrack.audio.url)
                currentBlobUrlRef.current = audioUrl
            }

            if (cancelled) {
                if (currentBlobUrlRef.current) {
                    URL.revokeObjectURL(currentBlobUrlRef.current)
                }
                return
            }

            if (audioRef.current) {
                audioRef.current.src = audioUrl
                audioRef.current.load()
            }
        }

        loadAudio().then(() => {
            if (!audioRef.current) return
            if (!initialSeekDone.current && initialTimeMs > 0) {
                const handleLoadedMetadata = () => {
                    if (!audioRef.current) return
                    audioRef.current.currentTime = initialTimeMs / 1000
                    setCurrentTimeMs(initialTimeMs)
                    initialSeekDone.current = true
                }
                audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata, {
                    once: true,
                })
            } else if (initialSeekDone.current) {
                setCurrentTimeMs(0)
            }

            if (audioRef.current) {
                audioRef.current.play()
            }
        })

        return () => {
            cancelled = true
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally depend on specific properties only
    }, [currentTrack?.id, currentTrack?.audio, initialTimeMs])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentTrack) return

        const handleTimeUpdate = () => {
            const timeMs = audio.currentTime * 1000
            setCurrentTimeMs(timeMs)
            currentTimeMsRef.current = timeMs
        }

        const handleEnded = () => {
            if (currentTrackIndex < tracks.length - 1) {
                setCurrentTrackIndex(currentTrackIndex + 1)
            } else {
                setIsPlaying(false)
            }
        }

        audio.addEventListener("timeupdate", handleTimeUpdate)
        audio.addEventListener("ended", handleEnded)

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate)
            audio.removeEventListener("ended", handleEnded)
        }
    }, [currentTrackIndex, tracks.length, currentTrack])

    const savePlayerState = useCallback(() => {
        const trackId = tracks[currentTrackIndex]?.id
        if (trackId) {
            db.setPlayerState({ activeTrack: trackId, trackTimestamp: currentTimeMsRef.current })
        }
    }, [tracks, currentTrackIndex])

    // Periodic save of player state
    useEffect(() => {
        if (!currentTrack) return

        const interval = setInterval(savePlayerState, 5000)
        savePlayerState()

        return () => clearInterval(interval)
    }, [currentTrackIndex, savePlayerState, currentTrack])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            savePlayerState()
            if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current)
            }
        }
    }, [savePlayerState])

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
        setIsPlaying(!isPlaying)
    }, [isPlaying])

    const handleSeek = useCallback((value: number) => {
        const audio = audioRef.current
        if (!audio) return

        audio.currentTime = value / 1000
        setCurrentTimeMs(value)
        currentTimeMsRef.current = value
    }, [])

    const handleTrackSelect = useCallback((index: number) => {
        setCurrentTrackIndex(index)
        setCurrentTimeMs(0)
        currentTimeMsRef.current = 0
        setIsPlaying(true)
    }, [])

    const value: PlayerContextValue = {
        playlist,
        tracks,
        setPlaylistAndTracks,
        currentTrackIndex,
        currentTimeMs,
        isPlaying,
        currentTrack,
        totalDuration,
        togglePlayPause,
        handleSeek,
        handleTrackSelect,
    }

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer(): PlayerContextValue {
    const context = useContext(PlayerContext)
    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider")
    }
    return context
}
