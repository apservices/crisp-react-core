
export interface AudioMetadata {
  duration: string;
  bpm?: number;
  key?: string;
  genre?: string;
  energy?: number;
  waveformData?: number[];
  instruments?: string[];
  tempo?: 'slow' | 'medium' | 'fast';
  mood?: 'chill' | 'energetic' | 'dark' | 'uplifting';
}

export const extractAudioMetadata = async (file: File): Promise<AudioMetadata> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      
      // Enhanced waveform simulation (in production, use Web Audio API)
      const waveformData = Array.from({ length: 200 }, (_, i) => {
        // Create more realistic waveform with peaks and valleys
        const baseValue = Math.sin(i * 0.05) * 0.3 + 0.5;
        const noise = (Math.random() - 0.5) * 0.4;
        const peaks = Math.sin(i * 0.2) > 0.7 ? 0.3 : 0;
        return Math.max(0.1, Math.min(1, baseValue + noise + peaks));
      });
      
      // Enhanced BPM detection simulation
      const bpmRanges = {
        downtempo: [60, 90],
        house: [120, 130],
        techno: [120, 140],
        trance: [130, 150],
        dubstep: [140, 180],
        drum_and_bass: [160, 180]
      };
      
      const genres = Object.keys(bpmRanges);
      const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
      const [minBpm, maxBpm] = bpmRanges[selectedGenre as keyof typeof bpmRanges];
      const estimatedBPM = Math.floor(Math.random() * (maxBpm - minBpm) + minBpm);
      
      // Enhanced key detection with circle of fifths
      const keys = [
        'C maj', 'G maj', 'D maj', 'A maj', 'E maj', 'B maj', 'F# maj',
        'C# maj', 'Ab maj', 'Eb maj', 'Bb maj', 'F maj',
        'A min', 'E min', 'B min', 'F# min', 'C# min', 'G# min',
        'D# min', 'Bb min', 'F min', 'C min', 'G min', 'D min'
      ];
      const estimatedKey = keys[Math.floor(Math.random() * keys.length)];
      
      // Energy level based on BPM and genre characteristics
      let estimatedEnergy: number;
      if (estimatedBPM < 100) estimatedEnergy = Math.floor(Math.random() * 4) + 1; // 1-4
      else if (estimatedBPM < 130) estimatedEnergy = Math.floor(Math.random() * 4) + 4; // 4-7
      else estimatedEnergy = Math.floor(Math.random() * 3) + 7; // 7-10
      
      // Instrument detection simulation
      const possibleInstruments = [
        'vocals', 'lead_synth', 'bass', 'drums', 'kick', 'snare', 'hi_hat',
        'pad', 'arp', 'pluck', 'fx', 'strings', 'piano', 'guitar'
      ];
      const numInstruments = Math.floor(Math.random() * 6) + 3; // 3-8 instruments
      const instruments = possibleInstruments
        .sort(() => Math.random() - 0.5)
        .slice(0, numInstruments);
      
      // Tempo classification
      let tempo: 'slow' | 'medium' | 'fast';
      if (estimatedBPM < 100) tempo = 'slow';
      else if (estimatedBPM < 140) tempo = 'medium';
      else tempo = 'fast';
      
      // Mood detection based on key and energy
      const moods: Array<'chill' | 'energetic' | 'dark' | 'uplifting'> = ['chill', 'energetic', 'dark', 'uplifting'];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      
      resolve({
        duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        bpm: estimatedBPM,
        key: estimatedKey,
        genre: selectedGenre.replace('_', ' '),
        energy: estimatedEnergy,
        waveformData,
        instruments,
        tempo,
        mood
      });
      
      URL.revokeObjectURL(url);
    });
    
    audio.src = url;
  });
};

export const analyzeHarmony = (key: string, bpm: number) => {
  const harmonicKeys = {
    'C maj': ['A min', 'F maj', 'G maj'],
    'G maj': ['E min', 'C maj', 'D maj'],
    'D maj': ['B min', 'G maj', 'A maj'],
    'A maj': ['F# min', 'D maj', 'E maj'],
    'E maj': ['C# min', 'A maj', 'B maj'],
    'B maj': ['G# min', 'E maj', 'F# maj'],
    'F# maj': ['D# min', 'B maj', 'C# maj'],
    'A min': ['C maj', 'F maj', 'D min'],
    'E min': ['G maj', 'C maj', 'B min'],
    'B min': ['D maj', 'G maj', 'F# min'],
    'F# min': ['A maj', 'D maj', 'C# min'],
    'C# min': ['E maj', 'A maj', 'G# min'],
    'G# min': ['B maj', 'E maj', 'D# min'],
    'D# min': ['F# maj', 'B maj', 'Bb min'],
  };
  
  return {
    compatibleKeys: (harmonicKeys as any)[key] || [],
    bpmRange: [bpm - 5, bpm + 5],
    mixSuggestion: bpm > 130 ? 'High energy transition' : 'Smooth blend'
  };
};
