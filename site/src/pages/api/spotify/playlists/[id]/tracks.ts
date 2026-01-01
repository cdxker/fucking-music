import type { APIRoute } from "astro"
import type { FuckingTrack, RawSpotifyPlaylistTracksResponse, SpotifyPlaylistTracksResponse, SpotifyTrack } from "@/shared/types"
import { getSpotifyAccessToken, jsonResponse, errorResponse, parsePaginationParams } from "@/lib/server"

const spotifyTrackToFuckingTrack = (track: SpotifyTrack): FuckingTrack => {
    return {
        id: `track-spotify-${track.id}`,
        time_ms: track.duration_ms,
        name: track.name,
        artists: track.artists.map((a) => a.name),
        audio: { type: "spotify", id: track.id },
    }
}

export const GET: APIRoute = async ({ params, request, url }) => {
    const accessToken = await getSpotifyAccessToken(request)
    const playlistId = params.id

    if (!accessToken) {
        return errorResponse("Not authenticated", 401)
    }

    if (!playlistId) {
        return errorResponse("Playlist ID required", 400)
    }

    const { limit, offset } = parsePaginationParams(url)

    const tracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!tracksResponse.ok) {
        return errorResponse("Failed to fetch tracks", tracksResponse.status)
    }

    const rawTracks: RawSpotifyPlaylistTracksResponse = await tracksResponse.json()
    const fuckingTracks: FuckingTrack[] = rawTracks.items
        .filter((item) => item.track !== null)
        .map((item) => spotifyTrackToFuckingTrack(item.track!))

    return jsonResponse<SpotifyPlaylistTracksResponse>({
        ...rawTracks,
        items: fuckingTracks,
    })
}
