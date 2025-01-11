import React, { useRef, useState, useEffect } from "react";
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

  // Handle audio loading errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setError("Error playing audio. Please try another track.");
      setIsPlaying(false);
    };

    audio.addEventListener("error", handleError);
    return () => audio.removeEventListener("error", handleError);
  }, []);

  const handleMetaData = (event: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    setSongInfo({
      duration: event.currentTarget.duration || 0,
      currentTime: event.currentTarget.currentTime,
    });
  };

const handleNextSong = async (_: any, selectedId?: string) => {
  if (!songs.length) return;

  try {
    // Immediately set loading state
    setIsLoading(true);
    
    // First, stop current playback
    if (audioRef.current) {
      await audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    let songId = selectedId ? selectedId : nowPlaying?.id;
    let id = songs.findIndex((song) => song.id === songId);

    let nextSong: Song;
    if (selectedId) {
      nextSong = songs[id];
    } else if (shuffle && !selectedId) {
      nextSong = songs[getRandomNumber(songs.length)];
    } else {
      nextSong = songs[(id + 1) % songs.length];
    }

    // Update state before attempting to play
    setNowPlaying(nextSong);
    
    if (audioRef.current) {
      // Reset audio element
      audioRef.current.src = nextSong.audio;
      
      // Wait for audio to be loaded
      await new Promise((resolve) => {
        if (audioRef.current) {
          audioRef.current.oncanplaythrough = resolve;
          audioRef.current.load();
        }
      });

      // Only attempt to play if still supposed to be playing
      if (isPlaying || selectedId) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.error("Error playing audio:", err);
          setError("Failed to play audio. Please try again.");
          setIsPlaying(false);
        }
      }
    }
  } catch (err) {
    console.error("Error changing song:", err);
    setError("Failed to change song. Please try again.");
    setIsPlaying(false);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleCanPlay = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = (e: Event) => {
    console.error("Audio error:", e);
    setError("Error playing audio. Please try another track.");
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
  };

  // Add all event listeners
  audio.addEventListener("canplay", handleCanPlay);
  audio.addEventListener("error", handleError);
  audio.addEventListener("waiting", handleWaiting);
  audio.addEventListener("playing", handlePlaying);

  // Cleanup
  return () => {
    audio.removeEventListener("canplay", handleCanPlay);
    audio.removeEventListener("error", handleError);
    audio.removeEventListener("waiting", handleWaiting);
    audio.removeEventListener("playing", handlePlaying);
  };
}, []);
  

  if (isLoading) {
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
                  src={nowPlaying.audio}
                  ref={audioRef}
                  onLoadedMetadata={handleMetaData}
                  onTimeUpdate={handleMetaData}
                  onEnded={() => handleNextSong(null)}
                  preload="auto"
                ></audio>
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