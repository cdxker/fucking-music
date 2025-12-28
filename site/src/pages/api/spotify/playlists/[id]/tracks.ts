import type { APIRoute } from "astro"
import type { SpotifyPlaylistTracksResponse } from "@/shared/types"
import { getAccessToken, jsonResponse, errorResponse, parsePaginationParams } from "@/lib/server"

export const GET: APIRoute = async ({ params, request, url }) => {
    const accessToken = getAccessToken(request)
    const playlistId = params.id

    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    if (!playlistId) {
        return errorResponse("Playlist ID required", 400)
    }

    const { limit, offset } = parsePaginationParams(url)

    const tracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!tracksResponse.ok) {
        return errorResponse("Failed to fetch tracks", tracksResponse.status)
    }

    const tracks: SpotifyPlaylistTracksResponse = await tracksResponse.json()
    return jsonResponse(tracks)
}
