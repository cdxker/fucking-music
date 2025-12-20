/**
 * AudioBars - Animated equalizer-style bars that move when music is playing
 * Shows alternating red and blue bars with staggered animations for organic feel
 */
export const AudioBars = () => {
    return (
        <div className="inline-flex gap-[2px] items-end h-5">
            <div className="w-[3px] bg-[#E85A4F] animate-audio-bar-1" />
            <div className="w-[3px] bg-[#6B8CC7] animate-audio-bar-2" />
            <div className="w-[3px] bg-[#E85A4F] animate-audio-bar-3" />
            <div className="w-[3px] bg-[#6B8CC7] animate-audio-bar-4" />
            <div className="w-[3px] bg-[#E85A4F] animate-audio-bar-5" />
            <div className="w-[3px] bg-[#6B8CC7] animate-audio-bar-6" />
        </div>
    )
}

export default AudioBars
