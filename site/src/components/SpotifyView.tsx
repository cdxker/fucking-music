import { useEffect, useState } from "react"
import PlayerLayout from "./PlayerLayout"
import type { SpotifyPlaylist, SpotifyPlaylistsResponse, SpotifyUserProfile } from "@/shared/types"

const SpotifyView = () => {
    const [user, setUser] = useState<SpotifyUserProfile | null>(null)
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch("/api/spotify/me")
                const userData = await userRes.json()

                if (!userData.user) {
                    window.location.href = "/onboarding"
                    return
                }

                setUser(userData.user)

                const playlistsRes = await fetch("/api/spotify/playlists?limit=50")
                if (!playlistsRes.ok) {
                    throw new Error("Failed to fetch playlists")
                }

                const playlistsData: SpotifyPlaylistsResponse = await playlistsRes.json()
                setPlaylists(playlistsData.items)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <PlayerLayout>
                <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
                    <p className="text-white/50">Loading...</p>
                </div>
            </PlayerLayout>
        )
    }

    if (error) {
        return (
            <PlayerLayout>
                <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
                    <p className="text-red-400">{error}</p>
                </div>
            </PlayerLayout>
        )
    }

    return (
        <PlayerLayout>
            <div className="min-h-screen bg-[#0B0B0B] text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        {user?.images?.[0]?.url && (
                            <img
                                src={user.images[0].url}
                                alt={user.display_name || "Profile"}
                                className="w-12 h-12 rounded-full"
                            />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold">
                                {user?.display_name || user?.id}'s Playlists
                            </h1>
                            <p className="text-white/50">{playlists.length} playlists</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {playlists.map((playlist) => (
                            <a
                                key={playlist.id}
                                href={playlist.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                            >
                                <div className="aspect-square mb-4 bg-white/10 rounded overflow-hidden">
                                    {playlist.images?.[0]?.url ? (
                                        <img
                                            src={playlist.images[0].url}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/30">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium truncate group-hover:text-green-400 transition-colors">
                                    {playlist.name}
                                </h3>
                                <p className="text-sm text-white/50 truncate">
                                    {playlist.tracks.total} tracks
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </PlayerLayout>
    )
}

export default SpotifyView
