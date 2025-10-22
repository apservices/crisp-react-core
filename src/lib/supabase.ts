
// Simplified supabase utilities - removed problematic v_user_library queries
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types';

export { supabase };

export async function getUserTracks(userId: string): Promise<Track[]> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cast to Track[] with proper type assertion
    return data?.map(track => ({
      ...track,
      type: (track.type || 'track') as 'track' | 'remix' | 'sample',
      name: track.title,
      url: track.file_url || track.file_path
    })) as Track[] || [];
  } catch (error) {
    console.error('Error fetching user tracks:', error);
    return [];
  }
}

export async function getAllTracks(): Promise<Track[]> {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cast to Track[] with proper type assertion
    return data?.map(track => ({
      ...track,
      type: (track.type || 'track') as 'track' | 'remix' | 'sample',
      name: track.title,
      url: track.file_url || track.file_path
    })) as Track[] || [];
  } catch (error) {
    console.error('Error fetching all tracks:', error);
    return [];
  }
}

export async function fetchTrackFeatures(trackId: string) {
  try {
    const { data, error } = await supabase
      .from('track_features')
      .select('*')
      .eq('track_id', trackId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching track features:', error);
    return null;
  }
}
