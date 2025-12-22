import { useState, useEffect } from "react"
import { NowPlayingIndicator } from "./NowPlayingIndicator"
import type { FuckingTrack, FuckingPlaylist } from "@/shared/types"

const mockTrack: FuckingTrack = {
    id: "track-demo",
    name: "Celestial Dreams",
    artists: ["Ambient Artist"],
    time_ms: 240000,
    audio: { type: "stream", url: "" },
}

const mockPlaylist: FuckingPlaylist = {
    id: "play-demo",
    name: "Demo Album",
    artists: ["Ambient Artist"],
    track_cover_uri: "/covers__fetish.png",
    first_track: mockTrack,
}

export const NowPlayingIndicatorDemo = () => {
    const [isPlaying, setIsPlaying] = useState(true)
    const [progress, setProgress] = useState(35)

    // Simulate progress
    useEffect(() => {
        if (!isPlaying) return
        const interval = setInterval(() => {
            setProgress((p) => (p + 0.5) % 100)
        }, 100)
        return () => clearInterval(interval)
    }, [isPlaying])

    return (
        <NowPlayingIndicator
            isPlaying={isPlaying}
            currentTrack={mockTrack}
            currentPlaylist={mockPlaylist}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            progress={progress}
        />
    )
}

export default NowPlayingIndicatorDemo
