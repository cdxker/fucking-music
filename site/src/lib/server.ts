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
