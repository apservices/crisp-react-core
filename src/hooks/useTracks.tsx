import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Track } from "@/types";

type FilterMode = "single" | "dual";

interface UseTracksReturn {
  tracks: Track[];
  loading: boolean;
  refetch: () => Promise<void>;
  setFilterMode: (mode: FilterMode) => void;
  toggleLike: (id: string) => Promise<void>;
  addTrack: (file: File) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  filterMode: FilterMode;
}

export function useTracks(): UseTracksReturn {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("single");

  const loadTracks = useCallback(async () => {
    if (!user) {
      setTracks([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTracks((data as any) || []);
    } catch (e) {
      console.error("Failed to load tracks", e);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const refetch = useCallback(async () => {
    await loadTracks();
  }, [loadTracks]);

  const toggleLike = useCallback(async (id: string) => {
    try {
      const current = tracks.find((t) => t.id === id);
      const next = !current?.is_liked;
      setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, is_liked: next } : t)));
      const { error } = await supabase
        .from("tracks")
        .update({ is_liked: next })
        .eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("toggleLike failed", e);
    }
  }, [tracks]);

  const addTrack = async (file: File) => {
    if (!navigator.onLine) {
      throw new Error("Análise requer conexão ativa");
    }
    if (!user) {
      throw new Error("É necessário estar logado para enviar faixas");
    }

    // Enhanced audio format validation
    const { isValidAudioFile, getAudioFormatInfo } = await import("@/utils/audioFormats");
    
    if (!isValidAudioFile(file)) {
      const supportedFormats = "MP3, WAV, M4A, AAC, FLAC, AIFF, OGG";
      throw new Error(`Formato de áudio não suportado. Formatos aceitos: ${supportedFormats}`);
    }

    // Increased size limit to 200MB
    const MAX_SIZE = 200 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("Arquivo muito grande. Limite: 200MB");
    }

    // Get audio format info for proper extension and content type
    const formatInfo = getAudioFormatInfo(file);
    const fileExt = formatInfo.extension.replace(".", "") || "mp3";
    const path = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    // Upload to Supabase Storage with proper content type
    const { error: uploadError } = await supabase.storage
      .from("tracks")
      .upload(path, file, { 
        cacheControl: "0", 
        upsert: false, 
        contentType: formatInfo.mimeType
      });
    if (uploadError) {
      console.error("Storage upload failed", uploadError);
      throw new Error("Falha no upload do arquivo");
    }

    // Try to extract enhanced metadata locally
    let localMetadata;
    try {
      const { convertToRemixenseWav, extractRemixenseMetadata } = await import("@/utils/audioFormats");
      const converted = await convertToRemixenseWav(file);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await converted.blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      localMetadata = await extractRemixenseMetadata(audioBuffer, file);
    } catch (conversionError) {
      console.warn("Local conversion failed, using basic metadata:", conversionError);
      // Fallback to basic metadata extraction
      const audio = new Audio();
      const duration = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout loading audio metadata"));
        }, 10000);

        audio.addEventListener("loadedmetadata", () => {
          clearTimeout(timeout);
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        });

        audio.addEventListener("error", () => {
          clearTimeout(timeout);
          reject(new Error("Error loading audio metadata"));
        });

        audio.src = URL.createObjectURL(file);
      });

      localMetadata = { 
        duration,
        durationSeconds: 0,
        bpm: undefined,
        key: undefined,
        energy: undefined,
        originalFormat: formatInfo.format
      };
    }

    // Insert track record with enhanced metadata
    const insertPayload = {
      user_id: user.id,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      artist: "Unknown",
      type: "track",
      duration: localMetadata.duration,
      bpm: localMetadata.bpm,
      key_signature: localMetadata.key,
      energy_level: localMetadata.energy,
      file_path: path,
      original_filename: file.name,
      file_size: file.size,
      upload_status: "processing",
    } as const;

    const { data: inserted, error: insertError } = await supabase
      .from("tracks")
      .insert([insertPayload])
      .select()
      .single();

    if (insertError || !inserted) {
      console.error("Insert track failed", insertError);
      throw new Error("Não foi possível criar o registro da faixa");
    }

    setTracks((prev) => [{ ...(inserted as any), status: "processing" }, ...prev]);

    // Subscribe to realtime updates for this track to reflect status changes
    const channel = supabase
      .channel(`track_${inserted.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tracks", filter: `id=eq.${inserted.id}` },
        (payload: any) => {
          const updated = payload.new;
          setTracks((prev) => prev.map((t) => (t.id === updated.id ? { ...(t as any), ...(updated as any) } : t)));
          // Auto-unsubscribe when completed or error
          if (updated.upload_status === "completed" || updated.upload_status === "error") {
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    // Kick off server-side analysis with timeout
    try {
      const analysisPromise = supabase.functions.invoke("analyze-audio", {
        body: { trackId: inserted.id },
      });
      
      // Set timeout for analysis (30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Analysis timeout")), 30000)
      );
      
      const result = await Promise.race([analysisPromise, timeoutPromise]);
      if (result && (result as any).error) throw (result as any).error;
    } catch (e) {
      console.error("Failed to invoke analyze-audio", e);
      // Mark as completed with warning instead of error to allow manual retry
      setTracks((prev) => prev.map((t) => (t.id === inserted.id ? { 
        ...t, 
        upload_status: "completed"
      } : t)));
      // Don't throw error, just log warning
      console.warn("Análise automática falhou - pode ser feita manualmente depois");
    }
  };

  const deleteTrack = useCallback(async (id: string) => {
    if (!user) {
      throw new Error("É necessário estar logado para deletar faixas");
    }

    try {
      // Get track data from database to find file path
      const { data: trackData, error: fetchError } = await supabase
        .from("tracks")
        .select("file_path")
        .eq("id", id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      // Remove from UI immediately
      setTracks(prev => prev.filter(t => t.id !== id));

      // Delete from database
      const { error: dbError } = await supabase
        .from("tracks")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Delete file from storage if exists
      if (trackData?.file_path) {
        const { error: storageError } = await supabase.storage
          .from("tracks")
          .remove([trackData.file_path]);
        
        if (storageError) {
          console.warn("Failed to delete file from storage:", storageError);
        }
      }
    } catch (e) {
      console.error("deleteTrack failed", e);
      // Re-add track to UI if deletion failed
      await refetch();
      throw e;
    }
  }, [user, refetch]);

  return {
    tracks,
    loading,
    refetch,
    setFilterMode,
    toggleLike,
    addTrack,
    deleteTrack,
    filterMode,
  };
}

