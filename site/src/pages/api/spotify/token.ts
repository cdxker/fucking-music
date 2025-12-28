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

export const GET: APIRoute = async ({ request }) => {
    const cookies = parseCookies(request.headers.get("cookie"))
    const accessToken = cookies.spotify_access_token

    if (!accessToken) {
        return new Response(JSON.stringify({ token: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify({ token: accessToken }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
}
