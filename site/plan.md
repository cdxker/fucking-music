# Plan: Create Playlist View Page (more.astro)

## Overview
Create a new playlist view page that displays all saved playlists in a list format with album art, title, artist, duration, and tags.

## Design Reference (from provided image)
- Dark background (`#0B0B0B`)
- Header: "fucking music" title
- List of playlists, each showing:
  - Album cover (square thumbnail, ~60px)
  - Playlist name (bold, white)
  - Artist name + total duration (gray text, e.g. "Oblique Occasions  57 minutes")
  - Tags as pill/chip buttons (bordered, rounded)
- "Add Music" button at bottom

## Files to Create

### 1. `/src/pages/more.astro`
Astro page that imports the React component with `client:load` directive.

```astro
---
import PlaylistsView from '../components/PlaylistsView.tsx';
import '../styles/global.css'
---

<div class="w-full min-h-screen bg-[#0B0B0B]">
  <PlaylistsView client:load />
</div>
```

### 2. `/src/components/PlaylistsView.tsx`
React component for displaying the playlists list.

**State:**
- `playlists: FuckingPlaylist[]` - all saved playlists from db
- `initializing: boolean` - loading state for db init

**Features:**
- Initialize db on mount with `db.init()`
- Load all playlists using `db.getPlaylists()`
- Calculate total duration by summing track `time_ms` for each playlist
- Get tags from `first_track.tags` (since tags are on FuckingTrack, not playlist)
- Display header "fucking music"
- Map playlists to list items
- Click on playlist item: set `lastPlaylistId` in db and navigate to `/player`
- "Add Music" button at bottom (links to /player or triggers add flow)

**Types Used (from store.ts imports):**
- `FuckingPlaylist` - id, track_cover_uri, name, artists, first_track
- `FuckingTrack` - id, time_ms, name, artists, tags, stream_url
- `PlaylistId` - for typing

**Layout Structure:**
```
<div> // Container
  <h1>fucking music</h1>

  <div> // Playlist list
    {playlists.map(playlist => (
      <div> // Playlist item row
        <img src={playlist.track_cover_uri} /> // Album art
        <div> // Info column
          <span>{playlist.name}</span> // Title
          <span>{artists} {duration}</span> // Artist + duration
          <div> // Tags row
            {tags.map(tag => <span>{tag}</span>)}
          </div>
        </div>
      </div>
    ))}
  </div>

  <Button>Add Music</Button>
</div>
```

**Duration Calculation:**
- Need to get all tracks for each playlist via `db.getTracks(playlistId)`
- Sum all `time_ms` values
- Format as "X minutes"

## Implementation Steps

1. Create `/src/pages/moreo.astro`
   - Import PlaylistsView component
   - Import global.css
   - Render with `client:load`

2. Create `/src/components/PlaylistsView.tsx`
   - Import types from `@/shared/types`
   - Import `db` from `@/lib/store`
   - Import `Button` from `@/components/ui/button`
   - Create component with state for playlists and initializing
   - useEffect to init db and load playlists
   - Helper function to format duration (ms to minutes)
   - Render header, playlist list, and add button
   - Click handler: set `db.setPlayerState({ lastPlaylistId })` then `window.location.href = '/player'`
   - Style with Tailwind classes matching existing design
