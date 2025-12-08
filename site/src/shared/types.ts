export type PlaylistId = `play-${string}`;

export interface FuckingPlaylist {
  id: PlaylistId;
  track_cover_uri: string;
  name: string;
  artists: string[];
  first_track: FuckingTrack;
}

export type TrackId = `track-${string}`;

export interface FuckingPlaylistWithTracks extends FuckingPlaylist {
  tracks: FuckingTrack[];
}

export interface BandcampTrackInfo {
  track_num: number;
  title: string;
  title_link: string;
  duration: number;
  artist: string | null;
  file?: { "mp3-128"?: string };
  track_id?: number;
}

export interface BandcampPageData {
  artist: string;
  trackinfo: BandcampTrackInfo[];
  url: string;
  current?: {
    title: string;
    release_date?: string;
    selling_band_id?: number;
  };
  album_release_date?: string;
  albumArt: string;
  keywords?: string[];
}

export interface FuckingTrack {
  id: TrackId;
  time_ms: number;
  name: string;
  artists: string[];
  tags?: string[];
  stream_url: string;
  next_tracks?: Record<PlaylistId, TrackId>;
}

export interface PlayerState {
  activePlaylist?: PlaylistId;
  activeTrack?: TrackId;
  trackTimestamp?: number;
}
