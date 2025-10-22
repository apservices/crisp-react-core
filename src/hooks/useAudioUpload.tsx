import { uuid } from '../utils/uuid';
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useAudioUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();
  const { canUploadTrack, getTrackLimit, createCheckoutSession } = useSubscription();

  const uploadAudio = async (file: File, metadata: {
    title: string;
    artist: string;
    type: 'track' | 'remix' | 'sample';
    genre?: string;
    bpm?: number;
    energy_level?: number;
    tags?: string[];
  }) => {
    try {
      setUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Check subscription limits before proceeding
      if (!canUploadTrack()) {
        const limit = getTrackLimit();
        toast({
          title: "Limite de upload atingido",
          description: `Seu plano atual permite ${limit} faixas. Abrindo a assinatura PRO...`
        });
        await createCheckoutSession('pro');
        throw new Error('Limite de upload atingido');
      }

      // Client-side validation: audio type and size limit (100MB)
      const MAX_SIZE = 100 * 1024 * 1024;
      if (!file.type.startsWith('audio/')) {
        throw new Error('Apenas arquivos de Ã¡udio sÃ£o permitidos.');
      }
      if (file.size > MAX_SIZE) {
        throw new Error('Arquivo muito grande. Limite: 100MB');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('FaÃ§a login com e-mail e senha para enviar.');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uuid()}.${fileExt}`;

      // Upload file to storage (private bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // No public URL for private buckets; signed URLs can be generated on demand

      // Get audio duration (approximate)
      const audio = new Audio();
      const duration = await new Promise<string>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
        audio.src = URL.createObjectURL(file);
      });

      // Create track record
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          title: metadata.title,
          artist: metadata.artist,
          type: metadata.type,
          duration,
          genre: metadata.genre,
          bpm: metadata.bpm,
          energy_level: metadata.energy_level,
          tags: metadata.tags,
          file_url: null,
          file_path: fileName,
          original_filename: file.name,
          file_size: file.size,
          upload_status: 'completed'
        })
        .select()
        .single();

      if (trackError) throw trackError;

      toast({
        title: "Upload concluÃ­do!",
        description: `${metadata.title} foi adicionado ao seu vault.`
      });

      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      return track;

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao fazer upload do arquivo",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 1000);
    }
  };

  return {
    uploadAudio,
    uploading,
    progress
  };
}
