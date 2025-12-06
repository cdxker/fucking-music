export type PlaylistId = `play-${string}`;

export interface Playlist {
  id: PlaylistId;
  track_cover_uri: string;
  name: string;
  artists: string[];
  first_track: Track;
}

export type TrackId = `track-${string}`;

export interface Track {
  id: TrackId;
  time_ms: number;
  name: string;
  artists: string[];
  tags?: string[];
  stream_url: string;
  next_tracks?: Record<PlaylistId, TrackId>;
}

