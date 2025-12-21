import { useState, useEffect } from "react"
import { db } from "@/lib/store"
import { getAllLinkedTracks } from "@/lib/associations"
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types"

const PlayerViewMockup2 = () => {
    const [data, setData] = useState<{
        current: { playlist: FuckingPlaylist; track: FuckingTrack }
        links: Array<{ playlist: FuckingPlaylist; track: FuckingTrack }>
    } | null>(null)

    useEffect(() => {
        const loadData = async () => {
            await db.init()
            const state = db.getPlayerState()
            if (!state) return

            const playlist = db.getPlaylist(state.activePlaylist)
            const track = db.getTrack(state.activeTrack)

            if (!playlist || !track) return

            setData({
                current: { playlist, track },
                links: getAllLinkedTracks(state.activePlaylist, state.activeTrack),
            })
        }

        loadData()
    }, [])

    const navigateToTrack = (target: { playlist: FuckingPlaylist; track: FuckingTrack }) => {
        db.setPlayerState({
            activePlaylist: target.playlist.id,
            activeTrack: target.track.id,
            trackTimestamp: 0,
            lastPlaylistId: target.playlist.id,
        })
        window.location.href = "/mockup2"
    }

    if (!data) return <div className="text-white">Loading...</div>

    const { current, links } = data

    // Split links into left and right columns
    const midpoint = Math.ceil(links.length / 2)
    const leftLinks = links.slice(0, midpoint)
    const rightLinks = links.slice(midpoint)

    return (
        <div className="flex items-center justify-center h-full">
            {/* Left sidebar - playlist links */}
            <div className="flex flex-col gap-3 w-48">
                {leftLinks.map((link) => (
                    <button
                        key={`${link.playlist.id}-${link.track.id}`}
                        onClick={() => navigateToTrack(link)}
                        className="text-left text-white/60 hover:text-white transition-colors p-2 rounded hover:bg-white/5"
                    >
                        <span className="text-xs text-white/40 block">{link.playlist.name}</span>
                        <span className="text-sm">{link.track.name}</span>
                    </button>
                ))}
            </div>

            {/* Center - current track with album art */}
            <div className="flex flex-col items-center mx-16">
                <img
                    src={current.playlist.track_cover_uri}
                    className="w-80 h-80 rounded-lg shadow-2xl"
                />
                <h2 className="text-2xl font-bold text-white mt-4">{current.track.name}</h2>
                <p className="text-white/70">{current.track.artists.join(", ")}</p>
                <p className="text-white/50 text-sm">{current.playlist.name}</p>
            </div>

            {/* Right sidebar - playlist links */}
            <div className="flex flex-col gap-3 w-48">
                {rightLinks.map((link) => (
                    <button
                        key={`${link.playlist.id}-${link.track.id}`}
                        onClick={() => navigateToTrack(link)}
                        className="text-right text-white/60 hover:text-white transition-colors p-2 rounded hover:bg-white/5"
                    >
                        <span className="text-xs text-white/40 block">{link.playlist.name}</span>
                        <span className="text-sm">{link.track.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default PlayerViewMockup2
