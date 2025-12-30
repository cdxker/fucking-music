import { useSpotify } from "@/hooks/SpotifyContext"
import { Button } from "./ui/button"
import { SpoitfyIcon } from "./icons"

export const SpotifyStatus = () => {
    const { spotifyUser, spotifyLogin } = useSpotify()

    return (
        <Button
            onClick={() => {
                if (!spotifyUser) spotifyLogin()
            }}
        >
            <div className="w-6 h-6">
                <SpoitfyIcon />
            </div>
            {!spotifyUser && <p>Connect Spotify</p>}

            {spotifyUser && <p>Connected as {spotifyUser.display_name}</p>}
        </Button>
    )
}
