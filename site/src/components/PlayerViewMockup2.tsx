import { useState, useEffect } from "react"
import { useTrackNeighbors } from "@/hooks/useTrackNeighbors"
import type { FuckingPlaylist, FuckingTrack, TrackId } from "@/shared/types"
import Header from "./Header"

interface PlayerViewMockup2Props {
    playlist: FuckingPlaylist
    tracks: FuckingTrack[]
    currentTrackId: TrackId
    onNavigate?: (trackId: TrackId, playlistId: string) => void
}

function PlayerViewMockup2({
    playlist,
    tracks,
    currentTrackId,
    onNavigate,
}: PlayerViewMockup2Props) {
    const [currentTrack, setCurrentTrack] = useState<FuckingTrack | null>(null)
    const neighbors = useTrackNeighbors(currentTrackId)

    useEffect(() => {
        const track = tracks.find((t) => t.id === currentTrackId)
        setCurrentTrack(track || null)
    }, [currentTrackId, tracks])

    if (!currentTrack) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center min-h-screen">
                <div className="text-white/70">Loading...</div>
            </div>
        )
    }

    const handleLeftClick = () => {
        if (neighbors.left && onNavigate) {
            onNavigate(neighbors.left.track.id, neighbors.left.playlist.id)
        }
    }

    const handleRightClick = () => {
        if (neighbors.right && onNavigate) {
            onNavigate(neighbors.right.track.id, neighbors.right.playlist.id)
        }
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center min-h-screen px-5 py-8">
            <div className="max-w-5xl w-full">
                <Header active="less" />

                <div className="mt-8">
                    {/* Current track info */}
                    <div className="text-center mb-6">
                        <h1 className="text-white text-2xl font-semibold">{currentTrack.name}</h1>
                        <p className="text-white/60 text-lg mt-2">
                            {currentTrack.artists.join(", ")}
                        </p>
                    </div>

                    {/* Three-panel layout with sidebars */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        {/* Left sidebar */}
                        <div
                            className={`w-48 transition-all duration-200 ${
                                neighbors.left
                                    ? "cursor-pointer hover:scale-105"
                                    : "opacity-30"
                            }`}
                            onClick={handleLeftClick}
                        >
                            {neighbors.left ? (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-white/80 text-sm font-medium truncate">
                                            {neighbors.left.playlist.name}
                                        </p>
                                        <p className="text-white/50 text-xs mt-1 truncate">
                                            {neighbors.left.track.name}
                                        </p>
                                    </div>
                                    <img
                                        src={neighbors.left.playlist.track_cover_uri}
                                        alt={neighbors.left.track.name}
                                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                                    />
                                    <div className="text-center">
                                        <p className="text-white/40 text-xs">← Previous</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="h-10" />
                                    <div className="w-full aspect-square bg-white/10 rounded-lg" />
                                    <div className="h-4" />
                                </div>
                            )}
                        </div>

                        {/* Center - current track */}
                        <div className="flex-shrink-0" style={{ width: "320px" }}>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-white text-base font-semibold">
                                        {playlist.name}
                                    </p>
                                    <p className="text-white/70 text-sm mt-1">Now Playing</p>
                                </div>
                                <img
                                    src={playlist.track_cover_uri}
                                    alt={currentTrack.name}
                                    className="w-full aspect-square object-cover rounded-lg shadow-2xl"
                                />
                            </div>
                        </div>

                        {/* Right sidebar */}
                        <div
                            className={`w-48 transition-all duration-200 ${
                                neighbors.right
                                    ? "cursor-pointer hover:scale-105"
                                    : "opacity-30"
                            }`}
                            onClick={handleRightClick}
                        >
                            {neighbors.right ? (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-white/80 text-sm font-medium truncate">
                                            {neighbors.right.playlist.name}
                                        </p>
                                        <p className="text-white/50 text-xs mt-1 truncate">
                                            {neighbors.right.track.name}
                                        </p>
                                    </div>
                                    <img
                                        src={neighbors.right.playlist.track_cover_uri}
                                        alt={neighbors.right.track.name}
                                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                                    />
                                    <div className="text-center">
                                        <p className="text-white/40 text-xs">Next →</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="h-10" />
                                    <div className="w-full aspect-square bg-white/10 rounded-lg" />
                                    <div className="h-4" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation hint */}
                    <div className="text-center mt-8 text-white/40 text-sm">
                        Discover music across playlists by clicking on adjacent tracks
                    </div>

                    {/* Mockup switcher */}
                    <div className="flex justify-center gap-4 mt-8">
                        <a
                            href="/mockup1"
                            className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md text-sm transition-colors"
                        >
                            Mockup 1
                        </a>
                        <a
                            href="/mockup2"
                            className="text-white bg-white/20 px-4 py-2 rounded-md text-sm"
                        >
                            Mockup 2 (Current)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerViewMockup2
