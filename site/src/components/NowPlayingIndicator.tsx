import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"
import { AudioBars } from "./ui/AudioBars"

interface NowPlayingIndicatorProps {
    isPlaying: boolean
    currentTrack: FuckingTrack | null
    currentPlaylist: FuckingPlaylist | null
    onTogglePlay: () => void
    progress: number // 0-100
}

const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6 text-white"
    >
        <path
            fillRule="evenodd"
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
            clipRule="evenodd"
        />
    </svg>
)

const PauseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6 text-white"
    >
        <path
            fillRule="evenodd"
            d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
            clipRule="evenodd"
        />
    </svg>
)

export const NowPlayingIndicator = ({
    isPlaying,
    currentTrack,
    currentPlaylist,
    onTogglePlay,
    progress,
}: NowPlayingIndicatorProps) => {
    if (!currentTrack) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-sm border-t border-white/10 z-50">
            {/* Progress bar at top of indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                <div
                    className="h-full bg-gradient-to-r from-[#3B5998] to-[#6B8CC7] transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center h-full px-4 gap-4">
                {/* Album art with animation */}
                <div className="relative">
                    <img
                        src={currentPlaylist?.track_cover_uri}
                        className={`w-12 h-12 rounded ${isPlaying ? "animate-pulse-slow" : ""}`}
                        alt="Album cover"
                    />
                    {/* Animated bars overlay when playing */}
                    {isPlaying && <AudioBars />}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{currentTrack.name}</p>
                    <p className="text-white/60 text-sm truncate">
                        {currentTrack.artists.join(", ")}
                    </p>
                </div>

                {/* Play/Pause button */}
                <button
                    onClick={onTogglePlay}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
            </div>
        </div>
    )
}

export default NowPlayingIndicator
