import { Button } from "@/components/ui/button";
import PlayerView from "./PlayerView";
import { useState } from "react";
import type { FuckingPlaylist, FuckingTrack } from "../shared/types";

interface PlaylistWithTracks extends FuckingPlaylist {
  tracks: FuckingTrack[];
}

export default function PlayerLayout() {
  const [playlist, setPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/bandcamp/scrape?url=${encodeURIComponent(inputValue)}`);
      const data = await res.json();

      setPlaylist(data);
      setShowInput(false);
      setInputValue("");
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
