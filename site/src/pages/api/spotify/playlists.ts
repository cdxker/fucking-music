import type { APIRoute } from "astro"
import type { SpotifyPlaylistsResponse } from "../../../shared/types"

function parseCookies(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {}
    return Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
            const [key, ...vals] = cookie.trim().split("=")
            return [key, vals.join("=")]
        })
    )
}

export const GET: APIRoute = async ({ request, url }) => {
    const cookies = parseCookies(request.headers.get("cookie"))
    const accessToken = cookies.spotify_access_token

    if (!accessToken) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        })
    }

    const limit = url.searchParams.get("limit") || "50"
    const offset = url.searchParams.get("offset") || "0"

    const playlistsResponse = await fetch(
        `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!playlistsResponse.ok) {
        const errorText = await playlistsResponse.text()
        console.error("Failed to fetch playlists:", errorText)
        return new Response(JSON.stringify({ error: "Failed to fetch playlists" }), {
            status: playlistsResponse.status,
            headers: { "Content-Type": "application/json" },
        })
    }

    const playlists: SpotifyPlaylistsResponse = await playlistsResponse.json()

    return new Response(JSON.stringify(playlists), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
}
