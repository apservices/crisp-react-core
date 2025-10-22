import { useState } from 'react';
import type { AudioFeatures } from '@/lib/audio/types';

export interface TrackCompatibility {
  trackId: string;
  trackName: string;
  compatibilityScore: number;
  bpmDifference: number;
  keyCompatibility: 'perfect' | 'compatible' | 'caution' | 'clash';
  energyMatch: boolean;
  suggestedTransitions: TransitionSuggestion[];
  harmonicRelation: string;
}

export interface TransitionSuggestion {
  type: 'fade' | 'cut' | 'filter' | 'echo' | 'reverb';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timing: number; // seconds from end of current track
}

export interface MixSequence {
  tracks: string[];
  totalDuration: number;
  averageBPM: number;
  averageEnergy: 'low' | 'medium' | 'high';
  compatibilityScore: number;
  transitions: TransitionSuggestion[];
}

export const useHarmonyEngine = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTrackCompatibility = (
    sourceTrack: { id: string; name: string; features: AudioFeatures },
    candidateTracks: { id: string; name: string; features: AudioFeatures }[]
  ): TrackCompatibility[] => {
    return candidateTracks.map(candidate => {
      const compatibility = calculateCompatibility(sourceTrack.features, candidate.features);
      
      return {
        trackId: candidate.id,
        trackName: candidate.name,
        compatibilityScore: compatibility.score,
        bpmDifference: Math.abs(sourceTrack.features.bpm - candidate.features.bpm),
        keyCompatibility: compatibility.keyCompatibility,
        energyMatch: compatibility.energyMatch,
        suggestedTransitions: compatibility.transitions,
        harmonicRelation: compatibility.harmonicRelation
      };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  };

  const calculateCompatibility = (source: AudioFeatures, candidate: AudioFeatures) => {
    let score = 0;
    
    // BPM compatibility (40% weight)
    const bpmDiff = Math.abs(source.bpm - candidate.bpm);
    const bpmScore = Math.max(0, 100 - (bpmDiff * 2));
    score += bpmScore * 0.4;

    // Key compatibility (30% weight)
    const keyCompatibility = analyzeKeyCompatibility(source.harmonicKey, candidate.harmonicKey);
    score += keyCompatibility.score * 0.3;

    // Energy compatibility (20% weight)
    const energyMatch = analyzeEnergyCompatibility(source.energy, candidate.energy);
    score += energyMatch.score * 0.2;

    // Instrument/genre compatibility (10% weight)
    const instrumentMatch = analyzeInstrumentCompatibility(source.instruments, candidate.instruments);
    score += instrumentMatch * 0.1;

    const transitions = generateTransitionSuggestions(source, candidate, keyCompatibility.type);

    return {
      score: Math.round(score),
      keyCompatibility: keyCompatibility.type,
      energyMatch: energyMatch.match,
      transitions,
      harmonicRelation: keyCompatibility.relation
    };
  };

  const analyzeKeyCompatibility = (sourceKey: string, candidateKey: string) => {
    // Camelot Key compatibility rules
    const camelotCompatibility: { [key: string]: string[] } = {
      '1A': ['1A', '1B', '2A', '12A'], // Perfect, relative major, +1, -1
      '1B': ['1B', '1A', '2B', '12B'],
      '2A': ['2A', '2B', '3A', '1A'],
      '2B': ['2B', '2A', '3B', '1B'],
      '3A': ['3A', '3B', '4A', '2A'],
      '3B': ['3B', '3A', '4B', '2B'],
      '4A': ['4A', '4B', '5A', '3A'],
      '4B': ['4B', '4A', '5B', '3B'],
      '5A': ['5A', '5B', '6A', '4A'],
      '5B': ['5B', '5A', '6B', '4B'],
      '6A': ['6A', '6B', '7A', '5A'],
      '6B': ['6B', '6A', '7B', '5B'],
      '7A': ['7A', '7B', '8A', '6A'],
      '7B': ['7B', '7A', '8B', '6B'],
      '8A': ['8A', '8B', '9A', '7A'],
      '8B': ['8B', '8A', '9B', '7B'],
      '9A': ['9A', '9B', '10A', '8A'],
      '9B': ['9B', '9A', '10B', '8B'],
      '10A': ['10A', '10B', '11A', '9A'],
      '10B': ['10B', '10A', '11B', '9B'],
      '11A': ['11A', '11B', '12A', '10A'],
      '11B': ['11B', '11A', '12B', '10B'],
      '12A': ['12A', '12B', '1A', '11A'],
      '12B': ['12B', '12A', '1B', '11B']
    };

    const compatible = camelotCompatibility[sourceKey] || [];
    
    if (sourceKey === candidateKey) {
      return { score: 100, type: 'perfect' as const, relation: 'Same key' };
    } else if (compatible.includes(candidateKey)) {
      const index = compatible.indexOf(candidateKey);
      if (index === 1) return { score: 90, type: 'perfect' as const, relation: 'Relative major/minor' };
      if (index === 2 || index === 3) return { score: 80, type: 'compatible' as const, relation: 'Adjacent key' };
    }
    
    return { score: 30, type: 'caution' as const, relation: 'Distant key' };
  };

  const analyzeEnergyCompatibility = (sourceEnergy: string, candidateEnergy: string) => {
    const energyMap = { low: 1, medium: 2, high: 3 };
    const sourceLvl = energyMap[sourceEnergy as keyof typeof energyMap];
    const candidateLvl = energyMap[candidateEnergy as keyof typeof energyMap];
    
    const diff = Math.abs(sourceLvl - candidateLvl);
    
    if (diff === 0) return { score: 100, match: true };
    if (diff === 1) return { score: 70, match: true };
    return { score: 40, match: false };
  };

  const analyzeInstrumentCompatibility = (sourceInstruments: string[], candidateInstruments: string[]): number => {
    const commonInstruments = sourceInstruments.filter(inst => candidateInstruments.includes(inst));
    const totalInstruments = new Set([...sourceInstruments, ...candidateInstruments]).size;
    
    return (commonInstruments.length / totalInstruments) * 100;
  };

  const generateTransitionSuggestions = (
    source: AudioFeatures, 
    candidate: AudioFeatures,
    keyCompatibility: string
  ): TransitionSuggestion[] => {
    const suggestions: TransitionSuggestion[] = [];

    // BPM-based suggestions
    const bpmDiff = Math.abs(source.bpm - candidate.bpm);
    
    if (bpmDiff <= 5) {
      suggestions.push({
        type: 'cut',
        description: 'Corte seco no drop - BPMs quase idênticos',
        difficulty: 'easy',
        timing: 30
      });
    }

    if (bpmDiff <= 10) {
      suggestions.push({
        type: 'fade',
        description: 'Fade suave de 8 segundos',
        difficulty: 'easy',
        timing: 45
      });
    }

    // Key-based suggestions
    if (keyCompatibility === 'perfect') {
      suggestions.push({
        type: 'echo',
        description: 'Echo delay para transição harmônica perfeita',
        difficulty: 'medium',
        timing: 32
      });
    } else if (keyCompatibility === 'caution') {
      suggestions.push({
        type: 'filter',
        description: 'Low-pass filter para suavizar mudança de tom',
        difficulty: 'hard',
        timing: 60
      });
    }

    // Energy-based suggestions
    if (source.energy === 'high' && candidate.energy === 'low') {
      suggestions.push({
        type: 'reverb',
        description: 'Reverb crescente para transição de energia',
        difficulty: 'medium',
        timing: 40
      });
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  };

  const generateOptimalMixSequence = async (
    tracks: { id: string; name: string; features: AudioFeatures }[],
    startingTrackId?: string
  ): Promise<MixSequence> => {
    setIsAnalyzing(true);

    try {
      let orderedTracks = [...tracks];
      
      if (startingTrackId) {
        const startIndex = tracks.findIndex(t => t.id === startingTrackId);
        if (startIndex > -1) {
          orderedTracks = [tracks[startIndex], ...tracks.filter(t => t.id !== startingTrackId)];
        }
      }

      // Sort remaining tracks for optimal flow
      const optimizedSequence = optimizeTrackOrder(orderedTracks);
      
      const totalDuration = optimizedSequence.reduce((sum, track) => sum + track.features.duration, 0);
      const averageBPM = Math.round(
        optimizedSequence.reduce((sum, track) => sum + track.features.bpm, 0) / optimizedSequence.length
      );
      
      const energyValues = optimizedSequence.map(t => t.features.energy);
      const averageEnergy = calculateAverageEnergy(energyValues);
      
      const compatibilityScore = calculateSequenceCompatibility(optimizedSequence);
      const transitions = generateSequenceTransitions(optimizedSequence);

      return {
        tracks: optimizedSequence.map(t => t.id),
        totalDuration,
        averageBPM,
        averageEnergy,
        compatibilityScore,
        transitions
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeTrackOrder = (tracks: { id: string; name: string; features: AudioFeatures }[]) => {
    if (tracks.length <= 1) return tracks;

    const optimized = [tracks[0]];
    const remaining = tracks.slice(1);

    while (remaining.length > 0) {
      const current = optimized[optimized.length - 1];
      const compatibilities = analyzeTrackCompatibility(current, remaining);
      
      const bestMatch = compatibilities[0];
      const bestTrack = remaining.find(t => t.id === bestMatch.trackId);
      
      if (bestTrack) {
        optimized.push(bestTrack);
        remaining.splice(remaining.indexOf(bestTrack), 1);
      }
    }

    return optimized;
  };

  const calculateAverageEnergy = (energyValues: string[]): 'low' | 'medium' | 'high' => {
    const energyMap = { low: 1, medium: 2, high: 3 };
    const avg = energyValues.reduce((sum, energy) => sum + energyMap[energy as keyof typeof energyMap], 0) / energyValues.length;
    
    if (avg <= 1.5) return 'low';
    if (avg <= 2.5) return 'medium';
    return 'high';
  };

  const calculateSequenceCompatibility = (tracks: { features: AudioFeatures }[]): number => {
    if (tracks.length <= 1) return 100;

    let totalScore = 0;
    for (let i = 0; i < tracks.length - 1; i++) {
      const compatibility = calculateCompatibility(tracks[i].features, tracks[i + 1].features);
      totalScore += compatibility.score;
    }

    return Math.round(totalScore / (tracks.length - 1));
  };

  const generateSequenceTransitions = (tracks: { features: AudioFeatures }[]): TransitionSuggestion[] => {
    const transitions: TransitionSuggestion[] = [];

    for (let i = 0; i < tracks.length - 1; i++) {
      const suggestions = generateTransitionSuggestions(tracks[i].features, tracks[i + 1].features, 'compatible');
      if (suggestions.length > 0) {
        transitions.push(suggestions[0]); // Take the best suggestion for each transition
      }
    }

    return transitions;
  };

  return {
    analyzeTrackCompatibility,
    generateOptimalMixSequence,
    isAnalyzing
  };
};