import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { parseBlob } from 'music-metadata-browser';

export interface UploadJob {
  id: string;
  file: File;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    year?: number;
    genre?: string[];
    duration?: number;
    bitrate?: number;
    format?: string;
  };
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error' | 'retrying';
  error?: string;
  retryCount: number;
  trackId?: string;
  startTime?: number;
  endTime?: number;
}

export interface UploadAnalytics {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  averageUploadTime: number;
  totalBytesUploaded: number;
  retryRate: number;
  lastUpdated: Date;
}

export function useBackgroundUpload() {
  const [uploadQueue, setUploadQueue] = useState<UploadJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analytics, setAnalytics] = useState<UploadAnalytics>({
    totalUploads: 0,
    successfulUploads: 0,
    failedUploads: 0,
    averageUploadTime: 0,
    totalBytesUploaded: 0,
    retryRate: 0,
    lastUpdated: new Date(),
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingRef = useRef(false);

  // Extract metadata from audio file
  const extractMetadata = useCallback(async (file: File): Promise<UploadJob['metadata']> => {
    try {
      const metadata = await parseBlob(file);
      
      return {
        title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata.common.artist || metadata.common.albumartist || 'Unknown Artist',
        album: metadata.common.album,
        year: metadata.common.year,
        genre: metadata.common.genre,
        duration: metadata.format.duration,
        bitrate: metadata.format.bitrate,
        format: metadata.format.container || 'unknown',
      };
    } catch (error) {
      console.warn('Failed to extract metadata:', error);
      
      // Fallback to basic metadata
      return {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        format: file.type || 'unknown',
      };
    }
  }, []);

  // Add file to upload queue
  const addToQueue = useCallback(async (file: File): Promise<string> => {
    const jobId = crypto.randomUUID();
    
    // Extract metadata before adding to queue
    const metadata = await extractMetadata(file);
    
    const newJob: UploadJob = {
      id: jobId,
      file,
      metadata,
      progress: 0,
      status: 'pending',
      retryCount: 0,
      startTime: Date.now(),
    };

    setUploadQueue(prev => [...prev, newJob]);
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      totalUploads: prev.totalUploads + 1,
      lastUpdated: new Date(),
    }));

    toast({
      title: "Adicionado à fila",
      description: `${metadata.title} será enviado em segundo plano.`,
    });

    return jobId;
  }, [extractMetadata, toast]);

  // Process upload with retry logic
  const processUpload = useCallback(async (job: UploadJob): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Update job status
      setUploadQueue(prev => 
        prev.map(j => j.id === job.id ? { ...j, status: 'uploading', progress: 0 } : j)
      );

      // Validate file
      const { isValidAudioFile, getAudioFormatInfo } = await import('@/utils/audioFormats');
      
      if (!isValidAudioFile(job.file)) {
        throw new Error('Invalid audio format');
      }

      const formatInfo = getAudioFormatInfo(job.file);
      const MAX_SIZE = 200 * 1024 * 1024;
      
      if (job.file.size > MAX_SIZE) {
        throw new Error('File size exceeds 200MB limit');
      }

      // Create unique filename
      const fileExt = formatInfo.extension.replace('.', '') || 'mp3';
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload to storage with progress tracking
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(fileName, job.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: formatInfo.mimeType,
        });

      if (uploadError) throw uploadError;

      // Update progress to 50% after upload
      setUploadQueue(prev => 
        prev.map(j => j.id === job.id ? { ...j, progress: 50, status: 'processing' } : j)
      );

      // Create track record with extracted metadata
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          title: job.metadata?.title || job.file.name.replace(/\.[^/.]+$/, ''),
          artist: job.metadata?.artist || 'Unknown Artist',
          type: 'track',
          duration: job.metadata?.duration ? 
            `${Math.floor(job.metadata.duration / 60)}:${Math.floor(job.metadata.duration % 60).toString().padStart(2, '0')}` :
            '0:00',
          genre: job.metadata?.genre?.[0],
          bpm: null, // Will be analyzed server-side
          energy_level: null, // Will be analyzed server-side  
          file_path: fileName,
          original_filename: job.file.name,
          file_size: job.file.size,
          upload_status: 'completed',
        })
        .select()
        .single();

      if (trackError) throw trackError;

      // Update progress to 75% after database insert
      setUploadQueue(prev => 
        prev.map(j => j.id === job.id ? { 
          ...j, 
          progress: 75, 
          trackId: track.id 
        } : j)
      );

      // Trigger server-side analysis (non-blocking)
      try {
        supabase.functions.invoke('analyze-audio', {
          body: { trackId: track.id }
        });
      } catch (analysisError) {
        console.warn('Failed to trigger analysis:', analysisError);
      }

      // Complete the job
      const endTime = Date.now();
      setUploadQueue(prev => 
        prev.map(j => j.id === job.id ? { 
          ...j, 
          progress: 100, 
          status: 'completed',
          endTime
        } : j)
      );

      // Update analytics  
      setAnalytics(prev => {
        const uploadTime = endTime - (job.startTime || endTime);
        const newAverage = (prev.averageUploadTime * prev.successfulUploads + uploadTime) / (prev.successfulUploads + 1);
        
        return {
          ...prev,
          successfulUploads: prev.successfulUploads + 1,
          averageUploadTime: newAverage,
          totalBytesUploaded: prev.totalBytesUploaded + job.file.size,
          lastUpdated: new Date(),
        };
      });

      toast({
        title: "Upload concluído!",
        description: `${job.metadata?.title} foi adicionado ao seu vault.`,
      });

    } catch (error) {
      console.error('Upload failed:', error);
      
      const canRetry = job.retryCount < 3;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (canRetry) {
        // Retry with exponential backoff
        const retryDelay = Math.pow(2, job.retryCount) * 1000;
        
        setUploadQueue(prev => 
          prev.map(j => j.id === job.id ? { 
            ...j, 
            status: 'retrying',
            error: errorMessage,
            retryCount: j.retryCount + 1
          } : j)
        );

        setTimeout(() => {
          setUploadQueue(prev => 
            prev.map(j => j.id === job.id ? { ...j, status: 'pending' } : j)
          );
        }, retryDelay);

        // Update retry analytics
        setAnalytics(prev => ({
          ...prev,
          retryRate: ((prev.retryRate * (prev.totalUploads - 1)) + 1) / prev.totalUploads,
          lastUpdated: new Date(),
        }));
        
      } else {
        // Mark as failed
        setUploadQueue(prev => 
          prev.map(j => j.id === job.id ? { 
            ...j, 
            status: 'error',
            error: errorMessage,
            endTime: Date.now()
          } : j)
        );

        // Update analytics
        setAnalytics(prev => ({
          ...prev,
          failedUploads: prev.failedUploads + 1,
          lastUpdated: new Date(),
        }));

        toast({
          title: "Falha no upload",
          description: `${job.metadata?.title}: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  }, [user, toast]);

  // Process queue automatically
  useEffect(() => {
    const processQueue = async () => {
      if (processingRef.current || !user) return;

      const pendingJob = uploadQueue.find(job => job.status === 'pending');
      if (!pendingJob) {
        setIsUploading(false);
        return;
      }

      processingRef.current = true;
      setIsUploading(true);

      try {
        await processUpload(pendingJob);
      } catch (error) {
        console.error('Queue processing error:', error);
      } finally {
        processingRef.current = false;
      }
    };

    processQueue();
  }, [uploadQueue, processUpload, user]);

  // Remove completed/failed jobs after delay
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setUploadQueue(prev => 
        prev.filter(job => 
          job.status !== 'completed' && 
          job.status !== 'error' &&
          (!job.endTime || Date.now() - job.endTime < 30000)
        )
      );
    }, 30000);

    return () => clearTimeout(cleanup);
  }, [uploadQueue]);

  const cancelUpload = useCallback((jobId: string) => {
    setUploadQueue(prev => prev.filter(job => job.id !== jobId));
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const retryUpload = useCallback((jobId: string) => {
    setUploadQueue(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, status: 'pending', retryCount: 0, error: undefined } : job
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadQueue(prev => 
      prev.filter(job => job.status !== 'completed' && job.status !== 'error')
    );
  }, []);

  return {
    uploadQueue,
    isUploading,
    analytics,
    addToQueue,
    cancelUpload,
    retryUpload,
    clearCompleted,
  };
}