import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ServerAnalysisStatus =
  | "pending"
  | "processing"
  | "completed"
  | "error"
  | "unknown";

interface StatusState {
  status: ServerAnalysisStatus;
  errorMsg?: string | null;
  updatedAt?: string | null;
}

/**
 * Monitora o status de análise de um trackId no Supabase.
 * - Usa Realtime para receber UPDATEs na tabela `tracks`.
 * - Faz uma leitura inicial para pegar o status atual e possíveis erros.
 * - Exponibiliza um método refresh() para forçar nova leitura (fallback).
 */
export function useServerAnalysisStatus(trackId?: string | null) {
  const [state, setState] = useState<StatusState>({ status: "unknown" });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const canQuery = useMemo(() => !!trackId, [trackId]);

  const refresh = async () => {
    if (!canQuery) return;
    try {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, upload_status, updated_at")
        .eq("id", trackId as string)
        .maybeSingle();
      if (error) throw error;

      const status = normalizeStatus(data?.upload_status);
      setState({ status, updatedAt: data?.updated_at ?? null });
    } catch (e: any) {
      setState({ status: "error", errorMsg: e?.message ?? String(e) });
    }
  };

  useEffect(() => {
    if (!canQuery) return;

    // Leitura inicial
    refresh();

    // Assina Realtime para updates desse track específico
    const channel = supabase
      .channel(`track_status_${trackId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tracks", filter: `id=eq.${trackId}` },
        (payload: any) => {
          const next = payload.new;
          const status = normalizeStatus(next?.upload_status);
          setState({ status, updatedAt: next?.updated_at ?? null });

          // Auto-unsubscribe quando finalizar
          if (status === "completed" || status === "error") {
            supabase.removeChannel(channel);
            channelRef.current = null;
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  return { ...state, refresh };
}

function normalizeStatus(value?: string | null): ServerAnalysisStatus {
  switch ((value || "").toLowerCase()) {
    case "pending":
      return "pending";
    case "processing":
      return "processing";
    case "completed":
      return "completed";
    case "error":
      return "error";
    default:
      return "unknown";
  }
}
