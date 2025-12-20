import AudioBars from "./ui/AudioBars"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

interface NowPlayingIndicatorProps {
    isPlaying: boolean
    currentTrack: FuckingTrack | null
    currentPlaylist?: FuckingPlaylist | null
    onTogglePlay?: () => void
    currentTimeMs?: number
}

/**
 * NowPlayingIndicator - A standalone component that displays the currently playing track
 * Shows animated audio bars when playing, track name, and current time
 */
export const NowPlayingIndicator = ({
    isPlaying,
    currentTrack,
    currentTimeMs = 0,
}: NowPlayingIndicatorProps) => {
    if (!currentTrack) return null

    return (
        <div className="flex items-center gap-4 text-white/90">
            <span className="text-base capitalize">{currentTrack.name}</span>
            {isPlaying && <AudioBars />}
            <span className="text-base ml-auto">{formatTime(currentTimeMs)}</span>
        </div>
    )
}

export default NowPlayingIndicator
