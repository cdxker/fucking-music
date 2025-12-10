import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { FuckingPlaylist, PlaylistId } from "@/shared/types";
import { db } from "@/lib/store";

interface PlaylistWithDuration extends FuckingPlaylist {
  totalDurationMs: number;
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  return `${minutes} minutes`;
}

export default function PlaylistsView() {
  const [playlists, setPlaylists] = useState<PlaylistWithDuration[]>([]);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await db.init();
      const allPlaylists = db.getPlaylists();
      
      // Calculate total duration for each playlist
      const playlistsWithDuration: PlaylistWithDuration[] = allPlaylists.map(playlist => {
        const tracks = db.getTracks(playlist.id);
        const totalDurationMs = tracks.reduce((acc, track) => acc + track.time_ms, 0);
        return { ...playlist, totalDurationMs };
      });
      
      setPlaylists(playlistsWithDuration);
      setInitializing(false);
    };
    init();
  }, []);

  const handlePlaylistClick = (playlistId: PlaylistId) => {
    db.setPlayerState({ lastPlaylistId: playlistId });
    window.location.href = "/player";
  };

  const handleAddMusic = () => {
    window.location.href = "/player";
  };

  if (initializing) {
    return <div className="min-h-screen bg-[#0B0B0B]" />;
  }

  return (
    <div className="min-h-screen px-5 pt-8 pb-12 bg-[#0B0B0B]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between w-full mb-8">
          <a href="/less" className="text-4xl text-white/80 tracking-tight hover:text-white transition-colors">
            less
          </a>
          <h1 className="text-5xl italic text-[#4A6FA5] tracking-tight">
            fucking music
          </h1>
          <a href="/more" className="text-4xl text-white/80 tracking-tight hover:text-white transition-colors">
            more
          </a>
        </div>

        <div className="space-y-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex gap-4 cursor-pointer hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
              onClick={() => handlePlaylistClick(playlist.id)}
            >
              <img
                src={playlist.track_cover_uri}
                alt={`${playlist.name} cover`}
                className="w-16 h-16 object-cover rounded"
              />
              
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <span className="text-white font-medium truncate">
                  {playlist.name}
                </span>
                <span className="text-white/50 text-sm">
                  {playlist.artists[0]}  ·  {formatDuration(playlist.totalDurationMs)}
                </span>
                
                {playlist.first_track.tags && playlist.first_track.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {playlist.first_track.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs text-white/60 border border-white/20 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {playlists.length === 0 && (
          <div className="text-white/40 text-center py-16">
            No playlists yet. Add some music!
          </div>
        )}

        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="text-white/70"
            onClick={handleAddMusic}
          >
            Add Music
          </Button>
        </div>
      </div>
    </div>
  );
}

