import { useState, useEffect } from "react"
import { db } from "@/lib/store"
import PlayerViewMockup1 from "./PlayerViewMockup1"
import type { FuckingPlaylist, FuckingTrack, PlaylistId, TrackId } from "@/shared/types"
import { musicCache } from "@/lib/musicCache"

export default function Mockup1Wrapper() {
    const [playlist, setPlaylist] = useState<FuckingPlaylist | null>(null)
    const [tracks, setTracks] = useState<FuckingTrack[]>([])
    const [currentTrackId, setCurrentTrackId] = useState<TrackId | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            await db.init()
            await musicCache.init()

            const playerState = db.getPlayerState()
            if (playerState) {
                const savedPlaylist = db.getPlaylist(playerState.lastPlaylistId)
                const savedTracks = db.getTracks(playerState.lastPlaylistId)

                if (savedPlaylist && savedTracks.length > 0) {
                    setPlaylist(savedPlaylist)
                    setTracks(savedTracks)
                    setCurrentTrackId(playerState.activeTrack || savedTracks[0].id)
                }
            }

            setLoading(false)
        }

        init()
    }, [])

    const handleNavigate = (trackId: TrackId, playlistId: string) => {
        const newPlaylist = db.getPlaylist(playlistId as PlaylistId)
        const newTracks = db.getTracks(playlistId as PlaylistId)

        if (newPlaylist && newTracks.length > 0) {
            setPlaylist(newPlaylist)
            setTracks(newTracks)
            setCurrentTrackId(trackId)
            db.setPlayerState({
                activeTrack: trackId,
                lastPlaylistId: playlistId as PlaylistId,
            })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
                <div className="text-white/70">Loading...</div>
            </div>
        )
    }

    if (!playlist || !tracks.length || !currentTrackId) {
        return (
            <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-white/70 text-xl mb-4">No music loaded</div>
                    <a href="/" className="text-white/50 hover:text-white underline">
                        Go to home page to add music
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0B0B0B]">
            <PlayerViewMockup1
                playlist={playlist}
                tracks={tracks}
                currentTrackId={currentTrackId}
                onNavigate={handleNavigate}
            />
        </div>
    )
}
