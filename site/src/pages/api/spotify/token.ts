import type { APIRoute } from "astro"
import { getSpotifyAccessToken, jsonResponse } from "@/lib/server"

export const GET: APIRoute = async ({ request }) => {
    const token = await getSpotifyAccessToken(request)
    return jsonResponse({ token })
}
