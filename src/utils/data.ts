import { v4 as uuidv4 } from "uuid";
import { Song } from "../types";

const FALLBACK_SONGS: Song[] = [
 
  {
    id: uuidv4(),
    name: "Love & Light",
    cover: "https://images.unsplash.com/photo-1518818419601-72c8673f5852?w=400&q=80",
    artist: "Inspirational",
    audio: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    alt: "Heart made of light in dark background"
    },
  

  {
    id: uuidv4(),
    name: "Morning Inspiration",
    cover: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=80",
    artist: "Nature Vibes",
    audio: "https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav",
    alt: "Sunrise through trees with golden light"
  },
  {
    id: uuidv4(),
    name: "Pure Love",
    cover: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80",
    artist: "Romance",
    audio: "https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav",
    alt: "Heart shape made from rose petals"
  },
  {
    id: uuidv4(),
    name: "Dream Journey",
    cover: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
    artist: "Inspirational",
    audio: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
    alt: "Sunrise over mountains with inspirational view"
  },
  {
    id: uuidv4(),
    name: "Eternal Hope",
    cover: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    artist: "Nature Vibes",
    audio: "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther60.wav",
    alt: "Beautiful landscape with mountains and forest"
  }
];

export async function fetchTracks(): Promise<Song[]> {
  try {
    const response = await fetch('/api/deezer/search?q=love+inspiration+peaceful&limit=10');
    
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