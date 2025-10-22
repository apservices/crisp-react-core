
import { useState } from "react";
import { ExportDialog } from "@/components/ExportDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, Play, Pause, MessageCircle, MoreVertical, Music2, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import WaveformWithComments from './WaveformWithComments';
import CommentsPanel from './CommentsPanel';


interface EnhancedDJCardProps {
  id: string;
  title: string;
  artist: string;
  duration: string;
  type: 'track' | 'remix' | 'sample';
  bpm?: number;
  genre?: string;
  keySignature?: string;
  energy?: number;
  isLiked?: boolean;
  waveformData?: number[];
  onLike?: () => void;
  onPlay?: () => void;
  onComment?: () => void;
  onDelete?: (id: string) => Promise<void>;
  isPlaying?: boolean;
}

export function EnhancedDJCard({
  id,
  title,
  artist,
  duration,
  type,
  bpm,
  genre,
  keySignature,
  energy,
  isLiked = false,
  waveformData = [],
  onLike,
  onPlay,
  onComment,
  onDelete,
  isPlaying = false
}: EnhancedDJCardProps) {
  const [showWaveform, setShowWaveform] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeColors = {
    track: "bg-neon-blue/20 text-neon-blue border-neon-blue/30",
    remix: "bg-neon-violet/20 text-neon-violet border-neon-violet/30",
    sample: "bg-neon-teal/20 text-neon-teal border-neon-teal/30"
  };

  const energyColor = energy ? 
    energy <= 3 ? "bg-blue-500" :
    energy <= 7 ? "bg-yellow-500" :
    "bg-red-500"
    : "bg-gray-500";

  return (
    <Card className="glass border-glass-border hover:border-primary/50 transition-smooth group">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-sm">
              {title}
            </h3>
            <p className="text-muted-foreground text-xs truncate">
              {artist}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-xs ml-2", typeColors[type])}
          >
            {type}
          </Badge>
        </div>

        {/* Waveform or Metadata */}
        {showWaveform && waveformData.length > 0 ? (
          <div className="mb-3 h-12 flex items-end gap-0.5 bg-muted/20 rounded p-1">
            {waveformData.map((height, index) => (
              <div
                key={index}
                className="flex-1 bg-primary/60 rounded-sm transition-all duration-75"
                style={{ height: `${height * 100}%` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {bpm && (
              <div className="text-center">
                <p className="text-lg font-bold text-primary font-heading">
                  {bpm}
                </p>
                <p className="text-xs text-muted-foreground">BPM</p>
              </div>
            )}
            {keySignature && (
              <div className="text-center">
                <p className="text-lg font-bold text-primary font-heading">
                  {keySignature}
                </p>
                <p className="text-xs text-muted-foreground">Key</p>
              </div>
            )}
            {genre && (
              <div className="text-center">
                <p className="text-sm font-medium text-foreground truncate">
                  {genre}
                </p>
                <p className="text-xs text-muted-foreground">Genre</p>
              </div>
            )}
            {energy && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className={cn("w-2 h-2 rounded-full", energyColor)} />
                  <p className="text-sm font-medium text-foreground">
                    {energy}/10
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Energy</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar for Playing */}
        {isPlaying && (
          <div className="mb-3">
            <Progress value={45} className="h-1" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1:23</span>
              <span>{duration}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isLiked && "text-red-500 hover:text-red-600"
              )}
              onClick={onLike}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
            
            <Dialog open={showComments} onOpenChange={setShowComments}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Track Comments & Analysis - {title}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  <div>
                    <WaveformWithComments 
                      trackId={id}
                      waveformData={waveformData}
                      duration={duration}
                    />
                  </div>
                  <div>
                    <CommentsPanel trackId={id} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWaveform(!showWaveform)}
              className="text-xs"
            >
              <Music2 className="h-3 w-3 mr-1" />
              Wave
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <Upload className="h-3 w-3 mr-1" />
              Export
            </Button>
            
            <span className="text-xs text-muted-foreground">
              {duration}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border">
                {onDelete && (
                  <DropdownMenuItem
                    onClick={async () => {
                      if (isDeleting) return;
                      const confirmed = window.confirm(`Tem certeza que deseja deletar "${title}"?`);
                      if (!confirmed) return;
                      try {
                        setIsDeleting(true);
                        await onDelete(id);
                      } catch (error) {
                        console.error('Erro ao deletar:', error);
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deletando...' : 'Deletar'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
}
