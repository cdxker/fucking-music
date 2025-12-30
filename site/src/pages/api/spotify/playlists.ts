import type { APIRoute } from "astro"
import type { SpotifyPlaylistsResponse } from "@/shared/types"
import {
    getAccessToken,
    getRefreshToken,
    refreshAccessToken,
    jsonResponse,
    errorResponse,
    parsePaginationParams,
} from "@/lib/server"

async function fetchPlaylists(accessToken: string, limit: number, offset: number) {
    return fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export const GET: APIRoute = async ({ request, url }) => {
    let accessToken = getAccessToken(request)

    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    const { limit, offset } = parsePaginationParams(url)

    let playlistsResponse = await fetchPlaylists(accessToken, limit, offset)

    if (playlistsResponse.status === 401) {
        const refreshToken = getRefreshToken(request)
        if (!refreshToken) {
            return errorResponse("Not authenticated", 401)
        }

        const refreshResult = await refreshAccessToken(refreshToken)
        if (!refreshResult) {
            return errorResponse("Failed to refresh token", 401)
        }

        accessToken = refreshResult.accessToken
        playlistsResponse = await fetchPlaylists(accessToken, limit, offset)

        if (!playlistsResponse.ok) {
            return errorResponse(
                "Failed to fetch playlists" + (await playlistsResponse.text()),
                playlistsResponse.status
            )
        }

        const playlists: SpotifyPlaylistsResponse = await playlistsResponse.json()
        return new Response(JSON.stringify(playlists), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": refreshResult.setCookieHeader,
            },
        })
    }

    if (!playlistsResponse.ok) {
        return errorResponse(
            "Failed to fetch playlists" + (await playlistsResponse.text()),
            playlistsResponse.status
        )
    }

    const playlists: SpotifyPlaylistsResponse = await playlistsResponse.json()
    return jsonResponse(playlists)
}
