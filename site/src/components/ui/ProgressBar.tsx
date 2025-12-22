import * as Slider from "@radix-ui/react-slider"

interface ProgressBarProps {
    currentTimeMs: number
    totalDurationMs: number
    currentTimeFormatted: string
    totalDurationFormatted: string
    onSeek: (value: number) => void
}

export const ProgressBar = ({
    currentTimeMs,
    totalDurationMs,
    currentTimeFormatted,
    totalDurationFormatted,
    onSeek,
}: ProgressBarProps) => {
    return (
        <div className="w-full">
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[currentTimeMs]}
                max={totalDurationMs}
                step={1000}
                onValueChange={([value]) => onSeek(value)}
            >
                <Slider.Track className="bg-white/30 relative grow rounded-full h-3">
                    <Slider.Range className="absolute bg-[#3B5998] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-[#E85A4F] rounded-full focus:outline-none" />
            </Slider.Root>

            <div className="flex justify-between mt-2 text-white/70 text-sm">
                <span className="bg-[radial-gradient(circle,#0B0B0B_0%,rgba(11,11,11,0.6)_50%,rgba(11,11,11,0.1)_100%)] z-20 px-2 py-4 rounded-full">
                    {currentTimeFormatted}
                </span>
                <span className="bg-[radial-gradient(circle,#0B0B0B_0%,rgba(11,11,11,0.6)_50%,rgba(11,11,11,0.1)_100%)] z-20 px-2 py-4 rounded-full">
                    {totalDurationFormatted}
                </span>
            </div>
        </div>
    )
}
