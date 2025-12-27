import { usePlayer } from "@/hooks/PlayerContext";
import { cn } from "@/lib/utils";
import { db } from "@/lib/store";
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types";


export default function SideTrack({ track, playlist, position }: { track?: FuckingTrack, playlist?: FuckingPlaylist, position: "left" | "right" }) {
    const {
        setPlaylistAndTracks
    } = usePlayer()

    if (!track || !playlist) {
        return null
    }

    const handleClick = () => {
        const tracks = db.getTracks(playlist.id)
        const trackIndex = tracks.findIndex(t => t.id === track.id)
        setPlaylistAndTracks({
            playlist,
            tracks,
            startingTrackIndex: trackIndex !== -1 ? trackIndex : 0
        })
    }

    return (
        <div className={cn("absolute opacity-25 text-sm text-white top-25 space-y-2 origin-left w-6/12 md:w-4/12 z-0 cursor-pointer", {
            "left-20 text-left": position === "left",
            "right-20 text-right": position === "right",
        })}
            onClick={handleClick}>
            <h1 >{playlist.name}</h1>
            <img src={playlist.track_cover_uri} alt=""/>
            <h2>{track.name}</h2>
        </div>
    )
}
