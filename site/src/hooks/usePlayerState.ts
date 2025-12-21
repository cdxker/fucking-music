import { useState, useRef, useEffect, useCallback } from "react"
import type { FuckingTrack } from "@/shared/types"
import { musicCache } from "@/lib/musicCache"
import { db } from "@/lib/store"

export interface PlayerState {
    currentTrackIndex: number
    currentTimeMs: number
    isPlaying: boolean
    currentTrack: FuckingTrack
    totalDuration: number
    togglePlayPause: () => void
    handleSeek: (value: number) => void
    handleTrackSelect: (index: number) => void
}

export const usePlayerState = (
    tracks: FuckingTrack[],
    initialTrackIndex: number = 0,
    initialTimeMs: number = 0
): PlayerState => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex)
    const [currentTimeMs, setCurrentTimeMs] = useState(initialTimeMs)
    const [isPlaying, setIsPlaying] = useState(false)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const initialSeekDone = useRef(false)
    const currentTimeMsRef = useRef(initialTimeMs)
    const currentTrackIndexRef = useRef(initialTrackIndex)
    const currentBlobUrlRef = useRef<string | null>(null)
    const isPlayingRef = useRef(isPlaying)

    const currentTrack = tracks[currentTrackIndex]
    const totalDuration = currentTrack.time_ms

    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    useEffect(() => {
        currentTrackIndexRef.current = currentTrackIndex
    }, [currentTrackIndex])

    // Audio loading effect
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
        }
        const audio = audioRef.current
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

            audio.src = audioUrl
            audio.load()

            if (
                !initialSeekDone.current &&
                currentTrackIndexRef.current === initialTrackIndex &&
                initialTimeMs > 0
            ) {
                const handleLoadedMetadata = () => {
                    audio.currentTime = initialTimeMs / 1000
                    setCurrentTimeMs(initialTimeMs)
                    initialSeekDone.current = true
                }
                audio.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true })
            } else if (
                initialSeekDone.current ||
                currentTrackIndexRef.current !== initialTrackIndex
            ) {
                setCurrentTimeMs(0)
            }

            if (isPlayingRef.current) {
                audio.play()
            }
        }

        loadAudio()

        return () => {
            cancelled = true
            audio.pause()
        }
    }, [currentTrack.id, currentTrack.audio, initialTrackIndex, initialTimeMs])

    // Time update and track ended handlers
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

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
    }, [currentTrackIndex, tracks.length])

    // Save player state periodically
    const savePlayerState = useCallback(() => {
        const trackId = tracks[currentTrackIndexRef.current]?.id
        if (trackId) {
            db.setPlayerState({ activeTrack: trackId, trackTimestamp: currentTimeMsRef.current })
        }
    }, [tracks])

    useEffect(() => {
        const interval = setInterval(savePlayerState, 5000)
        savePlayerState()

        return () => clearInterval(interval)
    }, [currentTrackIndex, savePlayerState])

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
    }, [])

    const handleTrackSelect = useCallback((index: number) => {
        setCurrentTrackIndex(index)
        setCurrentTimeMs(0)
        setIsPlaying(true)
    }, [])

    return {
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
