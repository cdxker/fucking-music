# Implementation Plans for Open Issues

This document contains detailed implementation plans for all open feature requests in the fucking-music repository.

---

## Issue #18: Enhanced "Find" Mode

**Goal:** Enhance the `/more` view with Bandcamp-inspired tag filtering, search, and sorting capabilities.

### Step 1: Extend Data Types
**File: `site/src/shared/types.ts`**
```typescript
export interface SearchFilters {
  tags: string[];
  artistQuery: string;
  albumQuery: string;
  sortBy: 'name' | 'date' | 'duration';
}
```

### Step 2: Create Search/Filter Components
**New File: `site/src/components/FindView.tsx`**
- Create horizontal tag bar component (pills/chips for each unique tag)
- Add text input for artist/album name search
- Implement sort dropdown with options: Name, Date Added, Duration
- Use existing Tailwind classes matching the dark theme (`#0B0B0B` bg, white text)

### Step 3: Aggregate Tags from Database
**File: `site/src/lib/store.ts`**
```typescript
// Add these functions:
getAllTags(): string[] {
  // Scan all tracks and return unique tags
  const allTracks = this.store.getTable('tracks');
  const tags = new Set<string>();
  Object.values(allTracks).forEach(track => {
    const trackTags = JSON.parse(track.tags || '[]');
    trackTags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

searchPlaylists(filters: SearchFilters): FuckingPlaylist[] {
  // Filter playlists based on search criteria
}
```

### Step 4: Integrate into PlaylistsView
**File: `site/src/components/PlaylistsView.tsx`**
- Import and render FindView component at top
- Connect filter state to playlist rendering
- Implement client-side filtering logic

### Step 5: Add Song Lookup Within View
- Add expandable track list under each filtered playlist
- Enable click-to-play functionality from search results

### Key Files to Modify
1. `site/src/shared/types.ts` - Add filter types
2. `site/src/lib/store.ts` - Add query functions
3. `site/src/components/PlaylistsView.tsx` - Integrate filters
4. **New:** `site/src/components/FindView.tsx` - Search UI component

### Dependencies
- No new packages needed (use existing Tailwind + React)

---

## Issue #17: Implement Discover View

**Goal:** Create a visualization page that displays album components as a graph showing connections between nearby songs.

### Step 1: Add Visualization Library
**File: `site/package.json`**
```bash
yarn add @react-three/fiber @react-three/drei three
# OR for 2D approach:
yarn add react-force-graph-2d
```

### Step 2: Create Discover Page
**New File: `site/src/pages/discover.astro`**
```astro
---
import DiscoverView from '../components/DiscoverView.tsx';
import Header from '../components/Header.tsx';
---
<html>
  <head><title>discover fucking music</title></head>
  <body class="bg-[#0B0B0B]">
    <Header client:load />
    <DiscoverView client:load />
  </body>
</html>
```

### Step 3: Create Graph Data Structure
**File: `site/src/lib/store.ts`**
```typescript
getGraphData(): { nodes: GraphNode[], links: GraphLink[] } {
  // Build graph from playlists and track connections
  // Nodes = albums/playlists
  // Links = shared artists, tags, or next_tracks relationships
}
```

### Step 4: Build DiscoverView Component
**New File: `site/src/components/DiscoverView.tsx`**

**Option A: 2D Infinite Canvas**
```typescript
import ForceGraph2D from 'react-force-graph-2d';

export default function DiscoverView() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const data = db.getGraphData();
    setGraphData(data);
  }, []);

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      nodeAutoColorBy="group"
      onNodeClick={(node) => navigateToPlaylist(node.id)}
      enableZoomInteraction={true}
      enablePanInteraction={true}
    />
  );
}
```

**Option B: 3D Sphere (Three.js)**
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';

export default function DiscoverView() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <OrbitControls enableRotate={true} />
      <ambientLight />
      {nodes.map(node => (
        <AlbumNode key={node.id} position={node.position} />
      ))}
      {links.map(link => (
        <Connection key={link.id} from={link.source} to={link.target} />
      ))}
    </Canvas>
  );
}
```

### Step 5: Update Header Navigation
**File: `site/src/components/Header.tsx`**
- Add "discover" link between "less" and "more"

### Key Files to Create/Modify
1. `site/src/pages/discover.astro` - New page
2. `site/src/components/DiscoverView.tsx` - Graph visualization
3. `site/src/lib/store.ts` - Add getGraphData()
4. `site/src/components/Header.tsx` - Add nav link

### Dependencies
- `react-force-graph-2d` OR `@react-three/fiber` + `@react-three/drei` + `three`

---

## Issue #16: Display Next Songs to Left and Right

**Goal:** Show adjacent tracks beside the main song using playlist connections.

### Step 1: Create AdjacentTracks Component
**New File: `site/src/components/AdjacentTracks.tsx`**
```typescript
interface AdjacentTracksProps {
  currentTrack: FuckingTrack;
  playlist: FuckingPlaylist;
  onTrackSelect: (track: FuckingTrack) => void;
}

