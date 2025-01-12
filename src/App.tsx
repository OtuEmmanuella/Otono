import React, { useRef, useState, useEffect, useCallback } from "react";
import { Player } from "./components/Player";
import { fetchTracks, getRandomNumber } from "./utils";
import { ReactComponent as Library } from "./assets/songs.svg";
import { ToggleButton } from "./components/ToggleButton";
import { Song } from "./types";

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLElement>(null);

  const handleNextSong = useCallback((event: any, selectedId?: string) => {
    if (!songs.length) return;

    try {
      setIsLoading(true);
      
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
      }

      let nextSong: Song;
      if (selectedId) {
        nextSong = songs.find(song => song.id === selectedId) || songs[0];
      } else if (shuffle) {
        nextSong = songs[getRandomNumber(songs.length)];
      } else {
        const currentIndex = songs.findIndex(song => song.id === nowPlaying?.id);
        nextSong = songs[(currentIndex + 1) % songs.length];
      }

      setNowPlaying(nextSong);
      setError(null);
      
    } catch (err) {
      console.error("Error changing song:", err);
      setError("Failed to change song. Please try again.");
      setIsPlaying(false);
    }
  }, [songs, shuffle, nowPlaying]);

  // Load songs on component mount
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setIsLoading(true);
        const fetchedSongs = await fetchTracks();
        
        if (fetchedSongs.length === 0) {
          throw new Error("No songs available");
        }

        setSongs(fetchedSongs);
        setNowPlaying(fetchedSongs[0]);
        setError(null);
      } catch (err) {
        console.error("Error loading songs:", err);
        setError("Failed to load songs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    loadSongs();
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current || !nowPlaying) return;

    const audio = audioRef.current;
    
    // Reset audio element state
    audio.currentTime = 0;
    audio.src = nowPlaying.audio;
    
    // Preload audio
    audio.load();

    // Handle audio events
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      if (isPlaying) {
        audio.play().catch(err => {
          console.error("Error auto-playing:", err);
          setIsPlaying(false);
        });
      }
    };

    const handleError = () => {
      setError("Error playing audio. Please try another track.");
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleEnded = () => {
      handleNextSong(null);
    };

    const handleTimeUpdate = () => {
      setSongInfo({
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      });
    };

    // Add event listeners
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Cleanup
    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [nowPlaying, isPlaying, handleNextSong]);

  if (isLoading && !nowPlaying) {
    return <div className="loading">Loading songs...</div>;
  }

  return (
    <>
      <header>
        <h1>Otonó</h1>
        <nav>
          <ToggleButton />
          <button
            type="button"
            aria-label="view library"
            aria-controls="tracks"
            aria-expanded={showTracks}
            onClick={() => {
              setShowTracks(true);
              trackRef.current?.focus();
            }}
          >
            <Library />
          </button>
        </nav>
      </header>

      <main>
        {error ? (
          <div className="error-message" role="alert">
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        ) : (
          <>
            <section className="player">
              {nowPlaying && (
                <audio
                  ref={audioRef}
                  preload="auto"
                />
              )}

              {nowPlaying && (
                <Player
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  songInfo={songInfo}
                  setSongInfo={setSongInfo}
                  setNowPlaying={setNowPlaying}
                  currentSongId={nowPlaying.id}
                  nowPlaying={nowPlaying}
                  setShuffle={setShuffle}
                  shuffle={shuffle}
                  songs={songs}
                />
              )}
            </section>

            <aside
              data-showtracks={showTracks}
              ref={trackRef}
              id="tracks"
              aria-label="all tracks"
              onClick={() => setShowTracks(!showTracks)}
            >
              <ul>
                {songs.map((song) => (
                  <li
                    key={song.id}
                    onClick={() => handleNextSong(null, song.id)}
                    className={nowPlaying?.id === song.id ? "selected" : ""}
                  >
                    <img src={song.cover} alt={song.alt} />
                    <div>
                      <span>{song.name}</span> <br />
                      <span>{song.artist}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </>
        )}
      </main>

      <footer></footer>
    </>
  );
};

export default App;
