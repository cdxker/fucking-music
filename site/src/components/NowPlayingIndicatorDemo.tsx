import { useState, useEffect } from "react"
import { NowPlayingIndicator } from "./NowPlayingIndicator"
import type { FuckingTrack, TrackId } from "@/shared/types"

// Demo track duration: 5 minutes and 22 seconds
const DEMO_TRACK_DURATION_MS = 322000

const mockTracks: FuckingTrack[] = [
    {
        id: "track-demo-1" as TrackId,
        name: "I dream of you",
        artists: ["Demo Artist"],
        time_ms: DEMO_TRACK_DURATION_MS,
        audio: { type: "stream", url: "" },
    },
    {
        id: "track-demo-2" as TrackId,
        name: "marauder",
        artists: ["Demo Artist"],
        time_ms: DEMO_TRACK_DURATION_MS,
        audio: { type: "stream", url: "" },
    },
    {
        id: "track-demo-3" as TrackId,
        name: "spending saturday scorned",
        artists: ["Demo Artist"],
        time_ms: DEMO_TRACK_DURATION_MS,
        audio: { type: "stream", url: "" },
    },
]

// Currently playing track (first track in the list)
const currentTrack = mockTracks[0]

/**
 * Demo component for NowPlayingIndicator
 * Shows multiple tracks, with the first one currently playing
 */
export const NowPlayingIndicatorDemo = () => {
    const [isPlaying, setIsPlaying] = useState(true)
    const [currentTimeMs, setCurrentTimeMs] = useState(DEMO_TRACK_DURATION_MS)

    // Simulate progress when playing
    useEffect(() => {
        if (!isPlaying) return
        const interval = setInterval(() => {
            setCurrentTimeMs((prev) => (prev + 1000) % currentTrack.time_ms)
        }, 1000)
        return () => clearInterval(interval)
    }, [isPlaying])

    return (
        <div className="w-full max-w-lg p-4 bg-[#1a1a1a] rounded">
            <div className="mb-6 flex gap-4">
                <button
                    className="px-3 py-1.5 text-sm text-white/70 border border-white/30 rounded hover:bg-white/10"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? "Pause" : "Play"}
                </button>
            </div>

            <div className="space-y-4">
                {mockTracks.map((track, index) => (
                    <NowPlayingIndicator
                        key={track.id}
                        isPlaying={isPlaying && index === 0}
                        currentTrack={track}
                        currentTimeMs={index === 0 ? currentTimeMs : track.time_ms}
                    />
                ))}
            </div>
        </div>
    )
}

export default NowPlayingIndicatorDemo
