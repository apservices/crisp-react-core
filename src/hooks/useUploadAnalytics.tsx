import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface UploadEvent {
  id: string;
  user_id: string;
  event_type: 'upload_started' | 'upload_completed' | 'upload_failed' | 'upload_retry';
  track_id?: string;
  file_size?: number;
  file_type?: string;
  duration_ms?: number;
  error_message?: string;
  retry_count?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UploadStats {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  averageFileSize: number;
  averageUploadTime: number;
  successRate: number;
  retryRate: number;
  commonErrors: { error: string; count: number }[];
  uploadTrends: { date: string; uploads: number; success: number }[];
  fileTypeStats: { type: string; count: number; successRate: number }[];
}

export function useUploadAnalytics() {
  const [stats, setStats] = useState<UploadStats>({
    totalUploads: 0,
    successfulUploads: 0,
    failedUploads: 0,
    averageFileSize: 0,
    averageUploadTime: 0,
    successRate: 0,
    retryRate: 0,
    commonErrors: [],
    uploadTrends: [],
    fileTypeStats: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [recentEvents, setRecentEvents] = useState<UploadEvent[]>([]);
  const { user } = useAuth();

  // Log upload event (simplified for now until table types are available)
  const logUploadEvent = useCallback(async (event: Omit<UploadEvent, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      // For now, just log to console until upload_analytics table is available in types
      console.log('Upload event:', { user_id: user.id, ...event });
      
      // TODO: Implement actual database logging once types are regenerated
      // const { error } = await supabase
      //   .from('upload_analytics')
      //   .insert({
      //     user_id: user.id,
      //     ...event,
      //   });
    } catch (error) {
      console.error('Failed to log upload event:', error);
    }
  }, [user]);

  // Load analytics data (simplified for now)
  const loadAnalytics = useCallback(async (timeRange: 'day' | 'week' | 'month' | 'all' = 'month') => {
    if (!user) return;

    setLoading(true);
    try {
      // For now, return mock data until table types are available
      const mockEvents: UploadEvent[] = [];
      setRecentEvents(mockEvents);

      // Calculate mock statistics
      const totalUploads = 0;
      const successfulUploads = 0;
      const failedUploads = 0;
      const successRate = 0;
      const retryRate = 0;

      setStats({
        totalUploads,
        successfulUploads,
        failedUploads,
        averageFileSize: 0,
        averageUploadTime: 0,
        successRate,
        retryRate,
        commonErrors: [],
        uploadTrends: [],
        fileTypeStats: [],
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load analytics on mount and when user changes
  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, loadAnalytics]);

  // Utility functions for logging common events
  const logUploadStarted = useCallback((trackId: string, fileSize: number, fileType: string) => {
    return logUploadEvent({
      event_type: 'upload_started',
      track_id: trackId,
      file_size: fileSize,
      file_type: fileType,
    });
  }, [logUploadEvent]);

  const logUploadCompleted = useCallback((trackId: string, durationMs: number, metadata?: Record<string, any>) => {
    return logUploadEvent({
      event_type: 'upload_completed',
      track_id: trackId,
      duration_ms: durationMs,
      metadata,
    });
  }, [logUploadEvent]);

  const logUploadFailed = useCallback((trackId: string, error: string, retryCount?: number) => {
    return logUploadEvent({
      event_type: 'upload_failed',
      track_id: trackId,
      error_message: error,
      retry_count: retryCount,
    });
  }, [logUploadEvent]);

  const logUploadRetry = useCallback((trackId: string, retryCount: number) => {
    return logUploadEvent({
      event_type: 'upload_retry',
      track_id: trackId,
      retry_count: retryCount,
    });
  }, [logUploadEvent]);

  return {
    stats,
    recentEvents,
    loading,
    loadAnalytics,
    logUploadStarted,
    logUploadCompleted,
    logUploadFailed,
    logUploadRetry,
  };
}