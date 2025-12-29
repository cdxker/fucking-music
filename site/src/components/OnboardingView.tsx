import { useEffect, useState } from "react"
import { AddMusicButton } from "./AddMusicButton"
import { Button } from "./ui/button"
import PlayerLayout from "./PlayerLayout"
import type { SpotifyUserProfile } from "@/shared/types"

function getInitialError(): string | null {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    const spotifyError = params.get("spotify_error")
    if (spotifyError) {
        window.history.replaceState({}, "", "/bad-onboarding")
        return `Spotify connection failed: ${spotifyError}`
    }
    return null
}

const OnboardingView = () => {
    const [spotifyUser, setSpotifyUser] = useState<SpotifyUserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error] = useState<string | null>(getInitialError)

    useEffect(() => {
        fetch("/api/spotify/me")
            .then((res) => res.json())
            .then((data: { user: SpotifyUserProfile | null }) => {
                setSpotifyUser(data.user)
            })
            .catch(() => {})
            .finally(() => {
                setLoading(false)
            })
    }, [])

    return (
        <PlayerLayout>
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0B0B] text-white">
                <div className="flex flex-col items-center space-y-10 border-2 border-white px-20 py-25 rounded-full">
                    <p>hi. Welcome to Rotations.</p>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    {loading ? (
                        <p className="text-white/50">...</p>
                    ) : spotifyUser ? (
                        <p className="text-green-400">
                            Connected as {spotifyUser.display_name || spotifyUser.id}
                        </p>
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
