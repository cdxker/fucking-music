import { type } from "arktype"

export const COOKIE_OPTIONS = "Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000"

export function parseCookies(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {}
    return Object.fromEntries(
        cookieHeader.split(";").map((cookie) => {
            const [key, ...vals] = cookie.trim().split("=")
            return [key, vals.join("=")]
        })
    )
}

export async function getSpotifyAccessToken(request: Request): Promise<string | null> {
    const cookies = parseCookies(request.headers.get("cookie"))
    const refreshToken = cookies.spotify_refresh_token
    if (!refreshToken) {
        return null
    }

    const clientId = import.meta.env.SPOTIFY_CLIENT_ID
    const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        return null
    }

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
    })

    if (!tokenResponse.ok) {
        return null
    }

    const data = await tokenResponse.json()
    return data.access_token
}

export function jsonResponse<T>(data: T, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    })
}

export function errorResponse(error: string, status = 400): Response {
    return jsonResponse({ error }, status)
}

const paginationSchema = type({
    limit: type("string | null")
        .pipe((v) => (v ? parseInt(v, 10) : null))
        .pipe((v) => (v === null || isNaN(v) ? 50 : Math.min(Math.max(1, v), 50))),
    offset: type("string | null")
        .pipe((v) => (v ? parseInt(v, 10) : null))
        .pipe((v) => (v === null || isNaN(v) ? 0 : Math.max(0, v))),
})

export type PaginationParams = typeof paginationSchema.infer

export function parsePaginationParams(url: URL): PaginationParams {
    const params = {
        limit: url.searchParams.get("limit"),
        offset: url.searchParams.get("offset"),
    }

    const result = paginationSchema(params)

    if (result instanceof type.errors) {
        return { limit: 50, offset: 0 }
    }

    return result
}
