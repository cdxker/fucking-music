import type { APIRoute } from "astro"
import { type } from "arktype"
import { getAccessToken, getRefreshToken, refreshAccessToken, errorResponse } from "@/lib/server"

const playRequestSchema = type({
    "device_id?": "string",
    context_uri: "string",
    "offset?": type({ uri: "string" }).or({ position: "number" }),
})

interface PlayParams {
    device_id?: string
    context_uri: string
    offset?: { uri: string } | { position: number }
}

async function startPlayback(accessToken: string, params: PlayParams) {
    const { device_id, context_uri, offset } = params
    return fetch(
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
}

export const PUT: APIRoute = async ({ request }) => {
    let accessToken = getAccessToken(request)

    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return errorResponse("Invalid JSON body", 400)
    }

    const result = playRequestSchema(body)
    if (result instanceof type.errors) {
        return errorResponse(`Invalid request body: ${result.summary}`, 400)
    }

    const params: PlayParams = result

    let playResponse = await startPlayback(accessToken, params)

    if (playResponse.status === 401) {
        const refreshToken = getRefreshToken(request)
        if (!refreshToken) {
            return errorResponse("Not authenticated", 401)
        }

        const refreshResult = await refreshAccessToken(refreshToken)
        if (!refreshResult) {
            return errorResponse("Failed to refresh token", 401)
        }

        accessToken = refreshResult.accessToken
        playResponse = await startPlayback(accessToken, params)

        if (!playResponse.ok && playResponse.status !== 204) {
            return errorResponse("Failed to start playback", playResponse.status)
        }

        return new Response(null, {
            status: 204,
            headers: {
                "Set-Cookie": refreshResult.setCookieHeader,
            },
        })
    }

    if (!playResponse.ok && playResponse.status !== 204) {
        return errorResponse("Failed to start playback", playResponse.status)
    }

    return new Response(null, { status: 204 })
}
