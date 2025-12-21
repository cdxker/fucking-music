import { useMemo } from "react"
import * as Slider from "@radix-ui/react-slider"
import type { FuckingPlaylist, FuckingTrack, PlaylistId, TrackId } from "@/shared/types"
import Header from "./Header"
import { db } from "@/lib/store"
import SideTrack from "./SideTrack"
import { usePlayerState } from "@/hooks/usePlayerState"

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function PlayerView() {
    const {
        playlist,
        tracks,
        currentTrackIndex,
        currentTimeMs,
        isPlaying,
        currentTrack,
        totalDuration,
        togglePlayPause,
        handleSeek,
        handleTrackSelect,
    } = usePlayerState()

    const remainingMs = useMemo(() => {
        if (!currentTrack) return 0
        const remainingInCurrentTrack = currentTrack.time_ms - currentTimeMs
        const remainingTracks = tracks.slice(currentTrackIndex + 1)
        const remainingTracksTime = remainingTracks.reduce((acc, track) => acc + track.time_ms, 0)
        return remainingInCurrentTrack + remainingTracksTime
    }, [currentTrack, currentTrackIndex, currentTimeMs, tracks])

    const remainingMinutes = Math.floor(remainingMs / 60000)

    const nextTracks = useMemo(() => {
        if (!currentTrack?.next_tracks || !playlist) return []
        return Object.entries(currentTrack.next_tracks)
            .filter(([playlistId]) => playlistId !== playlist.id)
            .filter(
                ([playlistId, track]) =>
                    track !== undefined &&
                    track !== null &&
                    playlistId !== null &&
                    playlistId !== undefined
            ).map(([playlistId, trackId]) => ({
                playlist: db.getPlaylist(playlistId as PlaylistId) as FuckingPlaylist,
                track: db.getTrack(trackId as TrackId) as FuckingTrack,
            }))
    }, [currentTrack, playlist])

    if (!playlist || !currentTrack) {
        return null
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center">
            <div className="max-w-2xl">
                <Header active="less" />

                <div className="mt-4 space-y-1">
                    <div className="flex gap-4 text-white/90 text-base">
                        <span>{playlist.name}</span>
                        <span className="capitalize">{currentTrack.name}</span>
                    </div>
                    <div className="flex justify-between text-white/60 text-base">
                        <span>{playlist.artists[0]}</span>
                        <span>{remainingMinutes} minutes left</span>
                    </div>
                </div>

                <div className="flex">
                    <SideTrack
                        track={nextTracks[0]?.track}
                        playlist={nextTracks[0]?.playlist}
                        position="left"
                    />
                    <div className="mt-2 relative z-20">
                        <div>
                            <img
                                src={playlist.track_cover_uri}
                                alt={`${playlist.name} album cover`}
                                className="w-full aspect-square object-cover"
                            />
                            <button
                                onClick={togglePlayPause}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                            >
                                <span className="text-white text-6xl">{isPlaying ? "⏸" : "▶"}</span>
                            </button>
                        </div>
                    </div>
                    <SideTrack
                        track={nextTracks[1]?.track}
                        playlist={nextTracks[1]?.playlist}
                        position="right"
                    />
                </div>

                <div className="mt-4 z-20">
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
                        <span className="bg-[radial-gradient(circle,#0B0B0B_0%,rgba(11,11,11,0.6)_50%,rgba(11,11,11,0.1)_100%)] z-20 px-2 py-4 rounded-full">{formatTime(currentTimeMs)}</span>
                        <span className="bg-[radial-gradient(circle,#0B0B0B_0%,rgba(11,11,11,0.6)_50%,rgba(11,11,11,0.1)_100%)] z-20 px-2 py-4 rounded-full">{formatTime(totalDuration)}</span>
                    </div>
                </div>

                <div className="mt-4 space-y-3 z-20">
                    {tracks.map((track, index) => (
                        <div
                            key={track.id}
                            className="flex items-center justify-between text-white/70 cursor-pointer hover:text-white/90 transition-colors"
                            onClick={() => handleTrackSelect(index)}
                        >
                            <div className="flex items-center gap-3">
                                {index === currentTrackIndex && (
                                    <span className="text-white text-sm">▶</span>
                                )}
                                <span
                                    className={`z-20 text-base ${index === currentTrackIndex ? "text-white ml-0" : "ml-6"}`}
                                >
                                    {track.name}
                                </span>
                            </div>
                            <span className="text-sm">{formatTime(track.time_ms)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PlayerView
