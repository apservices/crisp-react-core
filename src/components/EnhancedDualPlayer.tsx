import React, { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Play, Pause, Upload, Volume2, Rewind, FastForward, ChevronLeft, ChevronRight, Wand2, Music2, Settings } from "lucide-react";
import bpmDetective from "bpm-detective";
import { extractAudioMetadata, analyzeHarmony } from "@/utils/audioMetadata";
import { CueControls } from "@/components/dj/CueControls";
import { LoopControls } from "@/components/dj/LoopControls";
import { MixPointSuggest } from "@/components/dj/MixPointSuggest";
import { WaveformGrid } from "@/components/dj/WaveformGrid";
import { EnhancedTrackLibrary } from "@/components/dj/EnhancedTrackLibrary";
import { QuickMixEngine } from "@/components/dj/QuickMixEngine";
import { DeckProvider, useDecks } from "@/store/decks";
import { loadCuePoints, loadLoopRanges } from "@/lib/djTools";
import { isFeatureEnabled, ExperimentalAudioProcessor } from "@/lib/experimentalFeatures";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/utils/storage";
import type { Track } from "@/types";

interface DeckState {
  file?: File;
  url?: string;
  title?: string;
  bpm?: number | null;
  key?: string | null;
  keyShift?: number; // simulated semitone shift
  rate?: number; // BPM sync base playback rate
  ws?: WaveSurfer | null;
  volume: number; // 0..1
  isReady: boolean;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function DualPlayerInner() {
  const leftContainer = useRef<HTMLDivElement>(null);
  const rightContainer = useRef<HTMLDivElement>(null);

  const [left, setLeft] = useState<DeckState>({ volume: 0.9, isReady: false });
  const [right, setRight] = useState<DeckState>({ volume: 0.9, isReady: false });
  const [crossfader, setCrossfader] = useState(0.5); // 0 left .. 1 right
  const [isPlaying, setIsPlaying] = useState(false);

  // Compute equal-power volumes from crossfader
  const { leftGain, rightGain } = useMemo(() => {
    // equal-power curve
    const l = Math.cos(crossfader * Math.PI / 2) ** 2;
    const r = Math.sin(crossfader * Math.PI / 2) ** 2;
    return { leftGain: l, rightGain: r };
  }, [crossfader]);

  useEffect(() => {
    left.ws?.setVolume((left.volume ?? 1) * leftGain);
    right.ws?.setVolume((right.volume ?? 1) * rightGain);
  }, [leftGain, rightGain, left.volume, right.volume, left.ws, right.ws]);

  // Apply playback rate combining BPM Sync (rate) and KeyShift semitone rate
  useEffect(() => {
    const semitoneRate = Math.pow(2, ((right.keyShift ?? 0) / 12));
    const baseRate = right.rate ?? 1;
    const final = Math.max(0.5, Math.min(2.0, baseRate * semitoneRate));
    if (right.ws) right.ws.setPlaybackRate(final);
  }, [right.keyShift, right.rate, right.ws]);

  const { toast } = useToast();

  const loadFileToDeck = async (side: "left" | "right") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = async (e: any) => {
      const file = e.target.files[0] as File;
      if (!file) return;

      try {
        // Get user for authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to load tracks",
            variant: "destructive"
          });
          return;
        }

        // Upload file to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `dj-session/${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tracks')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get signed URL for playback
        const signedUrl = await getSignedUrl('tracks', fileName);

        // Build wavesurfer instance
        const container = side === "left" ? leftContainer.current : rightContainer.current;
        if (!container) return;

        const root = getComputedStyle(document.documentElement);
        const waveColor = `hsl(${root.getPropertyValue('--muted').trim()})`;
        const progressColor = `hsl(${root.getPropertyValue('--primary').trim()})`;
        const cursorColor = `hsl(${root.getPropertyValue('--neon-teal').trim()})`;

        const ws = WaveSurfer.create({
          container,
          height: 80,
          waveColor,
          progressColor,
          cursorColor,
          normalize: true,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
        });

        ws.on('ready', () => {
          if (side === 'left') {
            setLeft((prev) => ({ ...prev, isReady: true }));
          } else {
            setRight((prev) => ({ ...prev, isReady: true }));
          }
        });

        // Load from signed URL instead of blob
        ws.load(signedUrl);

