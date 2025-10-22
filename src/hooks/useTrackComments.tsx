import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackComment {
  id: string;
  track_id: string;
  user_id: string;
  content: string;
  timestamp_mark?: number;
  type: 'general' | 'cue_point' | 'beatmatch' | 'transition';
  parent_id?: string;
  is_resolved?: boolean;
  color_code?: string;
  created_at: string;
  updated_at: string;
}

export function useTrackComments(trackId: string) {
  const [comments, setComments] = useState<TrackComment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('track_comments')
        .select('*')
        .eq('track_id', trackId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []) as TrackComment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários da track",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, timestampMark?: number, type: TrackComment['type'] = 'general', parentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('track_comments')
        .insert({
          track_id: trackId,
          user_id: user.id,
          content,
          timestamp_mark: timestampMark,
          type,
          parent_id: parentId
        })
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data as TrackComment]);
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi salvo com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: error instanceof Error ? error.message : "Falha ao salvar comentário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateComment = async (commentId: string, updates: Partial<Pick<TrackComment, 'content' | 'is_resolved'>>) => {
    try {
      const { data, error } = await supabase
        .from('track_comments')
        .update(updates)
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;

      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, ...(data as TrackComment) } : comment
      ));

      toast({
        title: "Comentário atualizado",
        description: "As alterações foram salvas com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Erro ao atualizar comentário",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('track_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "Comentário removido",
        description: "O comentário foi excluído com sucesso"
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao remover comentário",
        description: "Não foi possível excluir o comentário",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (trackId) {
      fetchComments();
    }
  }, [trackId]);

  return {
    comments,
    loading,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments
  };
}