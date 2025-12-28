import type { APIRoute } from "astro"
import type { SpotifyPlaylistTracksResponse } from "../../../../../shared/types"

function parseCookies(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {}
    return Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
            const [key, ...vals] = cookie.trim().split("=")
            return [key, vals.join("=")]
        })
    )
}

export const GET: APIRoute = async ({ params, request, url }) => {
    const cookies = parseCookies(request.headers.get("cookie"))
    const accessToken = cookies.spotify_access_token
    const playlistId = params.id

    if (!accessToken) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        })
    }

    if (!playlistId) {
        return new Response(JSON.stringify({ error: "Playlist ID required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }

    const limit = url.searchParams.get("limit") || "50"
    const offset = url.searchParams.get("offset") || "0"

    const tracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!tracksResponse.ok) {
        const errorText = await tracksResponse.text()
        console.error("Failed to fetch tracks:", errorText)
        return new Response(JSON.stringify({ error: "Failed to fetch tracks" }), {
            status: tracksResponse.status,
            headers: { "Content-Type": "application/json" },
        })
    }

    const tracks: SpotifyPlaylistTracksResponse = await tracksResponse.json()

    return new Response(JSON.stringify(tracks), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
}