        // Analyze BPM with validation
        try {
          const arrayBuffer = await file.arrayBuffer();
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          
          // Validate audio data before BPM analysis
          const channelData = audioBuffer.getChannelData(0);
          if (!channelData || channelData.length === 0) {
            throw new Error('Invalid audio data');
          }

          // Check for non-finite values
          const hasValidData = Array.from(channelData).some((sample: number) => 
            isFinite(sample) && !isNaN(sample)
          );
          
          if (!hasValidData) {
            throw new Error('Audio contains no valid data');
          }

          const bpm = Math.round(bpmDetective(channelData));
          
          // Validate BPM result
          const validBpm = isFinite(bpm) && !isNaN(bpm) && bpm > 0 ? bpm : null;
          
          // Lightweight metadata for key (simulated)
          const meta = await extractAudioMetadata(file);
          const detectedKey = meta.key ?? null;

          const deckUpdate: Partial<DeckState> = { 
            file, 
            url: signedUrl, 
            title: file.name, 
            bpm: validBpm, 
            key: detectedKey, 
            ws 
          };
          
          if (side === "left") setLeft((p) => ({ ...p, ...deckUpdate } as DeckState));
          else setRight((p) => ({ ...p, ...deckUpdate } as DeckState));

          toast({
            title: "Track Loaded",
            description: `${file.name} loaded successfully${validBpm ? ` at ${validBpm} BPM` : ''}`
          });

        } catch (analysisError) {
          console.error('Audio analysis error:', analysisError);
          
          // Still load the track even if analysis fails
          const deckUpdate: Partial<DeckState> = { 
            file, 
            url: signedUrl, 
            title: file.name, 
            bpm: null, 
            key: null, 
            ws 
          };
          
          if (side === "left") setLeft((p) => ({ ...p, ...deckUpdate } as DeckState));
          else setRight((p) => ({ ...p, ...deckUpdate } as DeckState));

          toast({
            title: "Track Loaded",
            description: `${file.name} loaded (analysis failed)`
          });
        }

      } catch (error) {
        console.error('File loading error:', error);
        toast({
          title: "Loading Failed",
          description: error instanceof Error ? error.message : "Failed to load track",
          variant: "destructive"
        });
      }
    };
    input.click();
  };

  const togglePlay = () => {
    if (left.ws) left.ws.playPause();
    if (right.ws) right.ws.playPause();
    setIsPlaying((p) => !p);
  };

  const nudge = (side: 'left' | 'right', seconds: number) => {
    const ws = side === 'left' ? left.ws : right.ws;
    if (!ws) return;
    const dur = ws.getDuration();
    const pos = ws.getCurrentTime();
    const next = Math.max(0, Math.min(dur, pos + seconds));
    ws.setTime(next);
  };

  // Indicators and Key/BPM Sync helpers
  const bpmDelta = useMemo(() => {
    if (!left.bpm || !right.bpm || typeof left.bpm !== 'number' || typeof right.bpm !== 'number') return null;
    return Math.abs(left.bpm - right.bpm);
  }, [left.bpm, right.bpm]);

  const keyStatus = useMemo(() => {
    if (!left.key || !right.key) return null;
    if (left.key === right.key) return 'match';
    const bpmValue = (left.bpm && typeof left.bpm === 'number') ? left.bpm : 
                     (right.bpm && typeof right.bpm === 'number') ? right.bpm : 120;
    const { compatibleKeys } = analyzeHarmony(left.key, bpmValue);
    return compatibleKeys.includes(right.key) ? 'compatible' : 'clash';
  }, [left.key, right.key, left.bpm, right.bpm]);

  const bpmVariant = (bpmDelta == null) ? 'outline' : bpmDelta <= 2 ? 'default' : bpmDelta <= 6 ? 'secondary' : 'destructive';
  const keyVariant = keyStatus === 'match' ? 'default' : keyStatus === 'compatible' ? 'secondary' : 'destructive';

  const chroma = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const getRoot = (k: string) => k.split(' ')[0];
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const semitoneDiff = (target: string, current: string) => {
    const a = chroma.indexOf(getRoot(target));
    const b = chroma.indexOf(getRoot(current));
    if (a < 0 || b < 0) return 0;
    let d = a - b;
    d = ((d + 6) % 12) - 6; // minimal signed distance
    return d;
  };

  const handleKeySync = () => {
    if (!left.key || !right.key) return;
    const diff = semitoneDiff(left.key, right.key);
    setRight((p) => ({ ...p, key: left.key || p.key, keyShift: diff }));
  };

  const handleBpmSync = () => {
    if (!left.bpm || !right.bpm || typeof left.bpm !== 'number' || typeof right.bpm !== 'number') return;
    const ratio = left.bpm / right.bpm;
    setRight((p) => ({ ...p, rate: ratio }));
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-heading-xl">Dual Player</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => loadFileToDeck('left')} className="gap-2"><Upload className="h-4 w-4"/> Carregar A</Button>
          <Button variant="secondary" onClick={() => loadFileToDeck('right')} className="gap-2"><Upload className="h-4 w-4"/> Carregar B</Button>
        </div>
      </header>

      <Card className="glass">
        <CardContent className="pt-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" onClick={togglePlay} className="gap-2">
              {isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
              {isPlaying ? 'Pausar' : 'Tocar ambos'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleKeySync} className="gap-2"><Wand2 className="h-4 w-4"/>Key Sync</Button>
            <Button variant="outline" size="sm" onClick={handleBpmSync} className="gap-2"><Wand2 className="h-4 w-4"/>BPM Sync</Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Music2 className="h-4 w-4"/>
              Key Shift
              <div className="flex items-center ml-1">
                <Button variant="outline" size="sm" className="px-2" onClick={() => setRight(p => ({ ...p, keyShift: clamp((p.keyShift ?? 0) - 1, -6, 6) }))}>-</Button>
                <div className="px-2 text-foreground/80">{right.keyShift ? (right.keyShift > 0 ? `+${right.keyShift}` : right.keyShift) : 0} st</div>
                <Button variant="outline" size="sm" className="px-2 ml-1" onClick={() => setRight(p => ({ ...p, keyShift: clamp((p.keyShift ?? 0) + 1, -6, 6) }))}>+</Button>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Badge variant={bpmVariant as any}>{bpmDelta == null ? 'Δ BPM —' : `Δ BPM ${bpmDelta}`}</Badge>
              <Badge variant={keyStatus == null ? 'outline' : keyVariant as any}>{keyStatus == null ? 'Key —' : keyStatus === 'clash' ? 'Key clash' : 'Key OK'}</Badge>
            </div>
          </div>

          {/* Decks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Deck */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{left.title || 'Deck A'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="outline">{left.bpm ? `${left.bpm} BPM` : '—'}</Badge>
                    <Badge variant="secondary">{left.key || 'Key —'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => nudge('left', -2)}><Rewind className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => nudge('left', 2)}><FastForward className="h-4 w-4"/></Button>
                </div>
              </div>
              <div ref={leftContainer} className="h-24 rounded-lg glass"/>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground"/>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={left.volume}
                  onChange={(e) => setLeft((p) => ({ ...p, volume: Number(e.target.value) }))}
                  className="w-40 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              {/* DJ Tools for Left Deck */}
              <div className="border-t pt-3 space-y-2">
                <CueControls 
                  deck="A" 
                  trackId={left.title} 
                  currentMs={left.ws?.getCurrentTime() * 1000 || 0}
                />
                <LoopControls 
                  deck="A" 
                  trackId={left.title}
                  currentMs={left.ws?.getCurrentTime() * 1000 || 0}
                />
                <MixPointSuggest 
                  trackId={left.title}
                  onSuggest={(ms) => left.ws?.seekTo(ms / 1000 / (left.ws?.getDuration() || 1))}
                />
              </div>
            </div>

            {/* Right Deck */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{right.title || 'Deck B'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="outline">{right.bpm ? `${right.bpm} BPM` : '—'}</Badge>
                    <Badge variant="secondary">{right.key || 'Key —'}</Badge>
                    <Badge variant="outline">{(right.rate ?? 1).toFixed(2)}x</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => nudge('right', -2)}><Rewind className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => nudge('right', 2)}><FastForward className="h-4 w-4"/></Button>
                </div>
              </div>
              <div ref={rightContainer} className="h-24 rounded-lg glass"/>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground"/>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={right.volume}
                  onChange={(e) => setRight((p) => ({ ...p, volume: Number(e.target.value) }))}
                  className="w-40 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              {/* DJ Tools for Right Deck */}
              <div className="border-t pt-3 space-y-2">
                <CueControls 
                  deck="B" 
                  trackId={right.title} 
                  currentMs={right.ws?.getCurrentTime() * 1000 || 0}
                />
                <LoopControls 
                  deck="B" 
                  trackId={right.title}
                  currentMs={right.ws?.getCurrentTime() * 1000 || 0}
                />
                <MixPointSuggest 
                  trackId={right.title}
                  onSuggest={(ms) => right.ws?.seekTo(ms / 1000 / (right.ws?.getDuration() || 1))}
                />
              </div>
            </div>
          </div>

          {/* Crossfader */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>A</span>
              <span>Crossfader</span>
              <span>B</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={crossfader}
              onChange={(e) => setCrossfader(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EnhancedDualPlayer() {
  return (
    <DeckProvider>
      <DualPlayerInner />
    </DeckProvider>
  );
}
