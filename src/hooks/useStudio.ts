import { useState, useEffect } from 'react';
import { Track } from '@/types';

export function useStudio(tracks: Track[]) {
  const [dualSelection, setDualSelection] = useState<[string?, string?]>([undefined, undefined]);
  const [dualTracks, setDualTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (dualSelection[0] && dualSelection[1]) {
      const sel = tracks.filter(t => t.id === dualSelection[0] || t.id === dualSelection[1]);
      setDualTracks(sel);
    } else {
      setDualTracks([]);
    }
  }, [dualSelection, tracks]);

  return { dualSelection, setDualSelection, dualTracks };
}
