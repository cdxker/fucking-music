type PlaylistId = `play-${string}`;

interface Playlist {
  id: PlaylistId;
  track_cover_uri: string;
  first_track: Track;
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
  const Tracks: Track[] = [
    {
        id: "track-0",
        time_ms: 322000,
        name: "i dream of you",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-1"
        }
    },
    {
        id: "track-1",
        time_ms: 350000,
        name: "marauder",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-2"
        }
    },
    {
        id: "track-2",
        time_ms: 344000,
        name: "spending saturday scorned",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-3"
        }
    },
    {
        id: "track-3",
        time_ms: 297000,
        name: "inviolate",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-4"
        }
    },
    {
        id: "track-4",
        time_ms: 363000,
        name: "eastern idiosyncrasies",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-5"
        }
    },
    {
        id: "track-5",
        time_ms: 286000,
        name: "carry on",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-6"
        }
    },
    {
        id: "track-6",
        time_ms: 238000,
        name: "top of the stack",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-7"
        }
    },
    {
        id: "track-7",
        time_ms: 434000,
        name: "hate like us",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-8"
        }
    },
    {
        id: "track-8",
        time_ms: 211000,
        name: "no love",
        artists: ["Oblique Occasions"],
        next_tracks: {
          'play-anathema': "track-9"
        }
    },
    {
        id: "track-9",
        time_ms: 215000,
        name: "feeling good (bonus)",
        artists: ["Oblique Occasions"]
    },
  ]

  const Anathema: Playlist = {
    id: "play-anathema",
    track_cover_uri: "https://f4.bcbits.com/img/a3309345917_10.jpg",
    artists: ["Oblique Occasions"],
    first_track: Tracks[0]
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
      <PlaylistView playlist={Anathema} />
    </div>
  );
}

export default PlayerView;
