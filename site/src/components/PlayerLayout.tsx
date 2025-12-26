import PlayerView from "./PlayerView"
import { useState, useEffect, useContext } from "react"
import type { FuckingPlaylist, FuckingTrack } from "../shared/types"
import { db } from "@/lib/store"
import { musicCache } from "@/lib/musicCache"
import { shuffleAssociations } from "@/lib/associations"
import { PlayerContext, PlayerProvider } from "@/hooks/PlayerContext"
import { AddMusicButton } from "./AddMusicButton"
import { TimeSlider } from "./TimeSlider"

function PlayerContent() {
    const playerContext = useContext(PlayerContext)

    if (!playerContext) {
        return null
    }

    return (
        <>
            <PlayerView />
            <div className="flex items-center justify-center w-full text-sm">
                <AddMusicButton />
            </div>
        </>
    )
}

export default function PlayerLayout() {
    const [initData, setInitData] = useState<{
        playlist?: FuckingPlaylist
        tracks: FuckingTrack[]
        initialTrackIndex: number
        initialTimeMs: number
    } | null>(null)
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        const init = async () => {
            await db.init()
            await musicCache.init()
            const playerState = db.getPlayerState()

            let playlist: FuckingPlaylist | undefined = undefined
            let tracks: FuckingTrack[] = []
            let initialTrackIndex = 0
            let initialTimeMs = 0

            if (playerState) {
                const savedPlaylist = db.getPlaylist(playerState.lastPlaylistId)
                const savedTracks = db.getTracks(playerState.lastPlaylistId)
                if (savedPlaylist && savedTracks.length > 0) {
                    const trackIndex = savedTracks.findIndex(
                        (t) => t.id === playerState.activeTrack
                    )
                    if (trackIndex !== -1) {
                        initialTrackIndex = trackIndex
                    }

                    initialTimeMs = playerState.trackTimestamp
                    playlist = savedPlaylist
                    tracks = savedTracks
                }
                shuffleAssociations()
            }

            setInitData({ playlist, tracks, initialTrackIndex, initialTimeMs })
            setInitializing(false)
        }
        init()
    }, [])

    if (initializing || !initData) {
        return <div className="min-h-screen bg-[#0B0B0B]" />
    }

    return (
        <div className="min-h-screen px-5 pt-8 pb-12 bg-[#0B0B0B]">
            <PlayerProvider
                initialPlaylist={initData.playlist}
                initialTracks={initData.tracks}
                initialTrackIndex={initData.initialTrackIndex}
                initialTimeMs={initData.initialTimeMs}
            >
                <PlayerContent />
                <TimeSlider />
            </PlayerProvider>
        </div>
    )
}
