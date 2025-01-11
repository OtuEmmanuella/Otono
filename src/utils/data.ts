// data.ts
import { v4 as uuidv4 } from "uuid";
import { Song } from "../types";

// Updated FALLBACK_SONGS with reliable audio sources
const FALLBACK_SONGS: Song[] = [
  {
    id: uuidv4(),
    name: "Sunset Vibes",
    cover: "https://picsum.photos/200",
    artist: "ChillHop Music",
    audio: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
    alt: "Album cover for 'Sunset Vibes' by ChillHop Music"
  },
  {
    id: uuidv4(),
    name: "Morning Coffee",
    cover: "https://picsum.photos/201",
    artist: "ChillHop Music",
    audio: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    alt: "Album cover for 'Morning Coffee' by ChillHop Music"
  }
];

interface DeezerTrack {
  title: string;
  preview: string;
  artist?: {
    name: string;
  };
  album?: {
    title: string;
    cover_medium: string;
  };
}

interface DeezerResponse {
  data: DeezerTrack[];
}

export async function fetchTracks(): Promise<Song[]> {
  try {
    const response = await fetch('/api/deezer/search?q=chillhop&limit=6');
    
    if (!response.ok) {
      console.warn(`Falling back to local tracks due to API error: ${response.status}`);
      return FALLBACK_SONGS;
    }

    const data = await response.json() as DeezerResponse;

    if (!data?.data?.length) {
      console.warn('No tracks received from API, using fallback');
      return FALLBACK_SONGS;
    }

    const songs: Song[] = data.data.map((track: DeezerTrack) => ({
      id: uuidv4(),
      name: track.title || 'Unknown Track',
      cover: track.album?.cover_medium || 'https://picsum.photos/200',
      artist: track.artist?.name || 'Unknown Artist',
      audio: track.preview,
      alt: `Album cover for '${track.album?.title || 'Unknown Album'}' by ${track.artist?.name || 'Unknown Artist'}`
    }));

    // Validate that all songs have valid audio URLs
    const validSongs = songs.filter((song: Song) => song.audio && typeof song.audio === 'string');
    
    return validSongs.length > 0 ? validSongs : FALLBACK_SONGS;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return FALLBACK_SONGS;
  }
}