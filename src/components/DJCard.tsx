import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Share, MoreVertical } from "lucide-react";

interface DJCardProps {
  title: string;
  artist: string;
  duration: string;
  type: "remix" | "sample" | "track";
  bpm?: number;
  genre?: string;
  waveform?: string;
  isLiked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onShare?: () => void;
}

const typeColors = {
  remix: "bg-neon-violet/20 text-neon-violet border-neon-violet/30",
  sample: "bg-neon-teal/20 text-neon-teal border-neon-teal/30", 
  track: "bg-neon-blue/20 text-neon-blue border-neon-blue/30"
};

const typeLabels = {
  remix: "Remix",
  sample: "Sample",
  track: "Track"
};

export function DJCard({ 
  title, 
  artist, 
  duration, 
  type, 
  bpm, 
  genre, 
  isLiked = false,
  onPlay,
  onLike,
  onShare 
}: DJCardProps) {
  return (
    <Card className="glass border-glass-border p-4 hover:border-primary/30 transition-smooth group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={typeColors[type]}>
            {typeLabels[type]}
          </Badge>
          {bpm && (
            <Badge variant="outline" className="border-muted text-muted-foreground">
              {bpm} BPM
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="opacity-0 group-hover:opacity-100 transition-smooth"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-3">
        <h3 className="font-semibold text-foreground text-base mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-2">
          {artist}
        </p>
        {genre && (
          <p className="text-xs text-muted-foreground">
            {genre}
          </p>
        )}
      </div>

      {/* Waveform placeholder */}
      <div className="h-12 bg-muted/30 rounded-lg mb-3 flex items-center justify-center">
        <div className="flex items-end gap-1 h-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-primary/40 rounded-sm animate-pulse"
              style={{ 
                width: '2px', 
                height: `${Math.random() * 100 + 10}%`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10"
            onClick={onPlay}
          >
            <Play className="h-4 w-4 fill-primary text-primary" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10"
            onClick={onLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary/10"
            onClick={onShare}
          >
            <Share className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <span className="text-xs text-muted-foreground">
          {duration}
        </span>
      </div>
    </Card>
  );
}