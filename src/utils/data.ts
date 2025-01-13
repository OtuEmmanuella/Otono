import { v4 as uuidv4 } from "uuid";
import { Song } from "../types";
import { deezerService } from "../services/deezerService";

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
    // You can customize the search query based on your needs
    const songs = await deezerService.searchTracks('peaceful inspiration relaxing', 10);
    return songs.length > 0 ? songs : FALLBACK_SONGS;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return FALLBACK_SONGS;
  }
}

