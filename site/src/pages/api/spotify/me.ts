import type { APIRoute } from "astro"
import type { SpotifyUserProfile } from "@/shared/types"
import { parseCookies, jsonResponse } from "@/lib/server"

export const GET: APIRoute = async ({ request }) => {
    const cookies = parseCookies(request.headers.get("cookie"))
    const spotifyUserCookie = cookies.spotify_user

    if (!spotifyUserCookie) {
        return jsonResponse({ user: null })
    }

    try {
        const user: SpotifyUserProfile = JSON.parse(decodeURIComponent(spotifyUserCookie))
        return jsonResponse({ user })
    } catch {
        return jsonResponse({ user: null })
    }
}
