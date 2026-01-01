import type { APIRoute } from "astro"
import { type } from "arktype"
import type { SpotifyTokenResponse, SpotifyUserProfile } from "@/shared/types"
import { COOKIE_OPTIONS } from "@/lib/server"

const callbackParamsSchema = type({
    code: "string | null",
    error: "string | null",
}).pipe((params) => {
    if (params.error) {
        return { success: false as const, error: params.error }
    }
    if (!params.code) {
        return { success: false as const, error: "missing_code" }
    }
    return { success: true as const, code: params.code }
})

export const GET: APIRoute = async ({ url }) => {
    const baseUrl = url.origin
    const params = {
        code: url.searchParams.get("code"),
        error: url.searchParams.get("error"),
    }

    const result = callbackParamsSchema(params)
    if (result instanceof type.errors) {
        return Response.redirect(`${baseUrl}/bad-onboarding?spotify_error=invalid_params`, 302)
    }

    if (!result.success) {
        return Response.redirect(
            `${baseUrl}/bad-onboarding?spotify_error=${encodeURIComponent(result.error)}`,
            302
        )
    }

    const code = result.code

    const clientId = import.meta.env.SPOTIFY_CLIENT_ID
    const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = import.meta.env.SPOTIFY_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
        return Response.redirect(`${baseUrl}/bad-onboarding?spotify_error=server_config`, 302)
    }

    try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri,
            }),
        })

        if (!tokenResponse.ok) {
            return Response.redirect(`${baseUrl}/bad-onboarding?spotify_error=token_exchange`, 302)
        }

        const tokenData: SpotifyTokenResponse = await tokenResponse.json()

        const userResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        })

        if (!userResponse.ok) {
            return Response.redirect(`${baseUrl}/bad-onboarding?spotify_error=user_fetch`, 302)
        }

        const userData: SpotifyUserProfile = await userResponse.json()

        return new Response(null, {
            status: 302,
            headers: [
                ["Location", `${baseUrl}`],
                [
                    "Set-Cookie",
                    `spotify_refresh_token=${tokenData.refresh_token}; ${COOKIE_OPTIONS}`,
                ],
                [
                    "Set-Cookie",
                    `spotify_user=${encodeURIComponent(JSON.stringify(userData))}; ${COOKIE_OPTIONS}`,
                ],
            ],
        })
    } catch {
        return Response.redirect(`${baseUrl}/bad-onboarding?spotify_error=unknown`, 302)
    }
}
