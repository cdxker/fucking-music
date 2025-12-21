import { useState, useRef, useEffect, useCallback, useContext } from "react"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"
import { musicCache } from "@/lib/musicCache"
import { db } from "@/lib/store"
import { PlayerContext, type SetPlaylistAndTracksParams } from "./PlayerContext"

export interface PlayerState {
    // Playlist state (from context)
    playlist: FuckingPlaylist | null
    tracks: FuckingTrack[]
    setPlaylistAndTracks: (params: SetPlaylistAndTracksParams) => void

    // Track state (computed in hook)
    currentTrackIndex: number
    currentTimeMs: number
    isPlaying: boolean
    currentTrack: FuckingTrack | null
    totalDuration: number

    // Control functions
    togglePlayPause: () => void
    handleSeek: (value: number) => void
    handleTrackSelect: (index: number) => void
}

export const usePlayerState = (): PlayerState => {
    const playerContext = useContext(PlayerContext)
    if (!playerContext) {
        throw new Error("usePlayerState must be used within a PlayerProvider")
    }
    const {
        playlist,
        tracks,
        setPlaylistAndTracks,
        initialTrackIndex,
        initialTimeMs,
        pendingTrackIndex,
        clearPendingTrackIndex,
    } = playerContext

    const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex)
    const [currentTimeMs, setCurrentTimeMs] = useState(initialTimeMs)
    const [isPlaying, setIsPlaying] = useState(false)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const initialSeekDone = useRef(false)
    const currentTimeMsRef = useRef(initialTimeMs)
    const currentTrackIndexRef = useRef(initialTrackIndex)
    const currentBlobUrlRef = useRef<string | null>(null)
    const isPlayingRef = useRef(isPlaying)
    const prevTracksRef = useRef(tracks)

    const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null
    const totalDuration = currentTrack?.time_ms ?? 0

    // Reset track index when playlist changes
    useEffect(() => {
        if (prevTracksRef.current !== tracks && tracks.length > 0) {
            const newIndex = pendingTrackIndex ?? 0
            setCurrentTrackIndex(newIndex)
            setCurrentTimeMs(0)
            currentTimeMsRef.current = 0
            currentTrackIndexRef.current = newIndex
            initialSeekDone.current = true
            prevTracksRef.current = tracks
            clearPendingTrackIndex()
        }
    }, [tracks, pendingTrackIndex, clearPendingTrackIndex])

    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    useEffect(() => {
        currentTrackIndexRef.current = currentTrackIndex
    }, [currentTrackIndex])

    useEffect(() => {
        if (!currentTrack) return
        if (!audioRef.current) {
            audioRef.current = new Audio()
        }

        let cancelled = false

        const loadAudio = async () => {
            // Revoke previous blob URL to free memory
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
                audioRef.current.src = audioUrl
                audioRef.current.load()
            }
        }

        loadAudio().then(() => {
            if (!audioRef.current) return
            if (
                !initialSeekDone.current &&
                currentTrackIndexRef.current === initialTrackIndex &&
                initialTimeMs > 0
            ) {
                const handleLoadedMetadata = () => {
                    if (!audioRef.current) return
                    audioRef.current.currentTime = initialTimeMs / 1000
                    setCurrentTimeMs(initialTimeMs)
                    initialSeekDone.current = true
                }
                audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata, {
                    once: true,
                })
            } else if (
                initialSeekDone.current ||
                currentTrackIndexRef.current !== initialTrackIndex
            ) {
                setCurrentTimeMs(0)
            }

            if (audioRef.current) {
                if (!audioRef.current) return
                audioRef.current.play()
                console.log("just called play")
            }
        })

        return () => {
            cancelled = true
        }
    }, [currentTrack?.id, currentTrack?.audio, initialTrackIndex, initialTimeMs])

    // Time update and track ended handlers
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

    // Save player state periodically
    const savePlayerState = useCallback(() => {
        const trackId = tracks[currentTrackIndexRef.current]?.id
        if (trackId) {
            db.setPlayerState({ activeTrack: trackId, trackTimestamp: currentTimeMsRef.current })
        }
    }, [tracks])

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
        currentTrackIndexRef.current = index
        currentTimeMsRef.current = 0
        setIsPlaying(true)
    }, [])

    return {
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
}
