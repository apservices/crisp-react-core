import { supabase } from '@/integrations/supabase/client';

export interface CuePoint {
  id: string;
  track_id: string;
  position_ms: number;
  label?: string;
  color?: string;
}

export interface LoopRange {
  id: string;
  track_id: string;
  start_ms: number;
  end_ms: number;
  label?: string;
}

export interface DJToolsStore {
  cues: CuePoint[];
  loops: LoopRange[];
  loading: boolean;
}

// Cue Points Management
export async function saveCuePoint(trackId: string, positionMs: number, label?: string, userId?: string): Promise<CuePoint | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('track_cues')
      .insert({
        track_id: trackId,
        position_ms: positionMs,
        label: label || `Cue ${Date.now()}`,
        color: '#10b981',
        user_id: userId || user!.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving cue point:', error);
    return null;
  }
}

export async function deleteCuePoint(cueId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('track_cues')
      .delete()
      .eq('id', cueId);

    return !error;
  } catch (error) {
    console.error('Error deleting cue point:', error);
    return false;
  }
}

export async function loadCuePoints(trackId: string): Promise<CuePoint[]> {
  try {
    const { data, error } = await supabase
      .from('track_cues')
      .select('*')
      .eq('track_id', trackId)
      .order('position_ms');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading cue points:', error);
    return [];
  }
}

// Loop Management
export async function saveLoopRange(trackId: string, startMs: number, endMs: number, label?: string, userId?: string): Promise<LoopRange | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('track_loops')
      .insert({
        track_id: trackId,
        start_ms: startMs,
        end_ms: endMs,
        label: label || `Loop ${Date.now()}`,
        user_id: userId || user!.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving loop range:', error);
    return null;
  }
}

export async function deleteLoopRange(loopId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('track_loops')
      .delete()
      .eq('id', loopId);

    return !error;
  } catch (error) {
    console.error('Error deleting loop range:', error);
    return false;
  }
}

export async function loadLoopRanges(trackId: string): Promise<LoopRange[]> {
  try {
    const { data, error } = await supabase
      .from('track_loops')
      .select('*')
      .eq('track_id', trackId)
      .order('start_ms');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading loop ranges:', error);
    return [];
  }
}

// Beatgrid snap utility
export function snapToNearestBeat(positionMs: number, bpm: number, snapEnabled: boolean = true): number {
  if (!snapEnabled || !bpm) return positionMs;
  
  const beatDurationMs = (60 / bpm) * 1000; // duration of one beat in ms
  const beatNumber = Math.round(positionMs / beatDurationMs);
  return beatNumber * beatDurationMs;
}

// Visual grid helpers
export function generateBeatGrid(durationMs: number, bpm: number): number[] {
  if (!bpm || !durationMs) return [];
  
  const beatDurationMs = (60 / bpm) * 1000;
  const beats: number[] = [];
  
  for (let time = 0; time < durationMs; time += beatDurationMs) {
    beats.push(time);
  }
  
  return beats;
}