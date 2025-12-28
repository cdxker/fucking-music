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
    const user = cookies.spotify_user

    if (!user) {
        return new Response(JSON.stringify({ user: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify({ user: decodeURIComponent(user) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
}
