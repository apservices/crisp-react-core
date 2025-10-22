export interface AudioFeatures {
  bpm: number;
  key: string; // e.g., "C# minor"
  energy: 'low' | 'medium' | 'high';
  duration: number; // seconds
  instruments: string[];
  fingerprint?: string;
  harmonicKey: string; // Camelot
  loudness?: number;
  danceability?: number;
  valence?: number; // 0..1
  chroma?: number[]; // 12
}
