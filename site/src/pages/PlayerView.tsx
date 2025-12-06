import { useState, useMemo } from "react";
import * as Slider from "@radix-ui/react-slider";

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

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function PlayerView() {
  const Tracks: Track[] = [
    {
      id: "track-0",
      time_ms: 322000,
      name: "i dream of you",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-1",
      },
    },
    {
      id: "track-1",
      time_ms: 350000,
      name: "marauder",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-2",
      },
    },
    {
      id: "track-2",
      time_ms: 344000,
      name: "spending saturday scorned",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-3",
      },
    },
    {
      id: "track-3",
      time_ms: 297000,
      name: "inviolate",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-4",
      },
    },
    {
      id: "track-4",
      time_ms: 363000,
      name: "eastern idiosyncrasies",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-5",
      },
    },
    {
      id: "track-5",
      time_ms: 286000,
      name: "carry on",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-6",
      },
    },
    {
      id: "track-6",
      time_ms: 238000,
      name: "top of the stack",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-7",
      },
    },
    {
      id: "track-7",
      time_ms: 434000,
      name: "hate like us",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-8",
      },
    },
    {
      id: "track-8",
      time_ms: 211000,
      name: "no love",
      artists: ["Oblique Occasions"],
      next_tracks: {
        "play-anathema": "track-9",
      },
    },
    {
      id: "track-9",
      time_ms: 215000,
      name: "feeling good (bonus)",
      artists: ["Oblique Occasions"],
    },
  ];

  const Anathema: Playlist = {
    id: "play-anathema",
    name: "Anathema",
    track_cover_uri: "https://f4.bcbits.com/img/a3309345917_10.jpg",
    artists: ["Oblique Occasions"],
    first_track: Tracks[0],
  };

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(180000); // 3:00 as shown in design

  const currentTrack = Tracks[currentTrackIndex];
  const totalDuration = currentTrack.time_ms;
  const progress = (currentTimeMs / totalDuration) * 100;

  const remainingMs = useMemo(() => {
    const remainingInCurrentTrack = currentTrack.time_ms - currentTimeMs;
    const remainingTracks = Tracks.slice(currentTrackIndex + 1);
    const remainingTracksTime = remainingTracks.reduce(
      (acc, track) => acc + track.time_ms,
      0
    );
    return remainingInCurrentTrack + remainingTracksTime;
  }, [currentTrackIndex, currentTimeMs, Tracks]);

  const remainingMinutes = Math.floor(remainingMs / 60000);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-4xl text-white/50 tracking-tight">less</span>
        <span className="text-4xl text-white/50 tracking-tight">more?</span>
      </div>

      <h1 className="text-5xl italic text-[#4A6FA5] tracking-tight mt-2">
        fucking music
      </h1>

      <div className="mt-4 space-y-1">
        <div className="flex gap-4 text-white/90 text-base">
          <span>{Anathema.name}</span>
          <span className="capitalize">{currentTrack.name}</span>
        </div>
        <div className="flex justify-between text-white/60 text-base">
          <span>{Anathema.artists[0]}</span>
          <span>{remainingMinutes} minutes left</span>
        </div>
      </div>

      <div className="mt-2">
        <img
          src={Anathema.track_cover_uri}
          alt={`${Anathema.name} album cover`}
          className="w-full aspect-square object-cover"
        />
      </div>

      <div className="mt-4">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[currentTimeMs]}
          max={totalDuration}
          step={1000}
          onValueChange={([value]) => setCurrentTimeMs(value)}
        >
          <Slider.Track className="bg-[#6B8CC7] relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-[#3B5998] rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-3 h-3 bg-[#E85A4F] rounded-full focus:outline-none" />
        </Slider.Root>

        <div className="flex justify-between mt-2 text-white/70 text-sm">
          <span>{formatTime(currentTimeMs)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {Tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center justify-between text-white/70 cursor-pointer hover:text-white/90 transition-colors"
            onClick={() => {
              setCurrentTrackIndex(index);
              setCurrentTimeMs(0);
            }}
          >
            <div className="flex items-center gap-3">
              {index === currentTrackIndex && (
                <span className="text-white text-sm">▶</span>
              )}
              <span
                className={`text-base ${index === currentTrackIndex ? "text-white ml-0" : "ml-6"}`}
              >
                {track.name}
              </span>
            </div>
            <span className="text-sm">{formatTime(track.time_ms)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayerView;
