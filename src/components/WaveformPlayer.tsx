
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaveformPlayerProps {
  trackId: string;
  waveformData?: number[];
  duration: string;
  onCommentAdd?: (timestamp: number) => void;
  comments?: Array<{
    id: string;
    timestamp_mark: number;
    content: string;
    type: string;
    color_code: string;
  }>;
  className?: string;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  trackId,
  waveformData = [],
  duration,
  onCommentAdd,
  comments = [],
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Convert duration string to seconds
  const durationInSeconds = useMemo(() => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 180; // fallback
  }, [duration]);

  // Generate waveform data if not provided
  const normalizedData = useMemo(() => {
    if (waveformData.length > 0) {
      return waveformData.map(value => Math.max(0.1, Math.min(1, value)));
    }
    return Array.from({ length: 150 }, (_, i) => {
      const baseValue = Math.sin(i * 0.05) * 0.3 + 0.5;
      const noise = (Math.random() - 0.5) * 0.3;
      return Math.max(0.1, Math.min(1, baseValue + noise));
    });
  }, [waveformData]);

  const handleWaveformClick = (event: React.MouseEvent) => {
    if (!waveformRef.current) return;
    
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const timestamp = percentage * durationInSeconds;
    
    setCurrentTime(timestamp);
    if (onCommentAdd) {
      onCommentAdd(timestamp);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCommentPosition = (timestamp: number) => {
    return (timestamp / durationInSeconds) * 100;
  };

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= durationInSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationInSeconds]);

  const playheadPosition = (currentTime / durationInSeconds) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="neon-glow"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{duration}</span>
        </div>
      </div>

      {/* Waveform */}
      <div className="relative">
        <div
          ref={waveformRef}
          className="relative h-20 glass rounded-lg cursor-pointer overflow-hidden group"
          onClick={handleWaveformClick}
        >
          {/* Waveform bars */}
          <div className="flex items-center justify-center h-full px-2 gap-px">
            {normalizedData.map((value, index) => {
              const isPlayed = (index / normalizedData.length) * 100 <= playheadPosition;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex-1 min-w-[1px] transition-all duration-75 rounded-sm",
                    isPlayed 
                      ? "bg-gradient-to-t from-neon-blue to-neon-violet" 
                      : "bg-muted hover:bg-primary/50"
                  )}
                  style={{ height: `${value * 80}%` }}
                />
              );
            })}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-neon-teal shadow-lg z-10"
            style={{ left: `${playheadPosition}%` }}
          />

          {/* Comment markers */}
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="absolute top-0 bottom-0 w-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer z-20 group/comment"
              style={{
                left: `${getCommentPosition(comment.timestamp_mark)}%`,
                backgroundColor: comment.color_code || '#06b6d4',
              }}
            >
              {/* Tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/comment:opacity-100 transition-opacity bg-popover border rounded-lg p-2 z-30 min-w-48 pointer-events-none">
                <div className="text-xs font-medium text-foreground">
                  {formatTime(comment.timestamp_mark)}
                </div>
                <div className="text-xs text-muted-foreground mb-1 capitalize">
                  {comment.type.replace('_', ' ')}
                </div>
                <div className="text-sm text-foreground">
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add comment hint */}
        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          Clique na waveform para adicionar comentário
        </div>
      </div>
    </div>
  );
};

export default WaveformPlayer;
