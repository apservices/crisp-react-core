import React from 'react';
import { generateBeatGrid } from '@/lib/djTools';
import type { CuePoint, LoopRange } from '@/lib/djTools';

interface WaveformGridProps {
  durationMs: number;
  bpm?: number;
  cues: CuePoint[];
  loops: LoopRange[];
  currentTimeMs: number;
  onSeek?: (timeMs: number) => void;
  showBeatGrid?: boolean;
  width?: number;
  height?: number;
}

export const WaveformGrid: React.FC<WaveformGridProps> = ({
  durationMs,
  bpm,
  cues,
  loops,
  currentTimeMs,
  onSeek,
  showBeatGrid = true,
  width = 800,
  height = 120
}) => {
  const beatGrid = bpm ? generateBeatGrid(durationMs, bpm) : [];
  
  const timeToX = (timeMs: number) => (timeMs / durationMs) * width;
  
  const handleClick = (e: React.MouseEvent<SVGElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timeMs = (x / width) * durationMs;
    onSeek(timeMs);
  };

  return (
    <div className="relative bg-muted/20 rounded-lg overflow-hidden">
      <svg 
        width={width} 
        height={height} 
        className="cursor-pointer"
        onClick={handleClick}
      >
        {/* Background */}
        <rect width={width} height={height} fill="hsl(var(--muted)/0.1)" />
        
        {/* Beat grid */}
        {showBeatGrid && beatGrid.map((beatTime, index) => (
          <line
            key={index}
            x1={timeToX(beatTime)}
            y1={0}
            x2={timeToX(beatTime)}
            y2={height}
            stroke="hsl(var(--border))"
            strokeWidth={index % 4 === 0 ? 2 : 1}
            opacity={index % 4 === 0 ? 0.6 : 0.3}
          />
        ))}
        
        {/* Loop ranges */}
        {loops.map((loop) => (
          <rect
            key={loop.id}
            x={timeToX(loop.start_ms)}
            y={0}
            width={timeToX(loop.end_ms) - timeToX(loop.start_ms)}
            height={height}
            fill="hsl(var(--primary)/0.2)"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            rx={2}
          />
        ))}
        
        {/* Cue points */}
        {cues.map((cue) => (
          <g key={cue.id}>
            <line
              x1={timeToX(cue.position_ms)}
              y1={0}
              x2={timeToX(cue.position_ms)}
              y2={height}
              stroke={cue.color || '#10b981'}
              strokeWidth={3}
            />
            <circle
              cx={timeToX(cue.position_ms)}
              cy={10}
              r={6}
              fill={cue.color || '#10b981'}
            />
            {cue.label && (
              <text
                x={timeToX(cue.position_ms) + 10}
                y={15}
                fontSize="12"
                fill="hsl(var(--foreground))"
                className="text-xs"
              >
                {cue.label}
              </text>
            )}
          </g>
        ))}
        
        {/* Current time indicator */}
        <line
          x1={timeToX(currentTimeMs)}
          y1={0}
          x2={timeToX(currentTimeMs)}
          y2={height}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
        />
        <circle
          cx={timeToX(currentTimeMs)}
          cy={height / 2}
          r={4}
          fill="hsl(var(--foreground))"
        />
      </svg>
      
      {/* Time markers */}
      <div className="flex justify-between text-xs text-muted-foreground px-2 py-1">
        <span>0:00</span>
        <span>{Math.floor(durationMs / 60000)}:{String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0')}</span>
      </div>
    </div>
  );
};