export default function AdjacentTracks({ currentTrack, playlist, onTrackSelect }: AdjacentTracksProps) {
  const [prevTrack, setPrevTrack] = useState<FuckingTrack | null>(null);
  const [nextTrack, setNextTrack] = useState<FuckingTrack | null>(null);

  useEffect(() => {
    // Get previous and next tracks from playlist
    const tracks = db.getTracks(playlist.id);
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    setPrevTrack(currentIndex > 0 ? tracks[currentIndex - 1] : null);
    setNextTrack(currentIndex < tracks.length - 1 ? tracks[currentIndex + 1] : null);
  }, [currentTrack, playlist]);

  return (
    <div className="flex items-center justify-between w-full">
      {/* Previous Track */}
      <div className="w-1/4 opacity-60 hover:opacity-100 cursor-pointer"
           onClick={() => prevTrack && onTrackSelect(prevTrack)}>
        {prevTrack && <TrackCard track={prevTrack} size="small" />}
      </div>

      {/* Current Track - larger, centered */}
      <div className="w-1/2">
        <TrackCard track={currentTrack} size="large" />
      </div>

      {/* Next Track */}
      <div className="w-1/4 opacity-60 hover:opacity-100 cursor-pointer"
           onClick={() => nextTrack && onTrackSelect(nextTrack)}>
        {nextTrack && <TrackCard track={nextTrack} size="small" />}
      </div>
    </div>
  );
}
```

### Step 2: Add shuffleAssociations Function
**File: `site/src/lib/store.ts`**
```typescript
shuffleAssociations(): void {
  // Get all tracks
  const allTracks = Object.values(this.store.getTable('tracks'));

  // Randomly link tracks across playlists
  allTracks.forEach(track => {
    const randomTracks = allTracks
      .filter(t => t.id !== track.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3); // Link to 3 random tracks

    const associations = randomTracks.reduce((acc, t) => {
      acc[t.playlist_id] = t.id;
      return acc;
    }, {});

    this.store.setCell('tracks', track.id, 'next_tracks', JSON.stringify(associations));
  });
}
```

### Step 3: Integrate into PlayerView
**File: `site/src/components/PlayerView.tsx`**
- Replace current track display with AdjacentTracks component
- Wire up track selection callbacks

### Key Files to Create/Modify
1. **New:** `site/src/components/AdjacentTracks.tsx`
2. `site/src/lib/store.ts` - Add shuffleAssociations()
3. `site/src/components/PlayerView.tsx` - Integrate new component

---

## Issue #15: Bottom Indicator Player

**Goal:** Redesign the current music player into a motion-based component displayed at the bottom of the interface.

### Step 1: Install Animation Library
```bash
yarn add framer-motion
```

### Step 2: Create BottomPlayer Component
**New File: `site/src/components/BottomPlayer.tsx`**
```typescript
import { motion, AnimatePresence } from 'framer-motion';

interface BottomPlayerProps {
  track: FuckingTrack | null;
  isPlaying: boolean;
  progress: number; // 0-1
  onTogglePlay: () => void;
}

