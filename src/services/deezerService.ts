import axios from 'axios';
import { Song } from '../types';

const api = axios.create({
  baseURL: 'https://deezerdevs-deezer.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': 'e6c4deb059msh5b86828f7621de6p12127fjsn9ac9aafa782d',
    'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com'
  }
});

interface DeezerTrack {
  id: number;
  title: string;
  preview: string; // 30 second preview URL
  artist: {
    name: string;
  };
  album: {
    title: string;
    cover_medium: string;
  };
}

interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

export const deezerService = {
  // Search for tracks
  async searchTracks(query: string, limit: number = 10): Promise<Song[]> {
    try {
      const response = await api.get<DeezerSearchResponse>(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      return response.data.data.map(track => ({
        id: String(track.id),
        name: track.title,
        cover: track.album.cover_medium,
        artist: track.artist.name,
        audio: track.preview,
        alt: `Album cover for ${track.album.title} by ${track.artist.name}`
      }));
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw error;
    }
  },

  // Get playlist tracks
  async getPlaylist(playlistId: string): Promise<Song[]> {
    try {
      const response = await api.get<{tracks: {data: DeezerTrack[]}}>(`/playlist/${playlistId}`);
      
      return response.data.tracks.data.map(track => ({
        id: String(track.id),
        name: track.title,
        cover: track.album.cover_medium,
        artist: track.artist.name,
        audio: track.preview,
        alt: `Album cover for ${track.album.title} by ${track.artist.name}`
      }));
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw error;
    }
  },

  // Get artist's top tracks
  async getArtistTracks(artistId: string, limit: number = 10): Promise<Song[]> {
    try {
      const response = await api.get<{data: DeezerTrack[]}>(`/artist/${artistId}/top?limit=${limit}`);
      
      return response.data.data.map(track => ({
        id: String(track.id),
        name: track.title,
        cover: track.album.cover_medium,
        artist: track.artist.name,
        audio: track.preview,
        alt: `Album cover for ${track.album.title} by ${track.artist.name}`
      }));
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
      throw error;
    }
  }
};