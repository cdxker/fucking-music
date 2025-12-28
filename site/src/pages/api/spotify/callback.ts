import type { APIRoute } from "astro"
import type { SpotifyTokenResponse, SpotifyUserProfile } from "@/shared/types"
import { COOKIE_OPTIONS } from "@/lib/server"

export const GET: APIRoute = async ({ url }) => {
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")
    const baseUrl = url.origin

    if (error) {
        return Response.redirect(`${baseUrl}/onboarding?spotify_error=${encodeURIComponent(error)}`, 302)
    }

    if (!code) {
        return Response.redirect(`${baseUrl}/onboarding?spotify_error=missing_code`, 302)
    }

    const clientId = import.meta.env.SPOTIFY_CLIENT_ID
    const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = import.meta.env.SPOTIFY_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
        return Response.redirect(`${baseUrl}/onboarding?spotify_error=server_config`, 302)
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
            return Response.redirect(`${baseUrl}/onboarding?spotify_error=token_exchange`, 302)
        }

        const tokenData: SpotifyTokenResponse = await tokenResponse.json()

        const userResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        })

        if (!userResponse.ok) {
            return Response.redirect(`${baseUrl}/onboarding?spotify_error=user_fetch`, 302)
        }

        const userData: SpotifyUserProfile = await userResponse.json()

        return new Response(null, {
            status: 302,
            headers: [
                ["Location", `${baseUrl}/spotify`],
                ["Set-Cookie", `spotify_access_token=${tokenData.access_token}; ${COOKIE_OPTIONS}`],
                ["Set-Cookie", `spotify_refresh_token=${tokenData.refresh_token}; ${COOKIE_OPTIONS}`],
                ["Set-Cookie", `spotify_user=${encodeURIComponent(JSON.stringify(userData))}; ${COOKIE_OPTIONS}`],
            ],
        })
    } catch {
        return Response.redirect(`${baseUrl}/onboarding?spotify_error=unknown`, 302)
    }
}
