import { useEffect, useState, useCallback, useRef } from "react"

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void
        Spotify: {
            Player: new (options: {
                name: string
                getOAuthToken: (cb: (token: string) => void) => void
                volume: number
            }) => SpotifyPlayer
        }
    }
}

interface SpotifyPlayer {
    connect: () => Promise<boolean>
    disconnect: () => void
    addListener: (event: string, callback: (state: any) => void) => void
    removeListener: (event: string) => void
    togglePlay: () => Promise<void>
    pause: () => Promise<void>
    resume: () => Promise<void>
    seek: (position_ms: number) => Promise<void>
    nextTrack: () => Promise<void>
    previousTrack: () => Promise<void>
    setVolume: (volume: number) => Promise<void>
    getVolume: () => Promise<number>
    getCurrentState: () => Promise<PlaybackState | null>
    activateElement: () => Promise<void>
}

interface PlaybackState {
    paused: boolean
    position: number
    duration: number
    track_window: {
        current_track: {
            id: string
            name: string
            uri: string
            artists: { name: string }[]
            album: {
                name: string
                images: { url: string }[]
            }
        }
        next_tracks: any[]
        previous_tracks: any[]
    }
}

export function useSpotifyPlayer() {
    const [player, setPlayer] = useState<SpotifyPlayer | null>(null)
    const [deviceId, setDeviceId] = useState<string | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [isPaused, setIsPaused] = useState(true)
    const [currentTrack, setCurrentTrack] = useState<PlaybackState["track_window"]["current_track"] | null>(null)
    const [position, setPosition] = useState(0)
    const [duration, setDuration] = useState(0)
    const tokenRef = useRef<string | null>(null)

    useEffect(() => {
        const initPlayer = async () => {
            const res = await fetch("/api/spotify/token")
            const data = await res.json()
            if (!data.token) return

            tokenRef.current = data.token

            if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
                const script = document.createElement("script")
                script.src = "https://sdk.scdn.co/spotify-player.js"
                script.async = true
                document.body.appendChild(script)
            }

            window.onSpotifyWebPlaybackSDKReady = () => {
                const spotifyPlayer = new window.Spotify.Player({
                    name: "Rotations Web Player",
                    getOAuthToken: (cb) => {
                        cb(tokenRef.current || "")
                    },
                    volume: 0.5,
                })

                spotifyPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
                    console.log("Spotify Player ready with device ID:", device_id)
                    setDeviceId(device_id)
                    setIsReady(true)
                })

                spotifyPlayer.addListener("not_ready", ({ device_id }: { device_id: string }) => {
                    console.log("Device ID has gone offline:", device_id)
                    setIsReady(false)
                })

                spotifyPlayer.addListener("player_state_changed", (state: PlaybackState | null) => {
                    if (!state) return
                    setIsPaused(state.paused)
                    setCurrentTrack(state.track_window.current_track)
                    setPosition(state.position)
                    setDuration(state.duration)
                })

                spotifyPlayer.addListener("initialization_error", ({ message }: { message: string }) => {
                    console.error("Spotify initialization error:", message)
                })

                spotifyPlayer.addListener("authentication_error", ({ message }: { message: string }) => {
                    console.error("Spotify authentication error:", message)
                })

                spotifyPlayer.addListener("account_error", ({ message }: { message: string }) => {
                    console.error("Spotify account error:", message)
                })

                spotifyPlayer.connect()
                setPlayer(spotifyPlayer)
            }

            if (window.Spotify) {
                window.onSpotifyWebPlaybackSDKReady()
            }
        }

        initPlayer()

        return () => {
            if (player) {
                player.disconnect()
            }
        }
    }, [])

    const playPlaylist = useCallback(
        async (playlistUri: string, trackUri?: string) => {
            if (!deviceId) {
                console.error("No device ID available")
                return
            }

            await fetch("/api/spotify/play", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    device_id: deviceId,
                    context_uri: playlistUri,
                    offset: trackUri ? { uri: trackUri } : undefined,
                }),
            })
        },
        [deviceId]
    )

    const togglePlay = useCallback(async () => {
        if (player) {
            await player.togglePlay()
        }
    }, [player])

    const skipNext = useCallback(async () => {
        if (player) {
            await player.nextTrack()
        }
    }, [player])

    const skipPrevious = useCallback(async () => {
        if (player) {
            await player.previousTrack()
        }
    }, [player])

    const seek = useCallback(
        async (positionMs: number) => {
            if (player) {
                await player.seek(positionMs)
            }
        },
        [player]
    )

    return {
        isReady,
        isPaused,
        currentTrack,
        position,
        duration,
        deviceId,
        playPlaylist,
        togglePlay,
        skipNext,
        skipPrevious,
        seek,
    }
}
