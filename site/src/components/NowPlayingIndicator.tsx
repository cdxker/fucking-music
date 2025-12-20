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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
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
          className="h-full bg-gradient-to-r from-[#3B5998] to-[#6B8CC7] transition-[width] duration-100"
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
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </div>
  )
}

