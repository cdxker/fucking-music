import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import type { SpotifyUserProfile } from "@/shared/types"

export interface SpotifyContextValue {
    spotifyUser: SpotifyUserProfile | null
    spotifyLogin: () => void
}

const SpotifyContext = createContext<SpotifyContextValue | null>(null)

interface SpotifyProviderProps {
    children: ReactNode
}

export function SpotifyProvider({ children }: SpotifyProviderProps) {
    const [spotifyUser, setSpotifyUser] = useState<SpotifyUserProfile | null>(null)

    useEffect(() => {
        fetch("/api/spotify/me", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data: { user: SpotifyUserProfile | null }) => {
                setSpotifyUser(data.user)
            })
    }, [])

    const spotifyLogin = () => {
        window.location.href = "/api/spotify/authorize"
    }

    const value: SpotifyContextValue = {
        spotifyUser,
        spotifyLogin,
    }

    return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>
}

export function useSpotify(): SpotifyContextValue {
    const context = useContext(SpotifyContext)
    if (!context) {
        throw new Error("useSpotify must be used within a SpotifyProvider")
    }
    return context
}
