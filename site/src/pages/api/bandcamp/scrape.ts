import type { APIRoute } from "astro";
import type { Playlist, PlaylistId, Track, TrackId } from "../../../shared/types";

function extractLdJson(html: string): Record<string, any> | null {
  const ldJsonMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!ldJsonMatch) {
    return null;
  }

  try {
    return JSON.parse(ldJsonMatch[1]);
  } catch (e) {
    console.error("Failed to parse ld+json:", e);
    return null;
  }
}

function extractTralbumData(html: string): Record<string, any> | null {
  const tralbumMatch = html.match(/data-tralbum="([^"]*)"/);
  if (!tralbumMatch) {
    return null;
  }

  const tralbumData = tralbumMatch[1]
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");

  try {
    return JSON.parse(tralbumData);
  } catch (e) {
    console.error("Failed to parse tralbum data:", e);
    return null;
  }
}

function extractAlbumArt(html: string): string | null {
  // Extract album art URL from #tralbumArt
  const artMatch = html.match(/<a[^>]*class="popupImage"[^>]*href="([^"]*)"/);
  if (artMatch) {
    return artMatch[1];
  }
  
  // Alternative: look for the og:image meta tag
  const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/);
  if (ogImageMatch) {
    return ogImageMatch[1];
  }
  
  return null;
}

function transformToPlaylist(
  pageData: BandcampPageData,
  ldJson: Record<string, any> | null,
  albumArt: string | null
): PlaylistWithTracks {
  const albumTitle = pageData.current?.title || pageData.trackinfo[0]?.title || "Unknown Album";
  const artist = pageData.artist || "Unknown Artist";
  const keywords = pageData.keywords || [];

  // Generate playlist ID from URL
  const urlSlug = pageData.url
    .replace(/https?:\/\//, "")
    .replace(/\.bandcamp\.com/, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");
  
  const playlistId: PlaylistId = `play-${urlSlug}`;

  // Transform tracks
  const tracks: Track[] = pageData.trackinfo
    .filter((t) => t.file?.["mp3-128"]) // Only include tracks with available audio
    .map((trackInfo, index) => {
      const trackId: TrackId = `track-${trackInfo.track_id || index + 1}`;
      
      let streamUrl = trackInfo.file?.["mp3-128"];
      if (streamUrl && !streamUrl.startsWith("http")) {
        streamUrl = "https:" + streamUrl;
      }

      return {
        id: trackId,
        time_ms: Math.round((trackInfo.duration || 0) * 1000),
        name: trackInfo.title,
        artists: [trackInfo.artist || artist],
        tags: keywords.length > 0 ? keywords : undefined,
        stream_url: streamUrl ?? '',
      };
    });

  // Link tracks via next_tracks
  for (let i = 0; i < tracks.length - 1; i++) {
    tracks[i].next_tracks = {
      [playlistId]: tracks[i + 1].id,
    };
  }

  return {
    id: playlistId,
    track_cover_uri: albumArt || "",
    name: albumTitle,
    artists: [artist],
    first_track: tracks[0],
    tracks,
  };
}

export const GET: APIRoute = async ({ url }) => {
  const bandcampUrl = url.searchParams.get("url");

  if (!bandcampUrl) {
    return new Response(
      JSON.stringify({ error: "Missing 'url' query parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!bandcampUrl.includes("bandcamp.com")) {
    return new Response(
      JSON.stringify({ error: "URL must be a Bandcamp URL" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const response = await fetch(bandcampUrl, {});
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();

    const tralbumData = extractTralbumData(html);
    if (!tralbumData || !tralbumData.trackinfo) {
      return new Response(
        JSON.stringify({ error: "Could not extract track data from Bandcamp page" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const ldJson = extractLdJson(html);
    const albumArt = extractAlbumArt(html);

    const pageData: BandcampPageData = {
      artist: tralbumData.artist || tralbumData.current?.artist || "Unknown Artist",
      trackinfo: tralbumData.trackinfo,
      url: tralbumData.url || bandcampUrl,
      current: tralbumData.current,
      keywords: [],
    };

    const playlist = transformToPlaylist(pageData, ldJson, albumArt);

    return new Response(JSON.stringify(playlist, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error scraping Bandcamp:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to scrape Bandcamp page",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
