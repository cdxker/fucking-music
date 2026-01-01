import type { APIRoute } from "astro"
import type { FuckingPlaylist, SpotifyPlaylist, SpotifyPlaylistsResponse } from "@/shared/types"
import { getSpotifyAccessToken, jsonResponse, errorResponse, parsePaginationParams } from "@/lib/server"

interface RawSpotifyPlaylistsResponse {
    href: string
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
    items: SpotifyPlaylist[]
}

const spotifyPlaylistToFuckingPlaylist = (playlist: SpotifyPlaylist): FuckingPlaylist => {
    return {
        id: `play-spotify-${playlist.id}`,
        track_cover_uri: playlist.images[0]?.url ?? "",
        name: playlist.name,
        artists: playlist.owner.display_name ? [playlist.owner.display_name] : [],
        first_track: {
            id: `track-spotify-${playlist.id}-placeholder`,
            time_ms: 0,
            name: "Loading...",
            artists: [],
            audio: { type: "spotify", id: playlist.id },
        },
        totalDurationMs: 0,
        source: "spotify",
    }
}

export const GET: APIRoute = async ({ request, url }) => {
    const accessToken = await getSpotifyAccessToken(request)
    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    const { limit, offset } = parsePaginationParams(url)

    const playlistsResponse = await fetch(
        `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!playlistsResponse.ok) {
        return errorResponse(
            "Failed to fetch playlists: " + (await playlistsResponse.text()),
            playlistsResponse.status
        )
    }

    const rawPlaylists: RawSpotifyPlaylistsResponse = await playlistsResponse.json()
    const playlists: SpotifyPlaylistsResponse = {
        ...rawPlaylists,
        items: rawPlaylists.items.map(spotifyPlaylistToFuckingPlaylist),
    }
    return jsonResponse(playlists)
}
