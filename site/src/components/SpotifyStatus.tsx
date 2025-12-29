import type { SpotifyUserProfile } from "@/shared/types"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { SpoitfyIcon } from "./icons"

export const SpotifyStatus = () => {
    const [user, setUser] = useState<SpotifyUserProfile | null>(null)

    useEffect(() => {
        fetch("/api/spotify/me", {
            credentials: "include"
        })
            .then((res) => res.json())
            .then((data: { user: SpotifyUserProfile | null }) => {
                console.log(data);
                setUser(data.user)
            })
    }, [])

    return (
            <Button
                onClick={() => {
                    if (!user) window.location.href = "/api/spotify/authorize"
                }}
            >
                <div className="w-6 h-6">
                    <SpoitfyIcon />
                </div>
                {!user && (
                <p>Connect Spotify</p>)}

                {user && (
                <p>Connected as {user.display_name}</p>)}
            </Button>
    )
}
