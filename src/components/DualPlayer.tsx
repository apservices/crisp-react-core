import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Upload, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  file: File;
  url: string;
}

const DualPlayer: React.FC = () => {
  const [leftTrack, setLeftTrack] = useState<Track | null>(null);
  const [rightTrack, setRightTrack] = useState<Track | null>(null);
  const [leftPlaying, setLeftPlaying] = useState(false);
  const [rightPlaying, setRightPlaying] = useState(false);
  const [leftVolume, setLeftVolume] = useState([80]);
  const [rightVolume, setRightVolume] = useState([80]);
  const [crossfader, setCrossfader] = useState([50]);
  
  const leftWaveRef = useRef<HTMLDivElement>(null);
  const rightWaveRef = useRef<HTMLDivElement>(null);
  const leftWavesurfer = useRef<WaveSurfer | null>(null);
  const rightWavesurfer = useRef<WaveSurfer | null>(null);

  // Initialize Wavesurfer instances
  useEffect(() => {
    if (leftWaveRef.current && !leftWavesurfer.current) {
      leftWavesurfer.current = WaveSurfer.create({
        container: leftWaveRef.current,
        waveColor: 'hsl(var(--primary) / 0.5)',
        progressColor: 'hsl(var(--primary))',
        cursorColor: 'hsl(var(--primary))',
        barWidth: 2,
        barRadius: 3,
        height: 80,
        normalize: true,
      });

      leftWavesurfer.current.on('finish', () => setLeftPlaying(false));
      leftWavesurfer.current.on('error', (err) => {
        console.error('Left player error:', err);
        toast.error('Erro ao carregar áudio no Deck A');
      });
    }

    if (rightWaveRef.current && !rightWavesurfer.current) {
      rightWavesurfer.current = WaveSurfer.create({
        container: rightWaveRef.current,
        waveColor: 'hsl(var(--primary) / 0.5)',
        progressColor: 'hsl(var(--primary))',
        cursorColor: 'hsl(var(--primary))',
        barWidth: 2,
        barRadius: 3,
        height: 80,
        normalize: true,
      });

      rightWavesurfer.current.on('finish', () => setRightPlaying(false));
      rightWavesurfer.current.on('error', (err) => {
        console.error('Right player error:', err);
        toast.error('Erro ao carregar áudio no Deck B');
      });
    }

    return () => {
      leftWavesurfer.current?.destroy();
      rightWavesurfer.current?.destroy();
    };
  }, []);

  // Update volumes based on individual controls and crossfader
  useEffect(() => {
    if (leftWavesurfer.current) {
      const crossfaderFactor = (100 - crossfader[0]) / 100;
      const finalVolume = (leftVolume[0] / 100) * crossfaderFactor;
      leftWavesurfer.current.setVolume(finalVolume);
    }
  }, [leftVolume, crossfader]);

  useEffect(() => {
    if (rightWavesurfer.current) {
      const crossfaderFactor = crossfader[0] / 100;
      const finalVolume = (rightVolume[0] / 100) * crossfaderFactor;
      rightWavesurfer.current.setVolume(finalVolume);
    }
  }, [rightVolume, crossfader]);

  const handleSelectTrack = (side: 'left' | 'right') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('audio/')) {
        toast.error('Por favor, selecione um arquivo de áudio válido');
        return;
      }

      const url = URL.createObjectURL(file);
      const track: Track = {
        id: `${Date.now()}-${file.name}`,
        title: file.name,
        file,
        url,
      };

      try {
        if (side === 'left') {
          setLeftTrack(track);
          await leftWavesurfer.current?.load(url);
          toast.success(`${file.name} carregado no Deck A`);
        } else {
          setRightTrack(track);
          await rightWavesurfer.current?.load(url);
          toast.success(`${file.name} carregado no Deck B`);
        }
      } catch (error) {
        console.error('Error loading track:', error);
        toast.error('Erro ao carregar faixa');
      }
    };
    input.click();
  };

  const togglePlay = (side: 'left' | 'right') => {
    const wavesurfer = side === 'left' ? leftWavesurfer.current : rightWavesurfer.current;
    const track = side === 'left' ? leftTrack : rightTrack;
    const isPlaying = side === 'left' ? leftPlaying : rightPlaying;
    const setPlaying = side === 'left' ? setLeftPlaying : setRightPlaying;

    if (!wavesurfer || !track) {
      toast.error(`Carregue uma faixa no Deck ${side === 'left' ? 'A' : 'B'} primeiro`);
      return;
    }

    wavesurfer.playPause();
    setPlaying(!isPlaying);
  };

  return (
    <div className="w-full space-y-6">
      {/* Decks Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deck A */}
        <div className="glass rounded-lg p-6 space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Deck A</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectTrack('left')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Carregar
            </Button>
          </div>

          {leftTrack ? (
            <>
              <div className="bg-muted/30 rounded p-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {leftTrack.title}
                </p>
              </div>
              <div ref={leftWaveRef} className="rounded overflow-hidden bg-background/50" />
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  variant={leftPlaying ? "secondary" : "default"}
                  onClick={() => togglePlay('left')}
                  className="w-full"
                >
                  {leftPlaying ? (
                    <><Pause className="mr-2" /> Pausar</>
                  ) : (
                    <><Play className="mr-2" /> Play</>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={leftVolume}
                    onValueChange={setLeftVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {leftVolume[0]}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Nenhuma faixa carregada</p>
            </div>
          )}
        </div>

        {/* Deck B */}
        <div className="glass rounded-lg p-6 space-y-4 border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Deck B</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectTrack('right')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Carregar
            </Button>
          </div>

          {rightTrack ? (
            <>
              <div className="bg-muted/30 rounded p-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {rightTrack.title}
                </p>
              </div>
              <div ref={rightWaveRef} className="rounded overflow-hidden bg-background/50" />
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  variant={rightPlaying ? "secondary" : "default"}
                  onClick={() => togglePlay('right')}
                  className="w-full"
                >
                  {rightPlaying ? (
                    <><Pause className="mr-2" /> Pausar</>
                  ) : (
                    <><Play className="mr-2" /> Play</>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={rightVolume}
                    onValueChange={setRightVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {rightVolume[0]}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Nenhuma faixa carregada</p>
            </div>
          )}
        </div>
      </div>

      {/* Crossfader */}
      <div className="glass rounded-lg p-6 border border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Crossfader</h3>
            <span className="text-sm text-muted-foreground">
              {crossfader[0] < 50 ? `Deck A ${100 - crossfader[0]}%` : crossfader[0] > 50 ? `Deck B ${crossfader[0]}%` : 'Centro'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-foreground">A</span>
            <Slider
              value={crossfader}
              onValueChange={setCrossfader}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs font-medium text-foreground">B</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualPlayer;