import React, { useState } from 'react';
import { Track } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Heart, Activity, Trash2 } from 'lucide-react';

export const TrackRow: React.FC<{ 
  track: Track; 
  onLikeToggle?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
}> = ({ track, onLikeToggle, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    const confirmed = window.confirm(`Tem certeza que deseja deletar "${track.title || track.name}"?`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(track.id);
    } catch (error) {
      console.error('Erro ao deletar faixa:', error);
      alert('Erro ao deletar a faixa. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
  <Card className="p-3 glass flex items-center justify-between rounded-xl">
    <div className="min-w-0">
      <div className="font-medium truncate">{track.title || track.name}</div>
      <div className="text-xs text-muted-foreground truncate">{track.artist || 'Unknown'}</div>
      <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
        {track.bpm ? <Badge variant="outline">{track.bpm} BPM</Badge> : <Badge variant="secondary">Analisando…</Badge>}
        {track.key_signature && <Badge variant="outline">Key {track.key_signature}</Badge>}
        {typeof track.energy_level === 'number' && <Badge variant="outline" className="flex items-center gap-1"><Activity className="h-3 w-3"/>Energia {track.energy_level}/10</Badge>}
        {track.genre && <Badge variant="outline">{track.genre}</Badge>}
      </div>
    </div>
    <div className="shrink-0 flex items-center gap-2">
      <div className="flex items-center text-xs text-muted-foreground"><Clock className="h-3 w-3 mr-1"/>{track.duration}</div>
      {onLikeToggle && (
        <button
          aria-label="Curtir"
          onClick={() => onLikeToggle(track.id)}
          className={`p-2 rounded-lg transition-smooth ${track.is_liked ? 'bg-primary/20 text-primary' : 'hover:bg-muted/60'}`}
        >
          <Heart className={`h-4 w-4 ${track.is_liked ? '' : 'text-muted-foreground'}`} />
        </button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Deletar faixa"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  </Card>
  );
};

