
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types';

interface AudioPlayerProps {
  track: Track;
  showAnalysis?: boolean;
}

export function AudioPlayer({ track, showAnalysis = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadAudio();
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [track.id]);

  const loadAudio = async () => {
    if (!track.file_path) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('audio')
        .download(track.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = (value[0] / 100) * duration;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    const newVolume = value[0] / 100;
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Track Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{track.title}</h3>
            <p className="text-sm text-muted-foreground">{track.artist}</p>
          </div>
          
          {showAnalysis && (
            <div className="flex gap-2">
              {track.bpm && (
                <Badge variant="outline">{track.bpm} BPM</Badge>
              )}
              {track.key_signature && (
                <Badge variant="outline">{track.key_signature}</Badge>
              )}
              {track.energy_level && (
                <Badge variant="outline">Energy: {track.energy_level}/10</Badge>
              )}
            </div>
          )}
        </div>

        {/* Audio Element */}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        )}

        {/* Controls */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
              disabled={!audioUrl || loading}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Play Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                disabled={!audioUrl || loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="p-2"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Track Analysis */}
        {showAnalysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{track.duration || '--:--'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">BPM</p>
              <p className="text-sm font-medium">{track.bpm || 'Unknown'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Key</p>
              <p className="text-sm font-medium">{track.key_signature || 'Unknown'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Genre</p>
              <p className="text-sm font-medium">{track.genre || 'Unknown'}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
