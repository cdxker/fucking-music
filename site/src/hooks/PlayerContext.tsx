import {
    createContext,
    useState,
    useCallback,
    useRef,
    useEffect,
    useContext,
    type ReactNode,
} from "react"
import type { FuckingPlaylist, FuckingTrack, PlaylistId, TrackId } from "@/shared/types"
import type { SpotifyPlayerInstance } from "@/shared/spotify-sdk"
import { musicCache } from "@/lib/musicCache"
import { db } from "@/lib/store"
import posthog from "posthog-js"

export type SetPlaylistAndTracksParams = {
    playlistId: PlaylistId
    startingTrackId?: TrackId
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
    handleTrackSelect: (index: number) => Promise<void>
    handleNextTrack: () => Promise<void>
    handlePrevTrack: () => Promise<void>
    setCurrentTimeMs: (timeMs: number) => void
    addPlaylists: (playlists: FuckingPlaylist[]) => void
    addTracks: (tracks: FuckingTrack[], playlistId: PlaylistId) => void

    spotifyDeviceId: string | null
    setSpotifyDeviceId: (id: string | null) => void
    setSpotifyPlayer: (player: SpotifyPlayerInstance | null) => void
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
    const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null)
    const spotifyPlayerRef = useRef<SpotifyPlayerInstance | null>(null)

    const setSpotifyPlayer = useCallback((player: SpotifyPlayerInstance | null) => {
        spotifyPlayerRef.current = player
    }, [])

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const initialSeekDone = useRef(false)

    const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null
    const totalDuration = currentTrack?.time_ms ?? 0

    const setPlaylistAndTracks = useCallback(
        ({ playlistId, startingTrackId }: SetPlaylistAndTracksParams) => {
            const playlist = db.getPlaylist(playlistId)
            if (!playlist) return

            const tracks = db.getTracks(playlistId)
            let startingTrackIndex = 0
            if (startingTrackId) {
                const foundIndex = tracks.findIndex((t) => t.id === startingTrackId)
                if (foundIndex !== -1) {
                    startingTrackIndex = foundIndex
                }
            }

            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.removeAttribute("src")
                audioRef.current.load()
            }
            setPlaylist(playlist)
            setTracks(tracks)
            setCurrentTrackIndex(startingTrackIndex)
            setCurrentTimeMs(0)
            initialSeekDone.current = true
            const activeTrack = tracks[startingTrackIndex]?.id
            db.setPlayerState({ lastPlaylistId: playlist.id, activeTrack, trackTimestamp: 0 })
        },
        []
    )

    const addPlaylists = useCallback((playlists: FuckingPlaylist[]) => {
        for (const playlist of playlists) {
            const existingPlaylist = db.getPlaylist(playlist.id)
            if (existingPlaylist) continue

            // Insert the first track if it doesn't exist
            const existingTrack = db.getTrack(playlist.first_track.id)
            if (!existingTrack) {
                db.insertTracks([playlist.first_track], playlist.id)
            }

            db.insertPlaylist(playlist)
        }
    }, [])

    const addTracks = useCallback((tracks: FuckingTrack[], playlistId: PlaylistId) => {
        const newTracks: FuckingTrack[] = []
        for (const track of tracks) {
            const existingTrack = db.getTrack(track.id)
            if (existingTrack) continue
            newTracks.push(track)
        }
        if (newTracks.length > 0) {
            db.insertTracks(newTracks, playlistId)
        }
    }, [])

    useEffect(() => {
        if (!currentTrack) return

        if (!audioRef.current) {
            audioRef.current = new Audio()
        }

        let cancelled = false
        let blobUrl: string | null = null

        const loadAudio = async () => {
            // For Spotify playlists, use Spotify's playback API
            if (playlist?.source === "spotify") {
                const playlistSpotifyId = playlist.id.replace("play-spotify-", "")
                const trackSpotifyId = currentTrack.id.replace("track-spotify-", "")

                if (!spotifyDeviceId) {
                    console.error("No Spotify device available")
                    return
                }

                const positionMs = !initialSeekDone.current && initialTimeMs > 0 ? initialTimeMs : 0
                await fetch("/api/spotify/play", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        device_id: spotifyDeviceId,
                        context_uri: `spotify:playlist:${playlistSpotifyId}`,
                        offset: { uri: `spotify:track:${trackSpotifyId}` },
                        position_ms: positionMs,
                    }),
                })

                if (!initialSeekDone.current) {
                    setCurrentTimeMs(positionMs)
                    initialSeekDone.current = true
                }
                return
            }

            let audioUrl: string

            if (currentTrack.audio.type === "youtube") {
                audioUrl = `/api/youtube/stream?id=${currentTrack.audio.id}`
            } else if (currentTrack.audio.type === "spotify") {
                // Spotify tracks are played via the Spotify SDK, not HTML audio
                return
            } else {
                audioUrl = await musicCache.getOrFetch(currentTrack.id, currentTrack.audio.url)
                blobUrl = audioUrl
            }

            if (cancelled) {
                if (blobUrl) {
                    URL.revokeObjectURL(blobUrl)
                }
                return
            }

            if (audioRef.current) {
                audioRef.current.src = audioUrl
                audioRef.current.load()
            }
        }

        loadAudio().then(() => {
            // Spotify playback is handled by Spotify's client, not our audio element
            if (playlist?.source === "spotify") return

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
    }, [currentTrack, initialTimeMs, playlist, spotifyDeviceId])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentTrack) return

        const handleTimeUpdate = () => {
            const timeMs = audio.currentTime * 1000
            setCurrentTimeMs(timeMs)
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
            db.setPlayerState({ activeTrack: trackId, trackTimestamp: currentTimeMs })
        }
    }, [tracks, currentTrackIndex, currentTimeMs])

    useEffect(() => {
        if (!currentTrack) return

        const interval = setInterval(savePlayerState, 5000)
        savePlayerState()

        return () => clearInterval(interval)
    }, [currentTrackIndex, savePlayerState, currentTrack])

    useEffect(() => {
        return () => {
            savePlayerState()
        }
    }, [savePlayerState])

    const togglePlayPause = useCallback(() => {
        // For Spotify, use the Spotify player's togglePlay
        if (playlist?.source === "spotify") {
            spotifyPlayerRef.current?.togglePlay()
            const newIsPlaying = !isPlaying
            setIsPlaying(newIsPlaying)
            if (newIsPlaying && currentTrack) {
                posthog.capture("music_played", {
                    source: playlist.source,
                    track_name: currentTrack.name,
                    playlist_name: playlist.name,
                })
            }
            return
        }

        const audio = audioRef.current
        if (!audio) return

        const newIsPlaying = !isPlaying
        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
            if (currentTrack && playlist) {
                posthog.capture("music_played", {
                    source: playlist.source,
                    track_name: currentTrack.name,
                    playlist_name: playlist.name,
                })
            }
        }
        setIsPlaying(newIsPlaying)
    }, [isPlaying, playlist, currentTrack])

    const handleSeek = useCallback(
        (value: number) => {
            // For Spotify, use the Spotify player's seek
            if (playlist?.source === "spotify") {
                spotifyPlayerRef.current?.seek(value)
                setCurrentTimeMs(value)
                return
            }

            const audio = audioRef.current
            if (!audio) return

            audio.currentTime = value / 1000
            setCurrentTimeMs(value)
        },
        [playlist]
    )

    const handleTrackSelect = useCallback(
        async (index: number) => {
            setCurrentTrackIndex(index)
            setCurrentTimeMs(0)
            setIsPlaying(true)

            const selectedTrack = tracks[index]
            if (selectedTrack && playlist) {
                posthog.capture("music_played", {
                    source: playlist.source,
                    track_name: selectedTrack.name,
                    playlist_name: playlist.name,
                })
            }

            // For Spotify, explicitly trigger playback of the selected track
            if (playlist?.source === "spotify" && spotifyDeviceId) {
                const playlistSpotifyId = playlist.id.replace("play-spotify-", "")
                if (selectedTrack) {
                    const trackSpotifyId = selectedTrack.id.replace("track-spotify-", "")
                    await fetch("/api/spotify/play", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            device_id: spotifyDeviceId,
                            context_uri: `spotify:playlist:${playlistSpotifyId}`,
                            offset: { uri: `spotify:track:${trackSpotifyId}` },
                        }),
                    })
                }
            }
        },
        [playlist, spotifyDeviceId, tracks]
    )

    const handleNextTrack = useCallback(async () => {
        if (currentTrackIndex < tracks.length - 1) {
            await handleTrackSelect(currentTrackIndex + 1)
        }
    }, [currentTrackIndex, tracks.length, handleTrackSelect])

    const handlePrevTrack = useCallback(async () => {
        if (currentTrackIndex > 0) {
            await handleTrackSelect(currentTrackIndex - 1)
        }
    }, [currentTrackIndex, handleTrackSelect])

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
        handleNextTrack,
        handlePrevTrack,
        setCurrentTimeMs,
        addPlaylists,
        addTracks,
        spotifyDeviceId,
        setSpotifyDeviceId,
        setSpotifyPlayer,
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
