import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DJSession {
  id: string;
  session_name: string;
  duration: number | null;
  tracks_mixed: number | null;
  session_data: any;
  created_at: string;
  updated_at: string;
}

export function useDJSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<DJSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      setSessions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dj_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Erro ao carregar sessões",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSessions(data || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('dj_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Erro ao deletar sessão",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        setSessions(prev => prev.filter(session => session.id !== id));
        toast({
          title: "Sessão removida",
          description: "A sessão foi removida do histórico.",
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      return { error };
    }
  };

  const getSessionStats = () => {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalTracks = sessions.reduce((sum, session) => sum + (session.tracks_mixed || 0), 0);
    const avgSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    // Track mais usada
    const trackFrequency: Record<string, { count: number; title: string; artist: string }> = {};
    sessions.forEach(session => {
      if (session.session_data?.tracks) {
        session.session_data.tracks.forEach((track: any) => {
          const key = `${track.title} - ${track.artist}`;
          if (!trackFrequency[key]) {
            trackFrequency[key] = { count: 0, title: track.title, artist: track.artist };
          }
          trackFrequency[key].count++;
        });
      }
    });

    const mostUsedTrack = Object.values(trackFrequency)
      .sort((a, b) => b.count - a.count)[0];

    return {
      totalSessions,
      totalDuration,
      totalTracks,
      avgSessionDuration,
      mostUsedTrack
    };
  };

  return {
    sessions,
    loading,
    deleteSession,
    refetch: fetchSessions,
    stats: getSessionStats()
  };
}