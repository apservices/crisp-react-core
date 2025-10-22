import React from 'react';
import { Button } from '@/components/ui/button';
import { useDecks } from '@/store/decks';
import { Flag, Trash2 } from 'lucide-react';

interface CueControlsProps {
  deck: 'A' | 'B';
  trackId?: string;
  currentMs?: number;
}

export const CueControls: React.FC<CueControlsProps> = ({ deck, trackId, currentMs = 0 }) => {
  const { setCue } = useDecks();

  const handleSetCue = async () => {
    if (!trackId) return;
    await setCue(deck, trackId, Math.round(currentMs));
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={handleSetCue} disabled={!trackId} title={!trackId ? 'Selecione uma faixa da biblioteca' : 'Definir cue'}>
        <Flag className="h-4 w-4 mr-1"/> Cue
      </Button>
      <Button size="sm" variant="ghost" disabled title="Remover cue (selecione na lista)">
        <Trash2 className="h-4 w-4"/>
      </Button>
    </div>
  );
};
