import React, { createContext, useContext, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DeckId = 'A' | 'B';

export interface CuePoint { id?: string; position_ms: number; label?: string; color?: string }
export interface LoopRange { id?: string; start_ms: number; end_ms: number; label?: string; color?: string }

interface DeckStateCore {
  cues: CuePoint[];
  loops: LoopRange[];
  quantize: boolean;
  beatgridEnabled: boolean;
}

interface DeckStore {
  A: DeckStateCore;
  B: DeckStateCore;
  setCue: (deck: DeckId, trackId: string, positionMs: number) => Promise<void>;
  deleteCue: (deck: DeckId, trackId: string, cueId: string) => Promise<void>;
  setLoopIn: (deck: DeckId, ms: number) => void;
  setLoopOut: (deck: DeckId, trackId: string, ms: number) => Promise<void>;
  clearLoop: (deck: DeckId, trackId: string, loopId: string) => Promise<void>;
  setQuantize: (deck: DeckId, on: boolean) => void;
  setBeatgridEnabled: (deck: DeckId, on: boolean) => void;
}

const DeckContext = createContext<DeckStore | null>(null);

export function DeckProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{A: DeckStateCore; B: DeckStateCore}>(
    { A: { cues: [], loops: [], quantize: true, beatgridEnabled: true }, B: { cues: [], loops: [], quantize: true, beatgridEnabled: true } }
  );

  const api: DeckStore = useMemo(() => ({
    A: state.A,
    B: state.B,
    async setCue(deck, trackId, position_ms) {
      const res = await supabase.from('track_cues').insert({ track_id: trackId, position_ms, user_id: (await supabase.auth.getUser()).data.user?.id });
      if (res.error) throw res.error;
      setState((prev) => ({ ...prev, [deck]: { ...prev[deck], cues: [...prev[deck].cues, { position_ms }] } }));
    },
    async deleteCue(deck, trackId, cueId) {
      const res = await supabase.from('track_cues').delete().eq('id', cueId).eq('track_id', trackId);
      if (res.error) throw res.error;
      setState((prev) => ({ ...prev, [deck]: { ...prev[deck], cues: prev[deck].cues.filter(c => c.id !== cueId) } }));
    },
    setLoopIn(deck, ms) {
      setState((prev) => ({ ...prev, [deck]: { ...prev[deck], loops: [...prev[deck].loops, { start_ms: ms, end_ms: ms }] } }));
    },
    async setLoopOut(deck, trackId, ms) {
      setState((prev) => {
        const loops = [...prev[deck].loops];
        const last = loops[loops.length - 1];
        if (!last || last.end_ms !== last.start_ms) return prev; // no open loop
        last.end_ms = ms;
        return { ...prev, [deck]: { ...prev[deck], loops } };
      });
      const last = state[deck].loops[state[deck].loops.length - 1];
      const payload = { track_id: trackId, start_ms: last?.start_ms ?? 0, end_ms: ms, user_id: (await supabase.auth.getUser()).data.user?.id };
      const res = await supabase.from('track_loops').insert(payload);
      if (res.error) throw res.error;
    },
    async clearLoop(deck, trackId, loopId) {
      const res = await supabase.from('track_loops').delete().eq('id', loopId).eq('track_id', trackId);
      if (res.error) throw res.error;
      setState((prev) => ({ ...prev, [deck]: { ...prev[deck], loops: prev[deck].loops.filter(l => l.id !== loopId) } }));
    },
    setQuantize(deck, on) {
      setState((prev) => ({ ...prev, [deck]: { ...prev[deck], quantize: on } }));
    },
    setBeatgridEnabled(deck, on) {
      setState((prev) => ({ ...prev, [deck]: { ...prev[deck], beatgridEnabled: on } }));
    },
  }), [state]);

  return <DeckContext.Provider value={api}>{children}</DeckContext.Provider>;
}

export function useDecks() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDecks must be used within DeckProvider');
  return ctx;
}
