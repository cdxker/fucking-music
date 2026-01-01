import { useSpotify } from "@/hooks/SpotifyContext"
import { navigate } from "astro:transitions/client"
import { Button } from "./ui/button"
import { SpoitfyIcon } from "./icons"

export const SpotifyStatus = () => {
    const { spotifyUser, spotifyLogin } = useSpotify()

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => {
                if (!spotifyUser) {
                    spotifyLogin()
                } else {
                    navigate("/spotify/add");
                }
            }}
        >
            <div className="w-6 h-6">
                <SpoitfyIcon />
            </div>
            {!spotifyUser && <p>Connect Spotify</p>}
            {spotifyUser && <p>Add Playlist</p>}
        </Button>
    )
}
