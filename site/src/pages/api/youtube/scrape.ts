import type { APIRoute } from "astro"
import type { PlaylistId, FuckingPlaylist, FuckingTrack, TrackId } from "../../../shared/types"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

interface YtDlpVideoInfo {
    id: string
    title: string
    duration: number
    channel: string
    uploader: string
    thumbnail: string
    webpage_url: string
    playlist_title?: string
}

export const GET: APIRoute = async ({ url }) => {
    const youtubeUrl = url.searchParams.get("url")

    if (!youtubeUrl) {
        return new Response(JSON.stringify({ error: "Missing 'url' query parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }

    if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
        return new Response(JSON.stringify({ error: "URL must be a YouTube URL" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }

    try {
        const isPlaylist = youtubeUrl.includes("list=")
        const cmd = isPlaylist
            ? `yt-dlp -j --flat-playlist --no-warnings "${youtubeUrl}"`
            : `yt-dlp -j --no-warnings "${youtubeUrl}"`

        const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 })

        let id: string
        let title: string
        let channel: string
        let thumbnail: string
        let videoTracks: { id: string; title: string; duration: number; channel: string }[]

        if (isPlaylist) {
            const lines = stdout
                .trim()
                .split("\n")
                .filter((line) => line.trim())
            const videos: YtDlpVideoInfo[] = lines.map((line) => JSON.parse(line))

            if (videos.length === 0) {
                return new Response(JSON.stringify({ error: "No videos found in playlist" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                })
            }

            const playlistIdMatch = youtubeUrl.match(/list=([a-zA-Z0-9_-]+)/)
            id = playlistIdMatch ? playlistIdMatch[1] : "unknown"
            title = videos[0]?.playlist_title || "YouTube Playlist"
            channel = videos[0]?.channel || videos[0]?.uploader || "Unknown"
            thumbnail = `https://img.youtube.com/vi/${videos[0]?.id}/maxresdefault.jpg`
            videoTracks = videos.map((video) => ({
                id: video.id,
                title: video.title,
                duration: video.duration || 0,
                channel: video.channel || video.uploader || "Unknown",
            }))
        } else {
            const video: YtDlpVideoInfo = JSON.parse(stdout)
            id = video.id
            title = video.title
            channel = video.channel || video.uploader || "Unknown"
            thumbnail =
                video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
            videoTracks = [
                {
                    id: video.id,
                    title: video.title,
                    duration: video.duration || 0,
                    channel: video.channel || video.uploader || "Unknown",
                },
            ]
        }

        const playlistId: PlaylistId = `play-yt-${id}`

        const tracks: FuckingTrack[] = videoTracks.map((track) => ({
            id: `track-yt-${track.id}` as TrackId,
            time_ms: Math.round(track.duration * 1000),
            name: track.title,
            artists: [track.channel],
            audio: { type: "youtube" as const, id: track.id },
        }))

        for (let i = 0; i < tracks.length - 1; i++) {
            tracks[i].next_tracks = { [playlistId]: tracks[i + 1].id }
        }

        const playlist: FuckingPlaylist = {
            id: playlistId,
            track_cover_uri: thumbnail,
            name: title,
            artists: [channel],
            first_track: tracks[0],
            totalDurationMs: tracks.reduce((acc, t) => acc + t.time_ms, 0),
        }

        return new Response(JSON.stringify({ playlist, tracks }, null, 2), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error scraping YouTube:", error)
        return new Response(
            JSON.stringify({
                error: "Failed to scrape YouTube",
                details: error instanceof Error ? error.message : String(error),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}
