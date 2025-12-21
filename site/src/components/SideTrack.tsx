import { cn } from "@/lib/utils";
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types";


export default function SideTrack({ track, playlist, position }: { track: FuckingTrack, playlist: FuckingPlaylist, position: "left" | "right" }) {


    return (
        <div className={cn("absolute text-sm text-white top-50 origin-left w-6/12 z-0", {
            "left-20 text-left": position === "left",
            "right-20 text-right": position === "right",
        })}>
            <img src={playlist.track_cover_uri} alt=""/>
            <h1>{playlist.name}</h1>
            <p>{track.name}</p>
        </div>
    )
}
