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

export function getAccessToken(request: Request): string | null {
    const cookies = parseCookies(request.headers.get("cookie"))
    return cookies.spotify_access_token || null
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

export function parsePaginationParams(
    url: URL,
    defaults: { limit: number; offset: number } = { limit: 50, offset: 0 }
): { limit: number; offset: number } {
    const limitParam = url.searchParams.get("limit")
    const offsetParam = url.searchParams.get("offset")

    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || defaults.limit), 50) : defaults.limit
    const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || defaults.offset) : defaults.offset

    return { limit, offset }
}
