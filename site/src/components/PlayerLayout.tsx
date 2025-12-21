import { Button } from "@/components/ui/button"
import PlayerView from "./PlayerView"
import { useState, useEffect, useRef } from "react"
import type { FuckingPlaylist, FuckingTrack } from "../shared/types"
import { db } from "@/lib/store"
import { musicCache } from "@/lib/musicCache"
import { shuffleAssociations } from "@/lib/associations"

export default function PlayerLayout() {
    const [playlist, setPlaylist] = useState<FuckingPlaylist | null>(null)
    const [tracks, setTracks] = useState<FuckingTrack[]>([])
    const [showInput, setShowInput] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const [initialTrackIndex, setInitialTrackIndex] = useState(0)
    const [initialTimeMs, setInitialTimeMs] = useState(0)
    const tracksRef = useRef<FuckingTrack[]>([])

    useEffect(() => {
        const init = async () => {
            await db.init()
            await musicCache.init()
            const playerState = db.getPlayerState()

            if (playerState) {
                const savedPlaylist = db.getPlaylist(playerState.lastPlaylistId)
                const savedTracks = db.getTracks(playerState.lastPlaylistId)
                if (savedPlaylist && savedTracks.length > 0) {
                    tracksRef.current = savedTracks
                    const trackIndex = savedTracks.findIndex(
                        (t) => t.id === playerState.activeTrack
                    )
                    if (trackIndex !== -1) {
                        setInitialTrackIndex(trackIndex)
                    }

                    setInitialTimeMs(playerState.trackTimestamp)
                    setPlaylist(savedPlaylist)
                    setTracks(savedTracks)
                }
                shuffleAssociations()
            }
            setInitializing(false)
        }
        init()
    }, [])

    const handleStateChange = (trackIndex: number, timeMs: number) => {
        const trackId = tracksRef.current[trackIndex]?.id
        if (trackId) {
            db.setPlayerState({ activeTrack: trackId, trackTimestamp: timeMs })
        }
    }

    const getApiEndpoint = (url: string): string => {
        if (url.includes("spotify.com")) {
            return "/api/spotify/scrape"
        }
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            return "/api/youtube/scrape"
        }
        return "/api/bandcamp/scrape"
    }

    const handleSubmit = async () => {
        if (!inputValue.trim()) return

        setLoading(true)

        try {
            const endpoint = getApiEndpoint(inputValue)
            const res = await fetch(`${endpoint}?url=${encodeURIComponent(inputValue)}`)
            const data = await res.json()

            if (!res.ok || data.error) {
                alert(data.error || "Failed to load music")
                return
            }

            // Save to local store
            db.insertPlaylist(data.playlist)
            db.insertTracks(data.tracks, data.playlist.id)
            db.setPlayerState({ activeTrack: data.tracks[0]?.id, trackTimestamp: 0 })

            tracksRef.current = data.tracks
            setInitialTrackIndex(0)
            setInitialTimeMs(0)
            setPlaylist(data.playlist)
            setTracks(data.tracks)
            setShowInput(false)
            setInputValue("")
        } catch (e) {
            alert("Failed to load music")
        } finally {
            setLoading(false)
        }
    }

    if (initializing) {
        return <div className="min-h-screen bg-[#0B0B0B]" />
    }

    return (
        <div className="min-h-screen px-5 pt-8 pb-12 bg-[#0B0B0B]">
            {playlist && tracks.length > 0 && !showInput && (
                <>
                    <PlayerView
                        playlist={playlist}
                        tracks={tracks}
                        initialTrackIndex={initialTrackIndex}
                        initialTimeMs={initialTimeMs}
                        onStateChange={handleStateChange}
                    />
                    <div className="flex justify-center mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-white/50"
                            onClick={() => setShowInput(true)}
                        >
                            Add Music
                        </Button>
                    </div>
                </>
            )}

            {(!playlist || tracks.length === 0 || showInput) && (
                <div className="w-full h-screen flex justify-center items-center">
                    {!showInput ? (
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-3xl text-white/70"
                            onClick={() => setShowInput(true)}
                        >
                            Add Music
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-4 w-full max-w-md">
                            <input
                                type="url"
                                placeholder="Paste Bandcamp, Spotify, or YouTube URL..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                className="w-full px-4 py-3 text-lg text-white bg-transparent border border-white/30 rounded-md focus:outline-none focus:border-white/60"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 text-white/70"
                                    onClick={() => {
                                        setShowInput(false)
                                        setInputValue("")
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 text-white/70"
                                    onClick={handleSubmit}
                                    disabled={loading || !inputValue.trim()}
                                >
                                    {loading ? "Loading..." : "Load"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
