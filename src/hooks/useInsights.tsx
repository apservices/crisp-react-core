import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyInsights {
  totalTracks: number;
  totalListeningTime: number;
  averageBPM: number;
  topGenres: Array<{ genre: string; count: number }>;
  mostActiveDay: string;
  uploadTrend: 'up' | 'down' | 'stable';
  mixSessions: number;
  trackAnalytics: {
    mostPlayed: { title: string; artist: string; playCount: number } | null;
    recentUploads: number;
    favoriteGenre: string;
  };
}

export function useInsights() {
  const [insights, setInsights] = useState<WeeklyInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get tracks from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: tracks } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id);

      const { data: recentTracks } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: djSessions } = await supabase
        .from('dj_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!tracks) return;

      // Calculate insights
      const totalTracks = tracks.length;
      const recentUploads = recentTracks?.length || 0;

      // Calculate total listening time (approximate)
      const totalListeningTime = tracks.reduce((acc, track) => {
        if (!track.duration || typeof track.duration !== 'string') return acc;
        const parts = track.duration.split(':');
        const min = parseInt(parts[0]) || 0;
        const sec = parseInt(parts[1]) || 0;
        return acc + (min * 60 + sec);
      }, 0);

      // Calculate average BPM
      const tracksWithBPM = tracks.filter(t => t.bpm);
      const averageBPM = tracksWithBPM.length > 0
        ? Math.round(tracksWithBPM.reduce((acc, t) => acc + (t.bpm || 0), 0) / tracksWithBPM.length)
        : 0;

      // Top genres
      const genreCounts = tracks.reduce((acc, track) => {
        if (track.genre) {
          acc[track.genre] = (acc[track.genre] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Most active day (mock based on recent uploads)
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const mostActiveDay = dayNames[new Date().getDay()];

      // Upload trend
      const previousWeekCount = Math.max(0, totalTracks - recentUploads);
      let uploadTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentUploads > previousWeekCount) uploadTrend = 'up';
      else if (recentUploads < previousWeekCount) uploadTrend = 'down';

      // Track analytics
      const mostPlayed = tracks.length > 0 
        ? tracks.reduce((prev, current) => 
            (current.play_count || 0) > (prev.play_count || 0) ? current : prev
          )
        : null;

      const favoriteGenre = topGenres[0]?.genre || 'Eletrônica';

      const weeklyInsights: WeeklyInsights = {
        totalTracks,
        totalListeningTime,
        averageBPM,
        topGenres,
        mostActiveDay,
        uploadTrend,
        mixSessions: djSessions?.length || 0,
        trackAnalytics: {
          mostPlayed: mostPlayed ? {
            title: mostPlayed.title,
            artist: mostPlayed.artist,
            playCount: mostPlayed.play_count || 0
          } : null,
          recentUploads,
          favoriteGenre
        }
      };

      setInsights(weeklyInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    refetch: fetchInsights
  };
}