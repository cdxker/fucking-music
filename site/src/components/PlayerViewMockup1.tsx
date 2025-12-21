import { useState, useEffect } from "react"
import { useTrackNeighbors } from "@/hooks/useTrackNeighbors"
import type { FuckingPlaylist, FuckingTrack, TrackId } from "@/shared/types"
import Header from "./Header"

interface PlayerViewMockup1Props {
    playlist: FuckingPlaylist
    tracks: FuckingTrack[]
    currentTrackId: TrackId
    onNavigate?: (trackId: TrackId, playlistId: string) => void
}

function PlayerViewMockup1({
    playlist,
    tracks,
    currentTrackId,
    onNavigate,
}: PlayerViewMockup1Props) {
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
            <div className="max-w-4xl w-full">
                <Header active="less" />

                <div className="mt-8">
                    <div className="text-center mb-6">
                        <h1 className="text-white text-2xl font-semibold">{currentTrack.name}</h1>
                        <p className="text-white/60 text-lg mt-2">
                            {currentTrack.artists.join(", ")}
                        </p>
                        <p className="text-white/50 text-base mt-1">{playlist.name}</p>
                    </div>

                    {/* Three-panel album view */}
                    <div className="flex items-center justify-center gap-6 mt-8">
                        {/* Left neighbor */}
                        <div
                            className={`transition-all duration-200 ${
                                neighbors.left
                                    ? "opacity-50 hover:opacity-75 cursor-pointer hover:scale-105"
                                    : "opacity-20"
                            }`}
                            onClick={handleLeftClick}
                            style={{ width: "192px", height: "192px" }}
                        >
                            {neighbors.left ? (
                                <div className="relative group">
                                    <img
                                        src={neighbors.left.playlist.track_cover_uri}
                                        alt={neighbors.left.track.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs truncate">
                                            {neighbors.left.track.name}
                                        </p>
                                        <p className="text-white/60 text-xs truncate">
                                            {neighbors.left.playlist.name}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-white/10 rounded-lg" />
                            )}
                        </div>

                        {/* Current track (center) */}
                        <div className="flex-shrink-0" style={{ width: "256px", height: "256px" }}>
                            <img
                                src={playlist.track_cover_uri}
                                alt={currentTrack.name}
                                className="w-full h-full object-cover rounded-lg shadow-2xl"
                            />
                        </div>

                        {/* Right neighbor */}
                        <div
                            className={`transition-all duration-200 ${
                                neighbors.right
                                    ? "opacity-50 hover:opacity-75 cursor-pointer hover:scale-105"
                                    : "opacity-20"
                            }`}
                            onClick={handleRightClick}
                            style={{ width: "192px", height: "192px" }}
                        >
                            {neighbors.right ? (
                                <div className="relative group">
                                    <img
                                        src={neighbors.right.playlist.track_cover_uri}
                                        alt={neighbors.right.track.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs truncate">
                                            {neighbors.right.track.name}
                                        </p>
                                        <p className="text-white/60 text-xs truncate">
                                            {neighbors.right.playlist.name}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-white/10 rounded-lg" />
                            )}
                        </div>
                    </div>

                    {/* Navigation hint */}
                    <div className="text-center mt-8 text-white/40 text-sm">
                        Click on side albums to navigate to adjacent tracks
                    </div>

                    {/* Mockup switcher */}
                    <div className="flex justify-center gap-4 mt-8">
                        <a
                            href="/mockup1"
                            className="text-white bg-white/20 px-4 py-2 rounded-md text-sm"
                        >
                            Mockup 1 (Current)
                        </a>
                        <a
                            href="/mockup2"
                            className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md text-sm transition-colors"
                        >
                            Mockup 2
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerViewMockup1
