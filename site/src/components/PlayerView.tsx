import { useState, useMemo, useRef, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";
import type { FuckingPlaylist, FuckingTrack } from "@/shared/types";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function PlayerView({
  playlist,
  tracks,
  initialTrackIndex = 0,
  initialTimeMs = 0,
  onStateChange,
}: {
  playlist: FuckingPlaylist;
  tracks: FuckingTrack[];
  initialTrackIndex?: number;
  initialTimeMs?: number;
  onStateChange?: (trackIndex: number, timeMs: number) => void;
}) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [currentTimeMs, setCurrentTimeMs] = useState(initialTimeMs);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialSeekDone = useRef(false);

  const currentTrack = tracks[currentTrackIndex];
  const totalDuration = currentTrack.time_ms;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    audio.src = currentTrack.stream_url;
    audio.load();

    // Seek to initial position on first load
    const handleCanPlay = () => {
      if (!initialSeekDone.current && initialTimeMs > 0 && currentTrackIndex === initialTrackIndex) {
        audio.currentTime = initialTimeMs / 1000;
        setCurrentTimeMs(initialTimeMs);
        initialSeekDone.current = true;
      }
      audio.removeEventListener("canplay", handleCanPlay);
    };

    if (!initialSeekDone.current && currentTrackIndex === initialTrackIndex) {
      audio.addEventListener("canplay", handleCanPlay);
    } else {
      setCurrentTimeMs(0);
    }

    if (isPlaying) {
      audio.play();
    }

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentTrack.stream_url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTimeMs(audio.currentTime * 1000);
    };

    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex, tracks.length]);

  // Save state periodically (every 5 seconds)
  useEffect(() => {
    if (!onStateChange) return;

    const interval = setInterval(() => {
      onStateChange(currentTrackIndex, currentTimeMs);
    }, 5000);

    // Also save on track change
    onStateChange(currentTrackIndex, currentTimeMs);

    return () => clearInterval(interval);
  }, [currentTrackIndex, onStateChange]);

  // Save state on unmount
  useEffect(() => {
    return () => {
      if (onStateChange) {
        onStateChange(currentTrackIndex, currentTimeMs);
      }
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value / 1000;
    setCurrentTimeMs(value);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTimeMs(0);
    setIsPlaying(true);
  };

  const remainingMs = useMemo(() => {
    const remainingInCurrentTrack = currentTrack.time_ms - currentTimeMs;
    const remainingTracks = tracks.slice(currentTrackIndex + 1);
    const remainingTracksTime = remainingTracks.reduce(
      (acc, track) => acc + track.time_ms,
      0
    );
    return remainingInCurrentTrack + remainingTracksTime;
  }, [currentTrackIndex, currentTimeMs, tracks]);

  const remainingMinutes = Math.floor(remainingMs / 60000);

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <div className="max-w-2xl">

        {/*
      <div className="flex justify-between items-center">
        <span className="text-4xl text-white/50 tracking-tight">less</span>
        <span className="text-4xl text-white/50 tracking-tight">more?</span>
      </div> */}

      <h1 className="text-5xl italic text-[#4A6FA5] tracking-tight mt-2">
        fucking music
      </h1>

      <div className="mt-4 space-y-1">
        <div className="flex gap-4 text-white/90 text-base">
          <span>{playlist.name}</span>
          <span className="capitalize">{currentTrack.name}</span>
        </div>
        <div className="flex justify-between text-white/60 text-base">
          <span>{playlist.artists[0]}</span>
          <span>{remainingMinutes} minutes left</span>
        </div>
      </div>

      <div className="mt-2 relative">
        <img
          src={playlist.track_cover_uri}
          alt={`${playlist.name} album cover`}
          className="w-full aspect-square object-cover"
        />
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
        >
          <span className="text-white text-6xl">
            {isPlaying ? "⏸" : "▶"}
          </span>
        </button>
      </div>

      <div className="mt-4">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[currentTimeMs]}
          max={totalDuration}
          step={1000}
          onValueChange={([value]) => handleSeek(value)}
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
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center justify-between text-white/70 cursor-pointer hover:text-white/90 transition-colors"
            onClick={() => handleTrackSelect(index)}
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
    </div>
  );
}

export default PlayerView;
