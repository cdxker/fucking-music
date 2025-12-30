import type { APIRoute } from "astro"
import type { SpotifyPlaylistTracksResponse } from "@/shared/types"
import {
    getAccessToken,
    getRefreshToken,
    refreshAccessToken,
    jsonResponse,
    errorResponse,
    parsePaginationParams,
} from "@/lib/server"

async function fetchTracks(accessToken: string, playlistId: string, limit: number, offset: number) {
    return fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )
}

export const GET: APIRoute = async ({ params, request, url }) => {
    let accessToken = getAccessToken(request)
    const playlistId = params.id

    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    if (!playlistId) {
        return errorResponse("Playlist ID required", 400)
    }

    const { limit, offset } = parsePaginationParams(url)

    let tracksResponse = await fetchTracks(accessToken, playlistId, limit, offset)

    if (tracksResponse.status === 401) {
        const refreshToken = getRefreshToken(request)
        if (!refreshToken) {
            return errorResponse("Not authenticated", 401)
        }

        const refreshResult = await refreshAccessToken(refreshToken)
        if (!refreshResult) {
            return errorResponse("Failed to refresh token", 401)
        }

        accessToken = refreshResult.accessToken
        tracksResponse = await fetchTracks(accessToken, playlistId, limit, offset)

        if (!tracksResponse.ok) {
            return errorResponse("Failed to fetch tracks", tracksResponse.status)
        }

        const tracks: SpotifyPlaylistTracksResponse = await tracksResponse.json()
        return new Response(JSON.stringify(tracks), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": refreshResult.setCookieHeader,
            },
        })
    }

    if (!tracksResponse.ok) {
        return errorResponse("Failed to fetch tracks", tracksResponse.status)
    }

    const tracks: SpotifyPlaylistTracksResponse = await tracksResponse.json()
    return jsonResponse(tracks)
}
