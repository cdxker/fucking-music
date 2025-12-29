import type { APIRoute } from "astro"
import { getAccessToken, errorResponse } from "@/lib/server"

interface PlayRequestBody {
    device_id?: string
    context_uri: string
    offset?: { uri: string } | { position: number }
}

function isValidPlayRequest(body: unknown): body is PlayRequestBody {
    if (typeof body !== "object" || body === null) return false
    const b = body as Record<string, unknown>
    if (typeof b.context_uri !== "string") return false
    if (b.device_id !== undefined && typeof b.device_id !== "string") return false
    return true
}

export const PUT: APIRoute = async ({ request }) => {
    const accessToken = getAccessToken(request)

    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return errorResponse("Invalid JSON body", 400)
    }

    if (!isValidPlayRequest(body)) {
        return errorResponse("Invalid request body: context_uri is required", 400)
    }

    const { device_id, context_uri, offset } = body

    const playResponse = await fetch(
        `https://api.spotify.com/v1/me/player/play${device_id ? `?device_id=${device_id}` : ""}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                context_uri,
                offset,
            }),
        }
    )

    if (!playResponse.ok && playResponse.status !== 204) {
        return errorResponse("Failed to start playback", playResponse.status)
    }

    return new Response(null, { status: 204 })
}
