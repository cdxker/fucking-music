export type PlaylistId = `play-${string}`

export type PlaylistSource = "spotify" | "youtube" | "bandcamp"

export interface FuckingPlaylist {
    id: PlaylistId
    track_cover_uri: string
    name: string
    artists: string[]
    first_track: FuckingTrack
    totalDurationMs: number
    source: PlaylistSource | null
}

export type TrackId = `track-${string}`

export interface BandcampTrackInfo {
    track_num: number
    title: string
    title_link: string
    duration: number
    artist: string | null
    file?: { "mp3-128"?: string }
    track_id?: number
}

export interface BandcampPageData {
    artist: string
    trackinfo: BandcampTrackInfo[]
    url: string
    current?: {
        title: string
        release_date?: string
        selling_band_id?: number
    }
    album_release_date?: string
    albumArt: string
    keywords?: string[]
}

export type AudioSource =
    | { type: "stream"; url: string }
    | { type: "youtube"; id: string }
    | { type: "spotify"; id: string }

export interface FuckingTrack {
    id: TrackId
    time_ms: number
    name: string
    artists: string[]
    tags?: string[]
    audio: AudioSource
    next_tracks?: Record<PlaylistId, TrackId>
}

export interface FuckingPlaylistWithTracks extends FuckingPlaylist {
    tracks: FuckingTrack[]
}

export interface PlayerState {
    activePlaylist: PlaylistId
    activeTrack: TrackId
    trackTimestamp: number
    lastPlaylistId: PlaylistId
}

export interface SpotifyImage {
    url: string
    height: number | null
    width: number | null
}

export interface SpotifyUserProfile {
    country: string
    display_name: string | null
    email: string
    explicit_content: {
        filter_enabled: boolean
        filter_locked: boolean
    }
    external_urls: {
        spotify: string
    }
    followers: {
        href: string | null
        total: number
    }
    href: string
    id: string
    images: SpotifyImage[]
    product: string
    type: string
    uri: string
}

export interface SpotifyTokenResponse {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
    scope: string
}

export interface SpotifyPlaylistOwner {
    display_name: string | null
    external_urls: { spotify: string }
    href: string
    id: string
    type: string
    uri: string
}

export interface SpotifyPlaylist {
    collaborative: boolean
    description: string | null
    external_urls: { spotify: string }
    href: string
    id: string
    images: SpotifyImage[]
    name: string
    owner: SpotifyPlaylistOwner
    public: boolean | null
    snapshot_id: string
    tracks: { href: string; total: number }
    type: string
    uri: string
}

export interface SpotifyPlaylistsResponse {
    href: string
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
    items: FuckingPlaylist[]
}

export interface SpotifyArtist {
    id: string
    name: string
    uri: string
    href: string
    external_urls: { spotify: string }
}

export interface SpotifyAlbum {
    id: string
    name: string
    uri: string
    href: string
    images: SpotifyImage[]
    release_date: string
    artists: SpotifyArtist[]
    external_urls: { spotify: string }
}

export interface SpotifyTrack {
    id: string
    name: string
    uri: string
    href: string
    duration_ms: number
    track_number: number
    artists: SpotifyArtist[]
    album: SpotifyAlbum
    external_urls: { spotify: string }
    is_local: boolean
}

export interface SpotifyPlaylistTrackItem {
    added_at: string
    added_by: { id: string }
    is_local: boolean
    track: SpotifyTrack | null
}

export interface RawSpotifyPlaylistTracksResponse {
    href: string
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
    items: SpotifyPlaylistTrackItem[]
}

export interface SpotifyPlaylistTracksResponse {
    href: string
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
    items: FuckingTrack[]
}
