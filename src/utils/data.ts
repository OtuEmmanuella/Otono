// utils/data.ts
import { v4 as uuidv4 } from "uuid";
import { Song } from "../types";

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

export async function fetchTracks(): Promise<Song[]> {
  try {
    const response = await fetch('/api/deezer/search?q=chillhop&limit=6');
    
    // Check if response is ok and content type is JSON
    const contentType = response.headers.get('content-type');
    if (!response.ok || !contentType?.includes('application/json')) {
      console.warn('Invalid API response, using fallback tracks');
      return FALLBACK_SONGS;
    }

    const data = await response.json();
    
    if (!data?.data?.length) {
      console.warn('No tracks in API response, using fallback');
      return FALLBACK_SONGS;
    }

    const songs: Song[] = data.data.map((track: any) => ({
      id: uuidv4(),
      name: track.title || 'Unknown Track',
      cover: track.album?.cover_medium || 'https://picsum.photos/200',
      artist: track.artist?.name || 'Unknown Artist',
      audio: track.preview || '',
      alt: `Album cover for '${track.album?.title || 'Unknown Album'}' by ${track.artist?.name || 'Unknown Artist'}`
    }));

    // Validate songs have required fields
    const validSongs = songs.filter(song => 
      song.audio && 
      typeof song.audio === 'string' &&
      song.name &&
      song.cover &&
      song.artist
    );

    return validSongs.length > 0 ? validSongs : FALLBACK_SONGS;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return FALLBACK_SONGS;
  }
}