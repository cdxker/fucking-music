import { useSpotify } from "@/hooks/SpotifyContext"
import { Button } from "./ui/button"
import { SpoitfyIcon } from "./icons"

export const SpotifyStatus = () => {
    const { spotifyUser, spotifyLogin } = useSpotify()

    return (
        <Button
            variant={"outline"}
            onClick={() => {
                if (!spotifyUser) {
                    spotifyLogin()
                } else {
                    window.location.href = "/spotify/add"
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
