import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useDecks } from '@/store/decks';
import { Repeat, X } from 'lucide-react';

interface LoopControlsProps {
  deck: 'A' | 'B';
  trackId?: string;
  currentMs?: number;
}

export const LoopControls: React.FC<LoopControlsProps> = ({ deck, trackId, currentMs = 0 }) => {
  const { setLoopIn, setLoopOut, clearLoop } = useDecks();
  const inMsRef = useRef<number | null>(null);

  const handleIn = () => {
    inMsRef.current = Math.round(currentMs);
    setLoopIn(deck, inMsRef.current);
  };

  const handleOut = async () => {
    if (!trackId || inMsRef.current == null) return;
    await setLoopOut(deck, trackId, Math.round(currentMs));
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={handleIn}>Loop In</Button>
      <Button size="sm" variant="outline" onClick={handleOut} disabled={!trackId || inMsRef.current == null}>Loop Out</Button>
      <Button size="sm" variant="ghost" onClick={() => trackId && clearLoop(deck, trackId, '')} disabled> 
        <X className="h-4 w-4 mr-1"/> Clear
      </Button>
    </div>
  );
};
