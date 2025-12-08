import { createStore } from 'tinybase';
import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import type { FuckingPlaylist, FuckingTrack, PlayerState, PlaylistId, TrackId, FuckingPlaylistWithTracks } from "@/shared/types";

// Create the TinyBase store
const store = createStore()
  .setTablesSchema({
    playlists: {
      id: { type: 'string' },
      track_cover_uri: { type: 'string' },
      name: { type: 'string' },
      artists: { type: 'string' }, // JSON stringified array
      first_track_id: { type: 'string' },
    },
    tracks: {
      id: { type: 'string' },
      playlist_id: { type: 'string' },
      time_ms: { type: 'number' },
      name: { type: 'string' },
      artists: { type: 'string' }, // JSON stringified array
      tags: { type: 'string' }, // JSON stringified array
      stream_url: { type: 'string' },
      next_tracks: { type: 'string' }, // JSON stringified Record
    },
  })
  .setValuesSchema({
    activePlaylist: { type: 'string', default: '' },
    activeTrack: { type: 'string', default: '' },
    trackTimestamp: { type: 'number', default: 0 },
    lastPlaylistId: { type: 'string', default: '' },
  });

// Persister for localStorage
let persister: ReturnType<typeof createLocalPersister> | null = null;
let initialized = false;

async function initPersister() {
  if (initialized) return;
  if (typeof window === 'undefined') return; // SSR guard

  persister = createLocalPersister(store, 'fucking-music-store');
  await persister.load();
  await persister.startAutoSave();
  initialized = true;
}

export class Database {
  async init(): Promise<void> {
    await initPersister();
  }

  getPlayerState(): PlayerState {
    const activePlaylist = store.getValue('activePlaylist') as string;
    const activeTrack = store.getValue('activeTrack') as string;
    const trackTimestamp = store.getValue('trackTimestamp') as number;
    return {
      activePlaylist: activePlaylist ? activePlaylist as PlaylistId : undefined,
      activeTrack: activeTrack ? activeTrack as TrackId : undefined,
      trackTimestamp: trackTimestamp || undefined,
    };
  }

  setPlayerState(state: PlayerState): void {
    if (state.activePlaylist !== undefined) {
      store.setValue('activePlaylist', state.activePlaylist);
    }
    if (state.activeTrack !== undefined) {
      store.setValue('activeTrack', state.activeTrack);
    }
    if (state.trackTimestamp !== undefined) {
      store.setValue('trackTimestamp', state.trackTimestamp);
    }
  }

  getLastPlaylistId(): PlaylistId | null {
    const id = store.getValue('lastPlaylistId') as string;
    return id ? id as PlaylistId : null;
  }

  setLastPlaylistId(id: PlaylistId): void {
    store.setValue('lastPlaylistId', id);
  }

  getTrack(trackId: TrackId): FuckingTrack | null {
    const row = store.getRow('tracks', trackId);
    if (!row || !row.id) return null;

    return {
      id: row.id as TrackId,
      time_ms: row.time_ms as number,
      name: row.name as string,
      artists: JSON.parse((row.artists as string) || '[]'),
      tags: JSON.parse((row.tags as string) || '[]'),
      stream_url: row.stream_url as string,
      next_tracks: row.next_tracks ? JSON.parse(row.next_tracks as string) : undefined,
    };
  }

  getPlaylist(playlistId: PlaylistId): FuckingPlaylist | null {
    const row = store.getRow('playlists', playlistId);
    if (!row || !row.id) return null;

    const firstTrack = this.getTrack(row.first_track_id as TrackId);
    if (!firstTrack) return null;

    return {
      id: row.id as PlaylistId,
      track_cover_uri: row.track_cover_uri as string,
      name: row.name as string,
      artists: JSON.parse((row.artists as string) || '[]'),
      first_track: firstTrack,
    };
  }

  getPlaylistWithTracks(playlistId: PlaylistId): FuckingPlaylistWithTracks | null {
    const playlist = this.getPlaylist(playlistId);
    if (!playlist) return null;

    const tracks = this.getTracksByPlaylist(playlistId);
    return { ...playlist, tracks };
  }

  insertTrack(track: FuckingTrack, playlistId: PlaylistId): void {
    store.setRow('tracks', track.id, {
      id: track.id,
      playlist_id: playlistId,
      time_ms: track.time_ms,
      name: track.name,
      artists: JSON.stringify(track.artists),
      tags: JSON.stringify(track.tags || []),
      stream_url: track.stream_url,
      next_tracks: track.next_tracks ? JSON.stringify(track.next_tracks) : '',
    });
  }

  insertPlaylist(playlist: FuckingPlaylist): void {
    store.setRow('playlists', playlist.id, {
      id: playlist.id,
      track_cover_uri: playlist.track_cover_uri,
      name: playlist.name,
      artists: JSON.stringify(playlist.artists),
      first_track_id: playlist.first_track.id,
    });
  }

  insertPlaylistWithTracks(playlist: FuckingPlaylistWithTracks): void {
    for (const track of playlist.tracks) {
      this.insertTrack(track, playlist.id);
    }
    this.insertPlaylist(playlist);
    this.setLastPlaylistId(playlist.id);
  }

  getPlaylists(): FuckingPlaylist[] {
    const playlists: FuckingPlaylist[] = [];
    const rowIds = store.getRowIds('playlists');

    for (const rowId of rowIds) {
      const playlist = this.getPlaylist(rowId as PlaylistId);
      if (playlist) {
        playlists.push(playlist);
      }
    }

    return playlists;
  }

  getTracksByPlaylist(playlistId: PlaylistId): FuckingTrack[] {
    const tracks: FuckingTrack[] = [];
    const rowIds = store.getRowIds('tracks');

    for (const rowId of rowIds) {
      const row = store.getRow('tracks', rowId);
      if (row.playlist_id === playlistId) {
        const track = this.getTrack(rowId as TrackId);
        if (track) {
          tracks.push(track);
        }
      }
    }

    return tracks;
  }

  getTracks(): FuckingTrack[] {
    const tracks: FuckingTrack[] = [];
    const rowIds = store.getRowIds('tracks');

    for (const rowId of rowIds) {
      const track = this.getTrack(rowId as TrackId);
      if (track) {
        tracks.push(track);
      }
    }

    return tracks;
  }
}

// Singleton instance
export const db = new Database();
