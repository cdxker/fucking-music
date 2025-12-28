import type { APIRoute } from "astro"
import type { SpotifyUserProfile } from "../../../shared/types"

function parseCookies(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {}
    return Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
            const [key, ...vals] = cookie.trim().split("=")
            return [key, vals.join("=")]
        })
    )
}

export const GET: APIRoute = async ({ request }) => {
    const cookies = parseCookies(request.headers.get("cookie"))
    const spotifyUserCookie = cookies.spotify_user

    if (!spotifyUserCookie) {
        return new Response(JSON.stringify({ user: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    }

    try {
        const user: SpotifyUserProfile = JSON.parse(decodeURIComponent(spotifyUserCookie))
        return new Response(JSON.stringify({ user }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch {
        return new Response(JSON.stringify({ user: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    }
}
