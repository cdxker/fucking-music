import { useMemo } from "react"
import type { FuckingPlaylist, FuckingTrack, PlaylistId, TrackId } from "@/shared/types"
import { db } from "@/lib/store"
import SideTrack from "./SideTrack"
import { usePlayer } from "@/hooks/PlayerContext"
import { cn, formatTime } from "@/lib/utils"
import { Pause, Play } from "lucide-react"
import { AddMusicButton } from "./AddMusicButton"
import { TimeSlider } from "./TimeSlider"
import PlayerLayout from "./PlayerLayout"

function MusicView() {
    const {
        playlist,
        tracks,
        currentTrackIndex,
        currentTimeMs,
        isPlaying,
        currentTrack,
        togglePlayPause,
        handleTrackSelect,
    } = usePlayer()

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
            )
            .map(([playlistId, trackId]) => ({
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
                <SideTrack
                    track={nextTracks[0]?.track}
                    playlist={nextTracks[0]?.playlist}
                    position="left"
                />
                <div className="text-white/90 text-2xl">
                    <p className="capitalize">{playlist.name}</p>
                </div>
                <div className="mt-2 relative z-20">
                    <div>
                        <img
                            src={playlist.track_cover_uri}
                            alt={`${playlist.name} album cover`}
                            className="w-full aspect-square object-cover"
                        />
                        <button
                            onClick={togglePlayPause}
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                            {!isPlaying && <Play color="#fff" size="50" />}
                            {isPlaying && <Pause color="#fff" size="50" />}
                        </button>
                    </div>
                </div>
                <SideTrack
                    track={nextTracks[1]?.track}
                    playlist={nextTracks[1]?.playlist}
                    position="right"
                />

                <div className="mt-4 space-y-1">
                    <div className="text-white/90 text-2xl">
                        <p className="capitalize">{currentTrack.name}</p>
                    </div>
                    <div className="flex justify-between text-white/60 text-lg">
                        <span>by {playlist.artists[0]}</span>
                        <span>{remainingMinutes} minutes left</span>
                    </div>
                </div>
                <div className="mt-4 space-y-3 z-20 -ml-6">
                    {tracks.map((track, index) => (
                        <div
                            key={track.id}
                            className="flex items-center justify-between text-white/70 cursor-pointer hover:text-white/90 transition-colors"
                            onClick={() => handleTrackSelect(index)}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn("z-20 text-base ml-6", {
                                        "text-white": index === currentTrackIndex,
                                    })}
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

function PlayerView() {
    return (
        <PlayerLayout>
            <div className="min-h-screen px-5 pt-8 pb-12 bg-[#0B0B0B]">
                <MusicView />
                <div className="flex items-center justify-center w-full text-sm">
                    <AddMusicButton />
                </div>
                <TimeSlider expanded={false} />
            </div>
        </PlayerLayout>
    )
}

export default PlayerView
