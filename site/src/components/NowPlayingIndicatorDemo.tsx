import { useState, useEffect } from "react"
import { NowPlayingIndicator } from "./NowPlayingIndicator"
import type { FuckingTrack, TrackId } from "@/shared/types"

const mockTracks: FuckingTrack[] = [
    {
        id: "track-demo-1" as TrackId,
        name: "I dream of you",
        artists: ["Demo Artist"],
        time_ms: 322000,
        audio: { type: "stream", url: "" },
    },
    {
        id: "track-demo-2" as TrackId,
        name: "marauder",
        artists: ["Demo Artist"],
        time_ms: 322000,
        audio: { type: "stream", url: "" },
    },
    {
        id: "track-demo-3" as TrackId,
        name: "spending saturday scorned",
        artists: ["Demo Artist"],
        time_ms: 322000,
        audio: { type: "stream", url: "" },
    },
]

/**
 * Demo component for NowPlayingIndicator
 * Shows multiple tracks, with the first one currently playing
 */
export const NowPlayingIndicatorDemo = () => {
    const [isPlaying, setIsPlaying] = useState(true)
    const [currentTimeMs, setCurrentTimeMs] = useState(322000) // 05:22

    // Simulate progress when playing
    useEffect(() => {
        if (!isPlaying) return
        const interval = setInterval(() => {
            setCurrentTimeMs((prev) => (prev + 1000) % mockTracks[0].time_ms)
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
