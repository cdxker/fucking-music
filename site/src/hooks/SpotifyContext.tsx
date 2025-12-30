import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import type {
    FuckingPlaylist,
    FuckingTrack,
    PlaylistId,
    SpotifyPlaylist,
    SpotifyPlaylistsResponse,
    SpotifyPlaylistTracksResponse,
    SpotifyTrack,
    SpotifyUserProfile,
    TrackId,
} from "@/shared/types"
import { usePlayer } from "./PlayerContext"

export interface SpotifyContextValue {
    spotifyUser: SpotifyUserProfile | null
    spotifyLogin: () => void
}

const SpotifyContext = createContext<SpotifyContextValue | null>(null)

interface SpotifyProviderProps {
    children: ReactNode
}

const spotifyPlaylistToFuckingPlaylist = (playlist: SpotifyPlaylist): FuckingPlaylist => {
    const playlistId: PlaylistId = `play-spotify-${playlist.id}`
    const placeholderTrackId: TrackId = `track-spotify-${playlist.id}-placeholder`

    return {
        id: playlistId,
        track_cover_uri: playlist.images[0]?.url ?? "",
        name: playlist.name,
        artists: playlist.owner.display_name ? [playlist.owner.display_name] : [],
        first_track: {
            id: placeholderTrackId,
            time_ms: 0,
            name: "Loading...",
            artists: [],
            audio: { type: "stream", url: "" },
        },
        totalDurationMs: 0,
    }
}

const spotifyTrackToFuckingTrack = (track: SpotifyTrack): FuckingTrack => {
    return {
        id: `track-spotify-${track.id}`,
        time_ms: track.duration_ms,
        name: track.name,
        artists: track.artists.map((a) => a.name),
        audio: { type: "youtube", id: track.id },
    }
}

export function SpotifyProvider({ children }: SpotifyProviderProps) {
    const [spotifyUser, setSpotifyUser] = useState<SpotifyUserProfile | null>(null)

    const { addPlaylists, addTracks } = usePlayer()

    useEffect(() => {
        fetch("/api/spotify/me", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data: { user: SpotifyUserProfile | null }) => {
                setSpotifyUser(data.user)
            })
    }, [])

    useEffect(() => {
        if (!spotifyUser) return

        const fetchPlaylistsAndTracks = async () => {
            const playlistsRes = await fetch("/api/spotify/playlists?limit=50")
            const playlistsData: SpotifyPlaylistsResponse = await playlistsRes.json()
            const spotifyPlaylists = playlistsData.items
            if (!spotifyPlaylists || spotifyPlaylists.length == 0) return;
            const playlistsWithTracks = await Promise.all(
                spotifyPlaylists.map(async (playlist) => {
                    const tracksRes = await fetch(
                        `/api/spotify/playlists/${playlist.id}/tracks?limit=50`
                    )
                    const tracksData: SpotifyPlaylistTracksResponse = await tracksRes.json()

                    const tracks = tracksData.items
                        .filter((item) => item.track !== null)
                        .map((item) => spotifyTrackToFuckingTrack(item.track!))

                    const fuckingPlaylist = spotifyPlaylistToFuckingPlaylist(playlist)

                    if (tracks.length > 0) {
                        fuckingPlaylist.first_track = tracks[0]
                        fuckingPlaylist.totalDurationMs = tracks.reduce(
                            (sum, t) => sum + t.time_ms,
                            0
                        )
                    }

                    return { playlist: fuckingPlaylist, tracks }
                })
            )

            const playlists = playlistsWithTracks.map((p) => p.playlist)
            addPlaylists(playlists)

            for (const { playlist, tracks } of playlistsWithTracks) {
                addTracks(tracks, playlist.id)
            }
        }

        fetchPlaylistsAndTracks()
    }, [spotifyUser, addPlaylists, addTracks])

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
