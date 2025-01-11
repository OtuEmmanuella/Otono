import React, { useState } from "react";
import { Song } from "../types";
import { getRandomNumber, getPercentage, getSeconds } from "../utils";

import { ReactComponent as Pause } from "../assets/pause.svg";
import { ReactComponent as Play } from "../assets/play.svg";
import { ReactComponent as Next } from "../assets/next.svg";
import { ReactComponent as Prev } from "../assets/prev.svg";
import { ReactComponent as Shuffle } from "../assets/shuffle.svg";

type SongInfo = {
  currentTime: number;
  duration: number;
};

interface PlayerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setSongInfo: React.Dispatch<React.SetStateAction<SongInfo>>;
  setNowPlaying: React.Dispatch<React.SetStateAction<Song | null>>;
  nowPlaying: Song;
  currentSongId: string;
  songInfo: SongInfo;
  setShuffle: React.Dispatch<React.SetStateAction<boolean>>;
  shuffle: boolean;
  songs: Song[];
}

export const Player: React.FC<PlayerProps> = ({
  audioRef,
  isPlaying,
  setIsPlaying,
  songInfo,
  setSongInfo,
  setNowPlaying,
  currentSongId,
  nowPlaying,
  setShuffle,
  shuffle,
  songs,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handlePlayPause = async () => {
    try {
      if (!audioRef.current) return;
  
      if (!isPlaying) {
        // Make sure audio is loaded before playing
        await new Promise((resolve) => {
          if (audioRef.current) {
            audioRef.current.oncanplaythrough = resolve;
            audioRef.current.load();
          }
        });
  
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      } else {
        await audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setError("Unable to play this track. Please try another.");
      setIsPlaying(false);
    }
  };

  const handleSliderDrag = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSongInfo({
      ...songInfo,
      currentTime: +event.target.value,
    });

    if (audioRef.current) {
      audioRef.current.currentTime = +event.target.value;
    }
  };

  const handleChangeSong = async (direction: string) => {
    let id = songs.findIndex((song) => song.id === currentSongId);

    let shuffledSong = shuffle ? songs[getRandomNumber(songs.length)] : null;

    if (direction === "next") {
      let nextSong = shuffledSong || songs[(id + 1) % songs.length];
      await setNowPlaying(nextSong);
    } else if (direction === "prev") {
      let prevSong =
        shuffledSong || songs[(id - 1 + songs.length) % songs.length];
      await setNowPlaying(prevSong);
    }

    if (isPlaying) audioRef.current?.play();
  };

  const { currentTime, duration } = songInfo;

  

  return (
    <>
      <div className="player__nowPlaying">
        <img
          src={nowPlaying.cover}
          alt={nowPlaying.alt}
          className={isPlaying ? "playing" : ""}
        />
        <h2>{nowPlaying.name}</h2>
        <h3>{nowPlaying.artist}</h3>
      </div>

      <div className="player__indicator">
        <span>{getSeconds(currentTime)}</span>

        <div data-type="range">
          <label className="vh" htmlFor="range">
            Song Progress
          </label>
          <input
            type="range"
            id="range"
            min="0"
            max={duration}
            value={currentTime}
            list="none"
            onChange={handleSliderDrag}
          />
          <div
            style={{
              transform: `translateX(${getPercentage(currentTime, duration)}%)`,
            }}
          ></div>
        </div>

        <span>{getSeconds(duration)}</span>
      </div>

      <div className="player__controls">
        <button
          type="button"
          onClick={() => handleChangeSong("prev")}
          aria-label="Previous Music"
        >
          <Prev />
        </button>

        <button type="button" onClick={handlePlayPause}>
          {isPlaying ? <Pause /> : <Play />}
          <span className="vh">{isPlaying ? "Pause Music" : "Play Music"}</span>
        </button>

        <button
          type="button"
          aria-label="Next Music"
          onClick={() => handleChangeSong("next")}
        >
          <Next />
        </button>

        <button
          type="button"
          aria-label="Shuffle Music"
          className={shuffle ? "selected" : ""}
          onClick={() => setShuffle((shuffle) => !shuffle)}
        >
          <Shuffle />
        </button>
      </div>
    </>
  );
};

