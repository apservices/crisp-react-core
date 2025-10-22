import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  Radio, 
  Gauge, 
  Key, 
  Volume2, 
  Zap, 
  Clock, 
  Target,
  Waves,
  Headphones
} from 'lucide-react';

interface TrackAnalysisProps {
  track: {
    id: string;
    title: string;
    artist: string;
    duration: string;
    bpm: number | null;
    genre: string | null;
    key_signature: string | null;
    energy_level: number | null;
  };
  analysis?: {
    spectralCentroid: number;
    spectralRolloff: number;
    zeroCrossingRate: number;
    mfcc: number[];
    harmonicContent: number;
    percussiveContent: number;
    tempo: 'slow' | 'medium' | 'fast';
    mood: 'chill' | 'energetic' | 'dark' | 'uplifting';
    instruments: string[];
    mixability: number;
    danceability: number;
  };
}

export const AdvancedTrackAnalysis: React.FC<TrackAnalysisProps> = ({ track, analysis }) => {
  // Simulated analysis data if not provided
  const defaultAnalysis = {
    spectralCentroid: Math.random() * 4000 + 1000,
    spectralRolloff: Math.random() * 8000 + 2000,
    zeroCrossingRate: Math.random() * 0.2 + 0.05,
    mfcc: Array.from({ length: 13 }, () => Math.random() * 20 - 10),
    harmonicContent: Math.random() * 0.8 + 0.2,
    percussiveContent: Math.random() * 0.8 + 0.2,
    tempo: ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)] as 'slow' | 'medium' | 'fast',
    mood: ['chill', 'energetic', 'dark', 'uplifting'][Math.floor(Math.random() * 4)] as 'chill' | 'energetic' | 'dark' | 'uplifting',
    instruments: ['vocals', 'lead_synth', 'bass', 'drums', 'pad', 'arp'].filter(() => Math.random() > 0.5),
    mixability: Math.floor(Math.random() * 40) + 60,
    danceability: Math.floor(Math.random() * 40) + 50,
  };

  const analysisData = analysis || defaultAnalysis;

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'energetic': return 'text-neon-teal border-neon-teal/30';
      case 'chill': return 'text-neon-blue border-neon-blue/30';
      case 'dark': return 'text-purple-400 border-purple-400/30';
      case 'uplifting': return 'text-neon-green border-neon-green/30';
      default: return 'text-muted-foreground border-muted/30';
    }
  };

  const getTempoColor = (tempo: string) => {
    switch (tempo) {
      case 'fast': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'slow': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-heading-lg text-foreground">{track.title}</h3>
        <p className="text-muted-foreground">{track.artist}</p>
      </div>

      {/* Basic Info */}
      <Card className="glass border-glass-border p-6">
        <h4 className="text-heading-sm text-foreground mb-4 flex items-center gap-2">
          <Music className="h-4 w-4 text-neon-blue" />
          Informações Básicas
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">BPM</span>
              <Badge variant="outline" className="text-neon-green border-neon-green/30">
                {track.bpm || 'N/A'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duração</span>
              <span className="text-sm font-medium text-foreground">{track.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gênero</span>
              <Badge variant="outline" className="text-neon-violet border-neon-violet/30">
                {track.genre || 'N/A'}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tom</span>
              <Badge variant="outline" className="text-neon-teal border-neon-teal/30">
                {track.key_signature || 'N/A'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Energia</span>
              <div className="flex items-center gap-2">
                <Progress value={track.energy_level || 50} className="w-16" />
                <span className="text-xs text-muted-foreground">{track.energy_level || 'N/A'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mood</span>
              <Badge variant="outline" className={getMoodColor(analysisData.mood)}>
                {analysisData.mood}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Audio Features */}
      <Card className="glass border-glass-border p-6">
        <h4 className="text-heading-sm text-foreground mb-4 flex items-center gap-2">
          <Waves className="h-4 w-4 text-neon-violet" />
          Características Espectrais
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Centroide Espectral</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={(analysisData.spectralCentroid / 5000) * 100} className="w-24" />
              <span className="text-xs text-muted-foreground w-12">
                {Math.round(analysisData.spectralCentroid)}Hz
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Conteúdo Harmônico</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={analysisData.harmonicContent * 100} className="w-24" />
              <span className="text-xs text-muted-foreground w-12">
                {Math.round(analysisData.harmonicContent * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Conteúdo Percussivo</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={analysisData.percussiveContent * 100} className="w-24" />
              <span className="text-xs text-muted-foreground w-12">
                {Math.round(analysisData.percussiveContent * 100)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Mix Properties */}
      <Card className="glass border-glass-border p-6">
        <h4 className="text-heading-sm text-foreground mb-4 flex items-center gap-2">
          <Headphones className="h-4 w-4 text-neon-teal" />
          Propriedades de Mix
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mixabilidade</span>
            <div className="flex items-center gap-2">
              <Progress value={analysisData.mixability} className="w-24" />
              <Badge 
                variant="outline" 
                className={analysisData.mixability > 80 ? 'text-neon-green border-neon-green/30' : 
                          analysisData.mixability > 60 ? 'text-yellow-400 border-yellow-400/30' : 
                          'text-red-400 border-red-400/30'}
              >
                {analysisData.mixability}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Danceability</span>
            <div className="flex items-center gap-2">
              <Progress value={analysisData.danceability} className="w-24" />
              <Badge 
                variant="outline" 
                className={analysisData.danceability > 75 ? 'text-neon-teal border-neon-teal/30' : 
                          analysisData.danceability > 50 ? 'text-yellow-400 border-yellow-400/30' : 
                          'text-blue-400 border-blue-400/30'}
              >
                {analysisData.danceability}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Classificação de Tempo</span>
            <Badge variant="outline" className={getTempoColor(analysisData.tempo)}>
              {analysisData.tempo}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Detected Instruments */}
      <Card className="glass border-glass-border p-6">
        <h4 className="text-heading-sm text-foreground mb-4 flex items-center gap-2">
          <Key className="h-4 w-4 text-neon-green" />
          Instrumentos Detectados
        </h4>
        <div className="flex flex-wrap gap-2">
          {analysisData.instruments.map((instrument, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-muted-foreground border-muted/30 hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {instrument.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </Card>

      {/* MFCC Visualization */}
      <Card className="glass border-glass-border p-6">
        <h4 className="text-heading-sm text-foreground mb-4 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-neon-blue" />
          Perfil Tímbrico (MFCC)
        </h4>
        <div className="space-y-2">
          {analysisData.mfcc.slice(0, 8).map((coefficient, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">MFCC {index + 1}</span>
              <div className="flex-1 h-2 bg-muted rounded-full relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-blue to-neon-violet rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.abs(coefficient / 20) * 100}%`,
                    marginLeft: coefficient < 0 ? `${50 + (coefficient / 20) * 50}%` : '50%'
                  }}
                />
                <div className="absolute top-0 left-1/2 w-px h-full bg-border" />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {coefficient.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};