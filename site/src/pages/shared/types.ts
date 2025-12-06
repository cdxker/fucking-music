type PlaylistId = `play-${string}`;

interface Playlist {
  id: PlaylistId;
  track_cover_uri: string;
  name: string;
  artists: string[];
  first_track: Track;
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