export default function BottomPlayer({ track, isPlaying, progress, onTogglePlay }: BottomPlayerProps) {
  if (!track) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-[#1a1a1a] border-t border-white/10"
    >
      {/* Progress bar */}
      <motion.div
        className="absolute top-0 left-0 h-1 bg-[#4A6FA5]"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.1 }}
      />

      <div className="flex items-center h-full px-4">
        {/* Album art with animation */}
        <motion.img
          src={track.cover_uri}
          className="w-12 h-12 rounded"
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Track info */}
        <div className="ml-4 flex-1">
          <p className="text-white text-sm font-medium">{track.name}</p>
          <p className="text-white/60 text-xs">{track.artists.join(', ')}</p>
        </div>

        {/* Play/Pause button */}
        <motion.button
          onClick={onTogglePlay}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </motion.button>
      </div>

      {/* Sound wave animation when playing */}
      {isPlaying && (
        <div className="absolute right-20 top-1/2 -translate-y-1/2 flex gap-1">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="w-1 bg-[#4A6FA5] rounded"
              animate={{ height: [8, 16, 8] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
```

### Step 3: Update Page Layout
**File: `site/src/pages/player.astro`**
- Add padding-bottom to main content to account for fixed bottom player
- Import and render BottomPlayer component

### Step 4: Connect to Audio State
**File: `site/src/components/PlayerLayout.tsx`**
- Pass audio element state to BottomPlayer
- Wire up play/pause callbacks

### Key Files to Create/Modify
1. **New:** `site/src/components/BottomPlayer.tsx`
2. `site/src/components/PlayerLayout.tsx` - Wire up state
3. `site/src/pages/player.astro` - Layout adjustments

### Dependencies
- `framer-motion`

---

## Issue #14: Refactor Music Player Component

**Goal:** Redesign the horizontal player bar into a clustered layout with controls on the sides.

### Step 1: Create New Player Layout
**File: `site/src/components/PlayerView.tsx`**

```typescript
// New clustered layout structure:
<div className="flex items-center justify-center gap-8">
  {/* Left control cluster */}
  <div className="flex flex-col items-center gap-2">
    <button onClick={previousTrack}>
      <SkipBackIcon className="w-8 h-8" />
    </button>
    <span className="text-xs text-white/60">Previous</span>
  </div>

  {/* Center: Album art + track info */}
  <div className="flex flex-col items-center">
    <img src={track.cover_uri} className="w-48 h-48 rounded-lg shadow-xl" />
    <h2 className="mt-4 text-xl font-bold text-white">{track.name}</h2>
    <p className="text-white/60">{track.artists.join(', ')}</p>

    {/* Progress bar below */}
    <div className="w-full mt-4">
      <Slider value={progress} onChange={seek} />
      <div className="flex justify-between text-xs text-white/60 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  </div>

  {/* Right control cluster */}
  <div className="flex flex-col items-center gap-2">
    <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white">
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
    <button onClick={nextTrack}>
      <SkipForwardIcon className="w-8 h-8" />
    </button>
  </div>
</div>
```

### Step 2: Extract Reusable Control Components
**New File: `site/src/components/PlayerControls.tsx`**
```typescript
export function PlayPauseButton({ isPlaying, onClick }) { ... }
export function SkipButton({ direction, onClick }) { ... }
export function ProgressSlider({ value, onChange }) { ... }
```

### Step 3: Update Styling
- Use larger touch targets for mobile
- Add hover/active states for buttons
- Maintain dark theme consistency

### Key Files to Modify
1. `site/src/components/PlayerView.tsx` - New layout
2. **New:** `site/src/components/PlayerControls.tsx` - Reusable controls

---

## Issue #13: First Draft of Graph View

**Goal:** Initial implementation of graph visualization for music connections.

*Note: This is the foundation for Issue #17. Implement a basic version first.*

### Step 1: Install D3.js for Simple Graph
```bash
yarn add d3
```

### Step 2: Create Basic Graph Component
**New File: `site/src/components/GraphView.tsx`**
```typescript
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

export default function GraphView() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight - 100;

    // Get data from store
    const playlists = db.getAllPlaylists();
    const nodes = playlists.map(p => ({
      id: p.id,
      name: p.name,
      cover: p.track_cover_uri
    }));

    // Create links based on shared artists/tags
    const links = createLinks(playlists);

    // D3 force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Render nodes as circles with album art
    const node = svg.selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    node.append('circle')
      .attr('r', 30)
      .attr('fill', '#4A6FA5');

    node.append('text')
      .text(d => d.name.substring(0, 10))
      .attr('text-anchor', 'middle')
      .attr('fill', 'white');

    // Render links
    const link = svg.selectAll('.link')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#ffffff33');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  }, []);

  return (
    <svg ref={svgRef} className="w-full h-full bg-[#0B0B0B]" />
  );
}
```

### Step 3: Create Graph Page
**New File: `site/src/pages/graph.astro`**
```astro
---
import GraphView from '../components/GraphView.tsx';
import Header from '../components/Header.tsx';
---
<html>
  <head><title>graph view</title></head>
  <body class="bg-[#0B0B0B] overflow-hidden">
    <Header client:load />
    <div class="w-full h-screen">
      <GraphView client:load />
    </div>
  </body>
</html>
```

### Key Files to Create
1. **New:** `site/src/components/GraphView.tsx`
2. **New:** `site/src/pages/graph.astro`

### Dependencies
- `d3`

---

## Implementation Priority

Based on dependencies and complexity, recommended order:

1. **Issue #14** - Refactor music player (foundational UI improvement)
2. **Issue #15** - Bottom indicator player (builds on #14)
3. **Issue #16** - Adjacent tracks display (builds on player work)
4. **Issue #18** - Enhanced Find mode (independent feature)
5. **Issue #13** - Graph view draft (visualization foundation)
6. **Issue #17** - Discover view (builds on #13)

---

*Generated by Claude Code - December 2025*
