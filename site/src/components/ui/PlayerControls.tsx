import { Play, Pause, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PlayerControlsProps {
    isPlaying: boolean
    onPlayPause: () => void
    onPrevious: () => void
    onNext: () => void
    canGoPrevious: boolean
    canGoNext: boolean
}

export const PlayerControls = ({
    isPlaying,
    onPlayPause,
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext,
}: PlayerControlsProps) => {
    return (
        <div className="flex items-center justify-center gap-8">
            {/* Previous Button */}
            <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={`p-3 transition-all ${
                    canGoPrevious
                        ? "text-[#6B8CC7] hover:text-[#3B5998]"
                        : "text-white/30 cursor-not-allowed"
                }`}
                aria-label="Previous track"
            >
                <ChevronsLeft className="w-12 h-12" />
            </button>

            {/* Play/Pause Button */}
            <button
                onClick={onPlayPause}
                className="p-4 transition-all text-[#E85A4F] hover:text-[#e6473a]"
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause className="w-16 h-16" /> : <Play className="w-16 h-16" />}
            </button>

            {/* Next Button */}
            <button
                onClick={onNext}
                disabled={!canGoNext}
                className={`p-3 transition-all ${
                    canGoNext
                        ? "text-[#6B8CC7] hover:text-[#3B5998]"
                        : "text-white/30 cursor-not-allowed"
                }`}
                aria-label="Next track"
            >
                <ChevronsRight className="w-12 h-12" />
            </button>
        </div>
    )
}
