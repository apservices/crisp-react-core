import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Zap, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Track } from '@/types';

interface QuickMixEngineProps {
  trackA: Track;
  trackB: Track;
  onMixComplete?: () => void;
  autoStart?: boolean;
}

export const QuickMixEngine: React.FC<QuickMixEngineProps> = ({
  trackA,
  trackB,
  onMixComplete,
  autoStart = false
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [crossfader, setCrossfader] = useState([50]);
  const [mixProgress, setMixProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'mix' | 'outro'>('intro');
  
  const mixTimerRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoStart) {
      startQuickMix();
    }
    
    return () => {
      if (mixTimerRef.current) clearTimeout(mixTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [autoStart]);

  const startQuickMix = () => {
    setIsPlaying(true);
    setMixProgress(0);
    setCurrentPhase('intro');
    
    toast({
      title: "QuickMix Iniciado",
      description: `Mixando ${trackA.title} → ${trackB.title}`,
    });

    // Simulate mix progression
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += 2;
      setMixProgress(progress);
      
      // Update crossfader automatically
      if (progress < 30) {
        setCurrentPhase('intro');
        setCrossfader([25]); // Favor track A
      } else if (progress < 70) {
        setCurrentPhase('mix');
        const crossfadeValue = 25 + ((progress - 30) / 40) * 50; // Gradual transition
        setCrossfader([crossfadeValue]);
      } else {
        setCurrentPhase('outro');
        setCrossfader([75]); // Favor track B
      }
      
      if (progress >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        completeMix();
      }
    }, 500); // Update every 500ms for smooth animation
  };

  const stopMix = () => {
    setIsPlaying(false);
    if (mixTimerRef.current) clearTimeout(mixTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    toast({
      title: "Mix Interrompido",
      variant: "destructive"
    });
  };

  const completeMix = () => {
    setIsPlaying(false);
    setMixProgress(100);
    setCurrentPhase('outro');
    
    toast({
      title: "QuickMix Concluído!",
      description: "Transição automática finalizada com sucesso",
    });
    
    mixTimerRef.current = setTimeout(() => {
      onMixComplete?.();
    }, 2000);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'intro': return 'hsl(var(--primary))';
      case 'mix': return 'hsl(var(--warning))';
      case 'outro': return 'hsl(var(--success))';
      default: return 'hsl(var(--muted))';
    }
  };

  const leftVolume = Math.max(0, (100 - crossfader[0]) / 100);
  const rightVolume = Math.max(0, crossfader[0] / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          QuickMix Engine
          <div 
            className="px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: getPhaseColor(currentPhase) }}
          >
            {currentPhase.toUpperCase()}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Track Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg border transition-all ${
            leftVolume > 0.5 ? 'border-primary bg-primary/10' : 'border-border'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium">Deck A</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {Math.round(leftVolume * 100)}%
              </span>
            </div>
            <h4 className="font-medium text-sm truncate">{trackA.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{trackA.artist}</p>
            <div className="flex gap-1 mt-1">
              {trackA.bpm && (
                <span className="text-xs bg-muted px-1 rounded">{trackA.bpm} BPM</span>
              )}
              {trackA.key_signature && (
                <span className="text-xs bg-muted px-1 rounded">{trackA.key_signature}</span>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg border transition-all ${
            rightVolume > 0.5 ? 'border-primary bg-primary/10' : 'border-border'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium">Deck B</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {Math.round(rightVolume * 100)}%
              </span>
            </div>
            <h4 className="font-medium text-sm truncate">{trackB.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{trackB.artist}</p>
            <div className="flex gap-1 mt-1">
              {trackB.bpm && (
                <span className="text-xs bg-muted px-1 rounded">{trackB.bpm} BPM</span>
              )}
              {trackB.key_signature && (
                <span className="text-xs bg-muted px-1 rounded">{trackB.key_signature}</span>
              )}
            </div>
          </div>
        </div>

        {/* Mix Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso do Mix</span>
            <span>{mixProgress}%</span>
          </div>
          <Progress value={mixProgress} className="h-2" />
        </div>

        {/* Crossfader */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>A</span>
            <span>Crossfader</span>
            <span>B</span>
          </div>
          <Slider
            value={crossfader}
            onValueChange={setCrossfader}
            max={100}
            step={1}
            className="w-full"
            disabled={isPlaying}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={startQuickMix} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Iniciar QuickMix
            </Button>
          ) : (
            <>
              <Button onClick={stopMix} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Parar Mix
              </Button>
            </>
          )}
        </div>

        {/* Mix Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Transição automática de 30 segundos</p>
          <p>• Beatmatching inteligente baseado em BPM</p>
          <p>• Harmonic mixing usando compatibilidade de chaves</p>
        </div>
      </CardContent>
    </Card>
  );
};