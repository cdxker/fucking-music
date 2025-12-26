import { useContext, useState } from "react";
import { Button } from "./ui/button";
import { PlayerContext } from "@/hooks/PlayerContext";
import { db } from "@/lib/store";


export const AddMusicButton = () => {

    const [showInput, setShowInput] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const playerContext = useContext(PlayerContext)


    if (!playerContext) {
        return null
    }

    const {
        setPlaylistAndTracks,
    } = playerContext;

    const getApiEndpoint = (url: string): string => {
        if (url.includes("spotify.com")) {
            return "/api/spotify/scrape"
        }
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            return "/api/youtube/scrape"
        }
        return "/api/bandcamp/scrape"
    }


    const handleSubmit = async () => {
        if (!inputValue.trim()) return

        try {
            const endpoint = getApiEndpoint(inputValue)
            const res = await fetch(`${endpoint}?url=${encodeURIComponent(inputValue)}`)
            const data = await res.json()

            if (!res.ok || data.error) {
                alert(data.error || "Failed to load music")
                return
            }

            db.insertPlaylist(data.playlist)
            db.insertTracks(data.tracks, data.playlist.id)

            setPlaylistAndTracks({ playlist: data.playlist, tracks: data.tracks, startingTrackIndex: 0 })
            setShowInput(false)
            setInputValue("")
        } catch (e) {
            alert("Failed to load music")
        }
    }

    if (showInput) {
        return (
            <div className="flex flex-col gap-4 w-full max-w-md">
                <input
                    type="url"
                    placeholder="Paste Bandcamp, Spotify, or YouTube URL..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full px-4 py-3 text-lg text-white bg-transparent border border-white/30 rounded-md focus:outline-none focus:border-white/60"
                    autoFocus
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="default"
                        className="flex-1 text-white/70"
                        onClick={() => {
                            setShowInput(false)
                            setInputValue("")
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outline"
                        size="default"
                        className="flex-1 text-white/70"
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                    >
                        Load
                    </Button>
                </div>
            </div>
        );
    }

    return (
    <Button
        variant="outline"
        size="default"
        className="text-white/70"
        onClick={() => setShowInput(true)}
    >
        Add Music
    </Button>

    );
}
