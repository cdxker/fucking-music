import { useState } from "react"
import { Button } from "./ui/button"
import { usePlayer } from "@/hooks/PlayerContext"
import { db } from "@/lib/store"
import { Check, X } from "lucide-react"

export const AddBandcampButton = ({ text }: { text?: string }) => {
    const [showInput, setShowInput] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const { setPlaylistAndTracks } = usePlayer()

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

            setPlaylistAndTracks({
                playlistId: data.playlist.id,
            })
            setShowInput(false)
            setInputValue("")
        } catch (e) {
            alert("Failed to load music")
        }
    }

    if (showInput) {
        return (
            <div className="flex gap-2">
                <input
                    type="url"
                    placeholder="Paste URL..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="px-2 py-2 text-white text-sm border rounded-md focus:outline-none"
                    autoFocus
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="default"
                        className="text-white"
                        onClick={() => {
                            setShowInput(false)
                            setInputValue("")
                        }}
                    >
                        <X />
                    </Button>
                    <Button
                        variant="outline"
                        size="default"
                        className="text-white"
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                    >
                        <Check />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="outline"
            size="default"
            className="text-white"
            onClick={() => setShowInput(true)}
        >
            <div className="w-4 h-4">
                <img src="/bandcamp-logo.png" alt="" />
            </div>
            {text || "Add Music"}
        </Button>
    )
}
