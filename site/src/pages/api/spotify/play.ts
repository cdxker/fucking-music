import type { APIRoute } from "astro"

function parseCookies(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {}
    return Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
            const [key, ...vals] = cookie.trim().split("=")
            return [key, vals.join("=")]
        })
    )
}

export const PUT: APIRoute = async ({ request }) => {
    const cookies = parseCookies(request.headers.get("cookie"))
    const accessToken = cookies.spotify_access_token

    if (!accessToken) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        })
    }

    const body = await request.json()
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
        const errorText = await playResponse.text()
        console.error("Failed to start playback:", errorText)
        return new Response(JSON.stringify({ error: "Failed to start playback" }), {
            status: playResponse.status,
            headers: { "Content-Type": "application/json" },
        })
    }

    return new Response(null, { status: 204 })
}
