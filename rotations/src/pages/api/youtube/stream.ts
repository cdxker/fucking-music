import type { APIRoute } from "astro"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export const GET: APIRoute = async ({ url }) => {
    const videoId = url.searchParams.get("id")

    if (!videoId) {
        return new Response(JSON.stringify({ error: "Missing 'id' query parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return new Response(JSON.stringify({ error: "Invalid video ID format" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }

    try {
        const { stdout } = await execAsync(
            `yt-dlp -f "bestaudio[ext=m4a]/bestaudio/best" -g --no-warnings "https://www.youtube.com/watch?v=${videoId}"`,
            { maxBuffer: 1024 * 1024 }
        )
        const streamUrl = stdout.trim()

        if (!streamUrl) {
            return new Response(JSON.stringify({ error: "Could not get stream URL" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        }

        const audioResponse = await fetch(streamUrl)

        if (!audioResponse.ok) {
            return new Response(JSON.stringify({ error: "Failed to fetch audio stream" }), {
                status: 502,
                headers: { "Content-Type": "application/json" },
            })
        }

        return new Response(audioResponse.body, {
            status: 200,
            headers: {
                "Content-Type": audioResponse.headers.get("Content-Type") || "audio/mp4",
                "Content-Length": audioResponse.headers.get("Content-Length") || "",
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=3600",
            },
        })
    } catch (error) {
        console.error("Error streaming YouTube audio:", error)
        return new Response(
            JSON.stringify({
                error: "Failed to stream audio",
                details: error instanceof Error ? error.message : String(error),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}
