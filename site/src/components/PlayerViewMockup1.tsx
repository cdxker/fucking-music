import { useState, useEffect } from "react"
import { db } from "@/lib/store"
import { getLeftRightTracks } from "@/lib/associations"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"

const PlayerViewMockup1 = () => {
    const [data, setData] = useState<{
        current: { playlist: FuckingPlaylist; track: FuckingTrack }
        left: { playlist: FuckingPlaylist; track: FuckingTrack } | null
        right: { playlist: FuckingPlaylist; track: FuckingTrack } | null
    } | null>(null)

    useEffect(() => {
        const loadData = async () => {
            await db.init()
            const state = db.getPlayerState()
            if (!state) return

            const playlist = db.getPlaylist(state.activePlaylist)
            const track = db.getTrack(state.activeTrack)

            if (!playlist || !track) return

            const neighbors = getLeftRightTracks(state.activePlaylist, state.activeTrack)

            setData({
                current: { playlist, track },
                left: neighbors.left,
                right: neighbors.right,
            })
        }

        loadData()
    }, [])

    const navigateToTrack = (
        target: {
            playlist: FuckingPlaylist
            track: FuckingTrack
        } | null
    ) => {
        if (!target) return
        db.setPlayerState({
            activePlaylist: target.playlist.id,
            activeTrack: target.track.id,
            trackTimestamp: 0,
            lastPlaylistId: target.playlist.id,
        })
        window.location.href = "/mockup1"
    }

    if (!data) return <div className="text-white">Loading...</div>

    const { current, left, right } = data

    return (
        <div className="flex items-center justify-center gap-8 h-full">
            {/* Left track - smaller, semi-transparent */}
            <div
                className={`transition-all ${left ? "opacity-50 scale-75 cursor-pointer hover:opacity-75" : "opacity-20"}`}
                onClick={() => navigateToTrack(left)}
            >
                {left ? (
                    <>
                        <img src={left.playlist.track_cover_uri} className="w-48 h-48 rounded-lg" />
                        <p className="text-sm text-white/60 mt-2 text-center">{left.track.name}</p>
                        <p className="text-xs text-white/40 text-center">{left.playlist.name}</p>
                    </>
                ) : (
                    <div className="w-48 h-48 bg-white/10 rounded-lg" />
                )}
            </div>

            {/* Current track - full size, centered */}
            <div className="flex flex-col items-center">
                <img
                    src={current.playlist.track_cover_uri}
                    className="w-64 h-64 rounded-lg shadow-2xl"
                />
                <p className="text-xl font-bold text-white mt-4">{current.track.name}</p>
                <p className="text-white/70">{current.track.artists.join(", ")}</p>
                <p className="text-white/50 text-sm">{current.playlist.name}</p>
            </div>

            {/* Right track - smaller, semi-transparent */}
            <div
                className={`transition-all ${right ? "opacity-50 scale-75 cursor-pointer hover:opacity-75" : "opacity-20"}`}
                onClick={() => navigateToTrack(right)}
            >
                {right ? (
                    <>
                        <img
                            src={right.playlist.track_cover_uri}
                            className="w-48 h-48 rounded-lg"
                        />
                        <p className="text-sm text-white/60 mt-2 text-center">{right.track.name}</p>
                        <p className="text-xs text-white/40 text-center">{right.playlist.name}</p>
                    </>
                ) : (
                    <div className="w-48 h-48 bg-white/10 rounded-lg" />
                )}
            </div>
        </div>
    )
}

export default PlayerViewMockup1
