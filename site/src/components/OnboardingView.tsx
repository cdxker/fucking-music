import { useEffect, useState } from "react"
import { AddMusicButton } from "./AddMusicButton"
import { Button } from "./ui/button"
import PlayerLayout from "./PlayerLayout"

const OnboardingView = () => {
    const [spotifyUser, setSpotifyUser] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const error = params.get("spotify_error")

        if (error) {
            console.error("Spotify auth error:", error)
            window.history.replaceState({}, "", "/onboarding")
        }

        fetch("/api/spotify/me")
            .then((res) => res.json())
            .then((data: { user: string | null }) => {
                setSpotifyUser(data.user)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    return (
        <PlayerLayout>
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0B0B] text-white">
                <div className="flex flex-col items-center space-y-10 border-2 border-white px-20 py-25 rounded-full">
                    <p>hi. Welcome to Rotations.</p>

                    {loading ? (
                        <p className="text-white/50">...</p>
                    ) : spotifyUser ? (
                        <p className="text-green-400">Connected as {spotifyUser}</p>
                    ) : (
                        <Button
                            variant="outline"
                            size="default"
                            className="text-white/70"
                            onClick={() => {
                                window.location.href = "/api/spotify/authorize"
                            }}
                        >
                            Connect Spotify
                        </Button>
                    )}

                    <p>or to just get started faster</p>

                    <AddMusicButton text="Add music from link" />
                </div>
            </div>
        </PlayerLayout>
    )
}

export default OnboardingView
