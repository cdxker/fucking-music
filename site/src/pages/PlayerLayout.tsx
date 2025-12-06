import { Button } from "@/components/ui/button";
import PlayerView from "./components/PlayerView";


export default function PlayerLayout() {

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

  let playlist: Playlist | undefined;

  // playlist= {
  //   id: "play-anathema",
  //   name: "Anathema",
  //   track_cover_uri: "https://f4.bcbits.com/img/a3309345917_10.jpg",
  //   artists: ["Oblique Occasions"],
  //   first_track: Tracks[0],
  // };


  return (
    <div className="min-h-screen px-5 pt-8 pb-12 bg-[#0B0B0B]">
      {playlist && 
      <PlayerView 
          playlist={playlist}
          tracks={Tracks}
        />}

      {playlist === undefined && 
        <div className="w-full h-screen flex justify-center items-center">
          <Button 
            variant='outline'
            size="lg"
            className="text-3xl text-white/70">
            Add Music
          </Button>
        </div>
      }
    </div>
  );
}
