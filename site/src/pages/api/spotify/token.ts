import type { APIRoute } from "astro"
import { getAccessToken, jsonResponse } from "@/lib/server"

export const GET: APIRoute = async ({ request }) => {
    const accessToken = getAccessToken(request)
    return jsonResponse({ token: accessToken })
}
