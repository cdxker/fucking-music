import { usePlayer } from "@/hooks/PlayerContext"
import {
    ArrowDown,
    ArrowUp,
    FastForward,
    Pause,
    Play,
    Rewind,
    SkipBack,
    SkipForward,
} from "lucide-react"
import { formatTime } from "@/lib/utils"
import * as Slider from "@radix-ui/react-slider"

export interface TimeSliderProps {
    expanded: boolean
}

export const TimeSlider = ({ expanded }: TimeSliderProps) => {
    const { totalDuration, handleSeek, currentTimeMs, isPlaying, togglePlayPause } = usePlayer()

    return (
        <div className="bg-[#0B0B0B] flex justify-around max-w-screen z-20 sticky bottom-0">
            <div className="my-8">
                {!expanded && (
                    <a href="/more">
                        <ArrowUp color="#fff" />
                    </a>
                )}
                {expanded && (
                    <a href="/less">
                        <ArrowDown color="#fff" />
                    </a>
                )}
            </div>
            <div className="my-8 w-2xl">
                <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={[currentTimeMs]}
                    max={totalDuration}
                    step={1000}
                    onValueChange={([value]) => handleSeek(value)}
                >
                    <Slider.Track className="bg-[#6B8CC7] relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-[#3B5998] rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-3 h-3 bg-[#E85A4F] rounded-full focus:outline-none" />
                </Slider.Root>

                <div className="flex justify-between mt-2 text-white/70 z-20 text-sm">
                    <span className="bg-[radial-gradient(circle,#0B0B0B_0%,rgba(11,11,11,0.6)_50%,rgba(11,11,11,0.1)_100%)] z-20 text-sm">
                        {formatTime(currentTimeMs)}
                    </span>
                    <span className="bg-[radial-gradient(circle,#0B0B0B_0%,rgba(11,11,11,0.6)_50%,rgba(11,11,11,0.1)_100%)] z-20 text-sm">
                        {formatTime(totalDuration)}
                    </span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                    <SkipBack color="#fff" />
                    <Rewind color="#fff" />
                    <div
                        className="rounded-full bg-white text-black px-2 py-2"
                        onClick={togglePlayPause}
                    >
                        {!isPlaying && <Play />}
                        {isPlaying && <Pause />}
                    </div>
                    <FastForward color="#fff" />
                    <SkipForward color="#fff" />
                </div>
            </div>
            <div></div>
        </div>
    )
}
