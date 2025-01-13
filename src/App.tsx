import React, { useRef, useState, useEffect, useCallback } from "react";
import { Player } from "./components/Player";
import { deezerService } from "./services/deezerService";
import { getRandomNumber } from "./utils";
import { ReactComponent as Library } from "./assets/songs.svg";
import { ToggleButton } from "./components/ToggleButton";
import { Song } from "./types";

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLElement>(null);

  const handleSearch = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const searchResults = await deezerService.searchTracks(query);
      setSongs(searchResults);
      
      // If we have results and no current song is playing, set the first result as nowPlaying
      if (searchResults.length > 0 && !nowPlaying) {
        setNowPlaying(searchResults[0]);
      }
    } catch (err) {
      console.error("Error searching songs:", err);
      setError("Failed to search songs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  const debounceSearch = useCallback(
    (function () {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handleSearch(query), 500);
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      debounceSearch(query);
    }
  };

  const handleNextSong = useCallback((event: any, selectedId?: string) => {
    if (!songs.length) return;

    try {
      setIsLoading(true);
      
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

  // Load initial songs
  useEffect(() => {
    handleSearch("peaceful inspiration"); // Initial search
  }, []);

  // Audio element setup and event handlers
  useEffect(() => {
    if (!audioRef.current || !nowPlaying) return;

    const audio = audioRef.current;
    
    audio.currentTime = 0;
    audio.src = nowPlaying.audio;
    audio.load();

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

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

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
        <div className="search-container">
          <input
            type="search"
            placeholder="Search for songs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
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