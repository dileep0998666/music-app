"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Song {
  item: {
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    duration_ms: number;
  };
  progress_ms: number;
}

export default function MusicApp() {
  const { data: session } = useSession();
  const [song, setSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      const fetchCurrentSong = () => {
        fetch("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
          .then((res) => res.json())
          .then(setSong)
          .catch(console.error);
      };

      fetchCurrentSong();
      const interval = setInterval(fetchCurrentSong, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center">
      {!session ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold">Music Player</h1>
            <Button
              size="lg"
              onClick={() => signIn("spotify")}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-md"
            >
              Login with Spotify
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="p-6 w-full flex justify-between items-center bg-black/40 backdrop-blur-md fixed top-0 z-10">
            <div className="flex items-center space-x-3">
              <UserCircle2 className="w-8 h-8" />
              <span className="text-lg font-medium">{session.user?.name}</span>
            </div>
            <Button variant="ghost" onClick={() => signOut()}>Logout</Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-10 mt-20">
            {song && song.item ? (
              <>
                {/* Album Art */}
                <div className="relative w-64 h-64 md:w-96 md:h-96 shadow-xl rounded-xl overflow-hidden">
                  <img
                    src={song.item.album.images[0]?.url || "/placeholder.jpg"}
                    alt={song.item.album.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="text-center">
                  <h2 className="text-3xl font-semibold">{song.item.name}</h2>
                  <p className="text-zinc-400 text-lg">{song.item.artists.map(a => a.name).join(", ")}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-lg">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(song.progress_ms / song.item.duration_ms) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-zinc-400 mt-2">
                    <span>{formatTime(song.progress_ms)}</span>
                    <span>{formatTime(song.item.duration_ms)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-2xl">No song playing</p>
                <p className="text-zinc-400">Select a song in Spotify</p>
              </div>
            )}
          </main>

          {/* Playback Controls */}
          <footer className="h-24 w-full fixed bottom-0 bg-black/50 backdrop-blur-lg flex justify-center items-center border-t border-gray-800 p-6">
            <div className="flex items-center space-x-6">
              <Button variant="ghost">
                <Shuffle className="w-6 h-6 text-zinc-400" />
              </Button>
              <Button variant="ghost">
                <SkipBack className="w-8 h-8" />
              </Button>
              <Button
                className="w-14 h-14 rounded-full bg-white text-black shadow-lg"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
              <Button variant="ghost">
                <SkipForward className="w-8 h-8" />
              </Button>
              <Button variant="ghost">
                <Repeat className="w-6 h-6 text-zinc-400" />
              </Button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}