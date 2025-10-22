import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Shuffle, 
  TrendingUp, 
  Music, 
  Play, 
  Plus,
  Zap,
  Target,
  Clock,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMixCompatibility } from '@/lib/audio/compat';
import { mixAudioTracks } from '@/utils/dualAudio';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number | null;
  genre: string | null;
  key_signature: string | null;
  energy_level: number | null;
  file_url?: string | null;
}

interface MixSuggestion {
  id: string;
  sourceTrack: Track;
  suggestedTrack: Track;
  compatibility: number;
  reasons: string[];
  transitionType: 'fade' | 'cut' | 'filter' | 'beatmatch';
  confidence: number;
  mixPoint: number; // percentage of source track
}

interface SmartMixSuggestionsProps {
  currentTrack?: Track;
  availableTracks: Track[];
  onSelectTrack?: (track: Track) => void;
  onAddToMix?: (suggestion: MixSuggestion) => void;
  className?: string;
}

export const SmartMixSuggestions: React.FC<SmartMixSuggestionsProps> = ({
  currentTrack,
  availableTracks,
  onSelectTrack,
  onAddToMix,
  className
}) => {
  const [suggestions, setSuggestions] = useState<MixSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickMixUrls, setQuickMixUrls] = useState<Record<string, string>>({});

  // Generate smart suggestions based on current track
  useEffect(() => {
    if (currentTrack && availableTracks.length > 0) {
      generateSuggestions();
    }
  }, [currentTrack, availableTracks]);

  const generateSuggestions = async () => {
    if (!currentTrack) return;
    
    setLoading(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions: MixSuggestion[] = availableTracks
      .filter(track => track.id !== currentTrack.id)
      .map(track => {
        const compatibility = calculateCompatibility(currentTrack, track);
        const reasons = generateReasons(currentTrack, track);
        const transitionType = getTransitionType(currentTrack, track);
        const confidence = calculateConfidence(currentTrack, track);
        const mixPoint = calculateOptimalMixPoint(currentTrack, track);
        
        return {
          id: `${currentTrack.id}-${track.id}`,
          sourceTrack: currentTrack,
          suggestedTrack: track,
          compatibility,
          reasons,
          transitionType,
          confidence,
          mixPoint
        };
      })
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 5); // Top 5 suggestions
    
    setSuggestions(suggestions);
    setLoading(false);
  };

  const calculateCompatibility = (track1: Track, track2: Track): number => {
    const { score } = getMixCompatibility(track1 as any, track2 as any);
    return score;
  };

  const generateReasons = (track1: Track, track2: Track): string[] => {
    const reasons: string[] = [];
    
    if (track1.bpm && track2.bpm) {
      const bpmDiff = Math.abs(track1.bpm - track2.bpm);
      if (bpmDiff <= 2) reasons.push('BPM quase idêntico - mix perfeito');
      else if (bpmDiff <= 5) reasons.push('BPM compatível para transição suave');
    }
    
    if (track1.key_signature && track2.key_signature) {
      const harmonicKeys = getHarmonicKeys(track1.key_signature);
      if (harmonicKeys.includes(track2.key_signature)) {
        reasons.push('Tonalidades harmonicamente compatíveis');
      }
    }
    
    if (track1.genre === track2.genre) {
      reasons.push('Mesmo gênero musical');
    }
    
    if (track1.energy_level && track2.energy_level) {
      const energyDiff = track2.energy_level - track1.energy_level;
      if (energyDiff > 1) reasons.push('Aumenta a energia do set');
      else if (energyDiff < -1) reasons.push('Diminui a energia suavemente');
      else reasons.push('Mantém o nível de energia');
    }
    
    // Add some AI-generated reasons
    const aiReasons = [
      'Estrutura musical similar',
      'Elementos percussivos compatíveis',
      'Progressão harmônica fluida',
      'Timing ideal para crowd response'
    ];
    
    if (reasons.length < 3) {
      reasons.push(aiReasons[Math.floor(Math.random() * aiReasons.length)]);
    }
    
    return reasons;
  };

  const getTransitionType = (track1: Track, track2: Track): 'fade' | 'cut' | 'filter' | 'beatmatch' => {
    if (!track1.bpm || !track2.bpm) return 'fade';
    
    const bpmDiff = Math.abs(track1.bpm - track2.bpm);
    
    if (bpmDiff <= 2) return 'beatmatch';
    if (bpmDiff <= 5) return 'filter';
    if (bpmDiff <= 10) return 'fade';
    return 'cut';
  };

  const calculateConfidence = (track1: Track, track2: Track): number => {
    let confidence = 60;
    
    if (track1.bpm && track2.bpm) confidence += 15;
    if (track1.key_signature && track2.key_signature) confidence += 15;
    if (track1.genre && track2.genre) confidence += 10;
    
    return Math.min(100, confidence);
  };

  const calculateOptimalMixPoint = (track1: Track, track2: Track): number => {
    // Simulate AI-calculated optimal mix point
    return Math.floor(Math.random() * 30) + 60; // Between 60-90%
  };

  const getHarmonicKeys = (key: string): string[] => {
    const harmonicMap: Record<string, string[]> = {
      'C maj': ['A min', 'F maj', 'G maj'],
      'G maj': ['E min', 'C maj', 'D maj'],
      'D maj': ['B min', 'G maj', 'A maj'],
      'A maj': ['F# min', 'D maj', 'E maj'],
      'A min': ['C maj', 'F maj', 'D min'],
      'E min': ['G maj', 'C maj', 'B min']
    };
    return harmonicMap[key] || [];
  };

  const getCompatibleGenres = (genre: string): string[] => {
    const genreMap: Record<string, string[]> = {
      'house': ['tech house', 'deep house', 'progressive house'],
      'techno': ['tech house', 'minimal techno', 'progressive techno'],
      'trance': ['progressive trance', 'uplifting trance', 'tech trance']
    };
    return genreMap[genre.toLowerCase()] || [];
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-neon-green border-neon-green/30';
    if (score >= 60) return 'text-yellow-400 border-yellow-400/30';
    return 'text-red-400 border-red-400/30';
  };

  const getTransitionIcon = (type: string) => {
    switch (type) {
      case 'beatmatch': return <Target className="h-3 w-3" />;
      case 'filter': return <Zap className="h-3 w-3" />;
      case 'fade': return <TrendingUp className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (!currentTrack) {
    return (
      <Card className={cn("glass border-glass-border p-8 text-center", className)}>
        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-heading-sm text-foreground mb-2">
          Selecione uma faixa para ver sugestões
        </h3>
        <p className="text-muted-foreground">
          Escolha uma música para que a IA analise e sugira as melhores opções de mixagem
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card className="glass border-glass-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-heading-sm text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-neon-teal" />
              Sugestões Inteligentes
            </h3>
            <p className="text-sm text-muted-foreground">
              Baseado em: <span className="text-foreground font-medium">{currentTrack.title}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {loading ? 'Analisando...' : 'Atualizar'}
          </Button>
        </div>
      </Card>

      {/* Suggestions */}
      {loading ? (
        <Card className="glass border-glass-border p-8 text-center">
          <div className="animate-pulse space-y-4">
            <Brain className="h-8 w-8 text-neon-teal mx-auto animate-glow" />
            <div className="space-y-2">
              <div className="h-4 bg-primary/20 rounded w-48 mx-auto" />
              <div className="h-3 bg-muted rounded w-32 mx-auto" />
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <Card key={suggestion.id} className="glass border-glass-border p-4">
              <div className="space-y-3">
                {/* Track Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {suggestion.suggestedTrack.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {suggestion.suggestedTrack.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {suggestion.suggestedTrack.bpm && (
                        <Badge variant="outline" className="text-neon-blue border-neon-blue/30">
                          {suggestion.suggestedTrack.bpm} BPM
                        </Badge>
                      )}
                      {suggestion.suggestedTrack.key_signature && (
                        <Badge variant="outline" className="text-neon-violet border-neon-violet/30">
                          {suggestion.suggestedTrack.key_signature}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <Badge 
                      variant="outline" 
                      className={getCompatibilityColor(suggestion.compatibility)}
                    >
                      {suggestion.compatibility}% match
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getTransitionIcon(suggestion.transitionType)}
                      <span className="capitalize">{suggestion.transitionType}</span>
                    </div>
                  </div>
                </div>

                {/* Compatibility Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Compatibilidade</span>
                    <span className="text-foreground">{suggestion.compatibility}%</span>
                  </div>
                  <Progress value={suggestion.compatibility} className="h-2" />
                </div>

                {/* Reasons */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-foreground">Por que funciona:</h5>
                  <div className="space-y-1">
                    {suggestion.reasons.map((reason, reasonIndex) => (
                      <div key={reasonIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-neon-teal rounded-full mt-2 flex-shrink-0" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-glass-border" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Mix point: {suggestion.mixPoint}% • Confiança: {suggestion.confidence}%
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTrack?.(suggestion.suggestedTrack)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => onAddToMix?.(suggestion)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar ao Mix
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !loading && (
        <Card className="glass border-glass-border p-8 text-center">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-heading-sm text-foreground mb-2">
            Nenhuma sugestão encontrada
          </h3>
          <p className="text-muted-foreground">
            Adicione mais faixas à sua biblioteca para obter sugestões de mixagem
          </p>
        </Card>
      )}
    </div>
  );
};