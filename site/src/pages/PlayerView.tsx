type PlaylistId = `play-${string}`;

interface Playlist {
  id: PlaylistId;
  track_cover_uri: string;
  first_track: TrackId;
  artists: string[];
}

type TrackId = `track-${string}`;

interface Track {
  id: TrackId;
  time_ms: number;
  name: string;
  artists: string[];
  tags?: string[];
  next_tracks?: Record<PlaylistId, TrackId>;
}

function PlaylistView({ playlist }: { playlist: Playlist }) {
  return (
    <div>
      <div>
        <img src={playlist.track_cover_uri} />
      </div>
      <div></div>
    </div>
  );
}

function PlayerView() {
  const Fetish: Playlist = {
    id: "play-f",
    track_cover_uri: "/covers__fetish.png",
    artists: ["Oblique Occasions"],
    first_track: "track-i-dream",
  };

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div className="text-5xl opacity-50 text-white">less</div>
        </div>
        <div className="text-5xl opacity-50 text-white">more?</div>
      </div>
      <div className="italic text-5xl opacity-50 text-white">fucking music</div>
      <PlaylistView playlist={Fetish} />
    </div>
  );
}

export default PlayerView;
