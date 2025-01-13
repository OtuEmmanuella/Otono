import axios from 'axios';
import { Song } from '../types';

// Create axios instance with proxy configuration
const api = axios.create({
  baseURL: '/api/deezer', // This will be handled by the proxy
});

interface DeezerTrack {
  id: number;
  title: string;
  preview: string;
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

export const apiService = {
  async searchTracks(query: string, limit: number = 10): Promise<Song[]> {
    if (!query.trim()) return [];
    
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

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) return [];
    
    try {
      const response = await api.get<DeezerSearchResponse>(`/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data.data.map(track => track.title);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
};