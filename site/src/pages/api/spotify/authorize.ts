import type { APIRoute } from "astro"

function generateRandomString(length: number): string {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let text = ""
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

export const GET: APIRoute = async () => {
    const clientId = import.meta.env.SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.SPOTIFY_REDIRECT_URI

    if (!clientId || !redirectUri) {
        return new Response("Missing Spotify configuration", { status: 500 })
    }

    const scope = "streaming user-read-email user-read-private"
    const state = generateRandomString(16)

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
    })

    return Response.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`, 302)
}
