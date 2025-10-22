import { useState } from 'react';
import { useTracks } from './useTracks';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TrackForMix {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key_signature: string | null;
  energy_level: number | null;
  duration: string;
}

interface MixSuggestion {
  track: TrackForMix;
  transitionType: 'fade' | 'cut' | 'filter';
  matchScore: number;
  reason: string;
}

interface QuickMixResult {
  tracks: MixSuggestion[];
  totalDuration: number;
  averageBpm: number;
  energyFlow: 'ascending' | 'descending' | 'wave';
}

export function useMixEngine() {
  const { tracks } = useTracks();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Algoritmo de compatibilidade musical
  const calculateCompatibility = (track1: TrackForMix, track2: TrackForMix): number => {
    let score = 0;

    // BPM compatibility (40% weight)
    if (track1.bpm && track2.bpm) {
      const bpmDiff = Math.abs(track1.bpm - track2.bpm);
      if (bpmDiff <= 5) score += 40;
      else if (bpmDiff <= 10) score += 30;
      else if (bpmDiff <= 20) score += 20;
      else score += 10;
    }

    // Key signature harmony (30% weight)
    if (track1.key_signature && track2.key_signature) {
      const harmonicKeys = getHarmonicKeys(track1.key_signature);
      if (harmonicKeys.includes(track2.key_signature)) {
        score += 30;
      } else if (track1.key_signature === track2.key_signature) {
        score += 25;
      } else {
        score += 10;
      }
    }

    // Energy level flow (30% weight)
    if (track1.energy_level && track2.energy_level) {
      const energyDiff = Math.abs(track1.energy_level - track2.energy_level);
      if (energyDiff <= 1) score += 30;
      else if (energyDiff <= 2) score += 20;
      else score += 10;
    }

    return score;
  };

  // Harmonic key matching (Camelot wheel)
  const getHarmonicKeys = (key: string): string[] => {
    const harmonicWheel: Record<string, string[]> = {
      '1A': ['1B', '2A', '12A'],
      '1B': ['1A', '2B', '12B'],
      '2A': ['1A', '2B', '3A'],
      '2B': ['1B', '2A', '3B'],
      // Simplified version - in real app would have full Camelot wheel
    };
    return harmonicWheel[key] || [];
  };

  // Determinar tipo de transição
  const getTransitionType = (track1: TrackForMix, track2: TrackForMix): 'fade' | 'cut' | 'filter' => {
    if (!track1.bpm || !track2.bpm) return 'fade';
    
    const bpmDiff = Math.abs(track1.bpm - track2.bpm);
    if (bpmDiff <= 2) return 'fade';
    if (bpmDiff <= 10) return 'filter';
    return 'cut';
  };

  // Converter duração de string para segundos
  const durationToSeconds = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
  };

  // Gerar Quick Mix
  const generateQuickMix = async (maxTracks: number = 4): Promise<QuickMixResult | null> => {
    setIsGenerating(true);
    
    try {
      // Filtrar tracks com metadados válidos
      const validTracks = tracks.filter(track => 
        track.bpm && track.bpm > 0
      ) as TrackForMix[];

      if (validTracks.length < 2) {
        toast({
          title: "Tracks insuficientes",
          description: "Precisa de pelo menos 2 tracks com BPM para criar um mix",
          variant: "destructive"
        });
        return null;
      }

      // Algoritmo de seleção inteligente
      const selectedTracks: MixSuggestion[] = [];
      const availableTracks = [...validTracks];
      
      // Primeira track (track com energia média)
      const sortedByEnergy = availableTracks.sort((a, b) => 
        (a.energy_level || 5) - (b.energy_level || 5)
      );
      const firstTrack = sortedByEnergy[Math.floor(sortedByEnergy.length / 2)];
      
      selectedTracks.push({
        track: firstTrack,
        transitionType: 'fade',
        matchScore: 100,
        reason: 'Track de abertura com energia equilibrada'
      });

      availableTracks.splice(availableTracks.indexOf(firstTrack), 1);

      // Selecionar próximas tracks baseado em compatibilidade
      let currentTrack = firstTrack;
      while (selectedTracks.length < maxTracks && availableTracks.length > 0) {
        let bestMatch: { track: TrackForMix; score: number } | null = null;
        
        for (const candidate of availableTracks) {
          const score = calculateCompatibility(currentTrack, candidate);
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { track: candidate, score };
          }
        }

        if (bestMatch) {
          const transitionType = getTransitionType(currentTrack, bestMatch.track);
          selectedTracks.push({
            track: bestMatch.track,
            transitionType,
            matchScore: bestMatch.score,
            reason: `${bestMatch.score >= 70 ? 'Excelente' : bestMatch.score >= 50 ? 'Boa' : 'Aceitável'} compatibilidade de BPM/Key`
          });
          
          availableTracks.splice(availableTracks.indexOf(bestMatch.track), 1);
          currentTrack = bestMatch.track;
        } else {
          break;
        }
      }

      // Calcular estatísticas do mix
      const totalDuration = selectedTracks.reduce((sum, item) => 
        sum + durationToSeconds(item.track.duration), 0
      );
      
      const averageBpm = selectedTracks.reduce((sum, item) => 
        sum + (item.track.bpm || 0), 0
      ) / selectedTracks.length;

      // Determinar fluxo de energia
      const energyLevels = selectedTracks.map(item => item.track.energy_level || 5);
      let energyFlow: 'ascending' | 'descending' | 'wave' = 'wave';
      
      if (energyLevels.every((level, i) => i === 0 || level >= energyLevels[i - 1])) {
        energyFlow = 'ascending';
      } else if (energyLevels.every((level, i) => i === 0 || level <= energyLevels[i - 1])) {
        energyFlow = 'descending';
      }

      toast({
        title: "Mix criado! 🎧",
        description: `${selectedTracks.length} tracks selecionadas com compatibilidade inteligente`
      });

      return {
        tracks: selectedTracks,
        totalDuration,
        averageBpm: Math.round(averageBpm),
        energyFlow
      };

    } catch (error) {
      console.error('Erro ao gerar mix:', error);
      toast({
        title: "Erro ao gerar mix",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Salvar mix como sessão DJ
  const saveMixAsSession = async (mixResult: QuickMixResult, sessionName: string) => {
    if (!user) return;

    try {
      const sessionData = {
        tracks: mixResult.tracks.map(item => ({
          track_id: item.track.id,
          title: item.track.title,
          artist: item.track.artist,
          transition_type: item.transitionType,
          match_score: item.matchScore
        })),
        average_bpm: mixResult.averageBpm,
        energy_flow: mixResult.energyFlow,
        generated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('dj_sessions')
        .insert({
          user_id: user.id,
          session_name: sessionName,
          duration: mixResult.totalDuration,
          tracks_mixed: mixResult.tracks.length,
          session_data: sessionData
        });

      if (error) throw error;

      toast({
        title: "Sessão salva! 💾",
        description: `"${sessionName}" foi adicionada ao seu histórico`
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      toast({
        title: "Erro ao salvar sessão",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    generateQuickMix,
    saveMixAsSession,
    isGenerating,
    availableTracksCount: tracks.filter(t => t.bpm && t.bpm > 0).length,
    totalTracksCount: tracks.length
  };
}