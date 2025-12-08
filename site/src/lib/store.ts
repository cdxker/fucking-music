import type { FuckingPlaylist, FuckingTrack, PlayerState, PlaylistId, TrackId } from "@/shared/types";

const getNextTracks = (database: Database, track: FuckingTrack) => {
  const nextTracks = [];

  track.next_tracks?.forEach((playlistId, trackId) => {
    const playlist = database.getPlaylist(playlistId);
    const track = database.getTrack(trackId);

    nextTracks.push({ track, playlist });
  })

}


export class Database {

  getState(): PlayerState {
    return {
      activePlaylist: "play-list-1",
      activeTrack: "track-1",
      trackTimestamp: 3003
    };
  }

  getTrack(trackId: TrackId): FuckingTrack {
    return {
      id: "track-1",
      time_ms: 0,
      name: "",
      artists: [],
      stream_url: ""
    }
  }

  getPlaylist(playlistId: PlaylistId): FuckingPlaylist {
    return {
      id: "play-list-1",
      track_cover_uri: "",
      name: "",
      artists: [],
      first_track: {
        id: "track-1",
        time_ms: 0,
        name: "",
        artists: [],
        stream_url: ""
      }
    };
  }

  insertTrack(track: FuckingTrack): void {
    return;
  }

  insertPlaylist(playlist: FuckingPlaylist): void {
    return;
  }

  getPlaylists(): FuckingPlaylist[] {
    return [];
  }

  getTracks(): FuckingTrack[] {
    return [];
  }

}
