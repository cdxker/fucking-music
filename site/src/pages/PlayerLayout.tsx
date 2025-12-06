import { Button } from "@/components/ui/button";
import PlayerView from "./components/PlayerView";
import { useState } from "react";
import type { Playlist, Track } from "../shared/types";

interface PlaylistWithTracks extends Playlist {
  tracks: Track[];
}

export default function PlayerLayout() {
  const [playlist, setPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bandcamp/scrape?url=${encodeURIComponent(inputValue)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load playlist");
        return;
      }

      setPlaylist(data);
      setShowInput(false);
      setInputValue("");
    } catch (e) {
      setError("Failed to fetch playlist");
    } finally {
      setLoading(false);
    }
  };

  const Tracks: Track[] = [
    {
      id: "track-0",
      time_ms: 322000,
      name: "i dream of you",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-1",
      },
    },
    {
      id: "track-1",
      time_ms: 350000,
      name: "marauder",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-2",
      },
    },
    {
      id: "track-2",
      time_ms: 344000,
      name: "spending saturday scorned",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-3",
      },
    },
    {
      id: "track-3",
      time_ms: 297000,
      name: "inviolate",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-4",
      },
    },
    {
      id: "track-4",
      time_ms: 363000,
      name: "eastern idiosyncrasies",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-5",
      },
    },
    {
      id: "track-5",
      time_ms: 286000,
      name: "carry on",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-6",
      },
    },
    {
      id: "track-6",
      time_ms: 238000,
      name: "top of the stack",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-7",
      },
    },
    {
      id: "track-7",
      time_ms: 434000,
      name: "hate like us",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-8",
      },
    },
    {
      id: "track-8",
      time_ms: 211000,
      name: "no love",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-9",
      },
    },
    {
      id: "track-9",
      time_ms: 215000,
      name: "feeling good (bonus)",
      artists: ["Oblique Occasions"],
    },
  ];

  return (
    <div className="min-h-screen px-5 pt-8 pb-12 bg-[#0B0B0B]">
      {playlist && (
        <PlayerView
          playlist={playlist}
          tracks={playlist.tracks}
        />
      )}

      {!playlist && (
        <div className="w-full h-screen flex justify-center items-center">
          {!showInput ? (
            <Button
              variant="outline"
              size="lg"
              className="text-3xl text-white/70"
              onClick={() => setShowInput(true)}
            >
              Add Music
            </Button>
          ) : (
            <div className="flex flex-col gap-4 w-full max-w-md">
              <input
                type="url"
                placeholder="Paste Bandcamp album URL..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full px-4 py-3 text-lg text-white bg-transparent border border-white/30 rounded-md focus:outline-none focus:border-white/60"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-white/70"
                  onClick={() => {
                    setShowInput(false);
                    setInputValue("");
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-white/70"
                  onClick={handleSubmit}
                  disabled={loading || !inputValue.trim()}
                >
                  {loading ? "Loading..." : "Load"}
                </Button>
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
