import type { APIRoute } from "astro"
import type { SpotifyPlaylistsResponse } from "@/shared/types"
import { getAccessToken, jsonResponse, errorResponse, parsePaginationParams } from "@/lib/server"

export const GET: APIRoute = async ({ request, url }) => {
    const accessToken = getAccessToken(request)

    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    const { limit, offset } = parsePaginationParams(url)

    const playlistsResponse = await fetch(
        `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!playlistsResponse.ok) {
        return errorResponse("Failed to fetch playlists", playlistsResponse.status)
    }

    const playlists: SpotifyPlaylistsResponse = await playlistsResponse.json()
    return jsonResponse(playlists)
}
