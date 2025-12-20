import type { APIRoute } from "astro"
import type { PlaylistId, FuckingPlaylist, FuckingTrack, TrackId } from "../../../shared/types"

export const GET: APIRoute = async ({ url }) => {
    const spotifyUrl = url.searchParams.get("url")

    if (!spotifyUrl) {
        return new Response(JSON.stringify({ error: "Missing 'url' query parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }

    // Parse Spotify URL
    const trackMatch = spotifyUrl.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
    const albumMatch = spotifyUrl.match(/spotify\.com\/album\/([a-zA-Z0-9]+)/)
    const playlistMatch = spotifyUrl.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/)

    const urlType = trackMatch ? "track" : albumMatch ? "album" : playlistMatch ? "playlist" : null
    const urlId = trackMatch?.[1] || albumMatch?.[1] || playlistMatch?.[1]

    if (!urlType || !urlId) {
        return new Response(
            JSON.stringify({
                error: "Invalid Spotify URL. Must be a track, album, or playlist URL.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }

    try {
        const embedUrl = `https://open.spotify.com/embed/${urlType}/${urlId}`
        const response = await fetch(embedUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
        }

        const html = await response.text()

        // Extract __NEXT_DATA__ from embed page
        const nextDataMatch = html.match(
            /<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/
        )
        if (!nextDataMatch) {
            return new Response(JSON.stringify({ error: "Could not find Spotify embed data" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }

        let nextData: any
        try {
            nextData = JSON.parse(nextDataMatch[1])
        } catch {
            return new Response(JSON.stringify({ error: "Failed to parse Spotify embed data" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }

        const entity = nextData?.props?.pageProps?.state?.data?.entity
        if (!entity) {
            return new Response(
                JSON.stringify({ error: "Could not extract entity from Spotify data" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            )
        }

        // Extract metadata
        const name = entity.title || entity.name || "Unknown"
        const artistNames: string[] =
            entity.artists?.map((a: any) => a.name) ||
            (entity.subtitle ? [entity.subtitle] : ["Unknown Artist"])
        const albumArt = entity.visualIdentity?.image?.[0]?.url || ""
        const playlistId: PlaylistId = `play-spotify-${urlType}-${urlId}`

        // Build tracks directly as FuckingTrack[]
        const tracks: FuckingTrack[] = []
        const trackList = entity.trackList || []

        for (const item of trackList) {
            if (!item.audioPreview?.url) continue

            tracks.push({
                id: `track-${item.uri?.split(":").pop() || tracks.length}` as TrackId,
                time_ms: item.duration || 0,
                name: item.title || "Unknown Track",
                artists: [item.subtitle || artistNames[0] || "Unknown Artist"],
                stream_url: item.audioPreview.url,
            })
        }

        // For single tracks with no trackList
        if (tracks.length === 0 && urlType === "track" && entity.audioPreview?.url) {
            tracks.push({
                id: `track-${entity.id || urlId}` as TrackId,
                time_ms: entity.duration || 0,
                name: entity.title || "Unknown Track",
                artists: artistNames,
                stream_url: entity.audioPreview.url,
            })
        }

        if (tracks.length === 0) {
            return new Response(
                JSON.stringify({ error: "No tracks with available previews found" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            )
        }

        // Link tracks for sequential playback
        for (let i = 0; i < tracks.length - 1; i++) {
            tracks[i].next_tracks = { [playlistId]: tracks[i + 1].id }
        }

        const playlist: FuckingPlaylist = {
            id: playlistId,
            track_cover_uri: albumArt,
            name,
            artists: artistNames,
            first_track: tracks[0],
        }

        return new Response(JSON.stringify({ playlist, tracks }, null, 2), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error scraping Spotify:", error)
        return new Response(
            JSON.stringify({
                error: "Failed to scrape Spotify page",
                details: error instanceof Error ? error.message : String(error),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}
