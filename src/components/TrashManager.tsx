import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Trash2,
  RotateCcw,
  Search,
  Calendar,
  FileAudio,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Track } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrashManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrashManager({ isOpen, onClose }: TrashManagerProps) {
  const [deletedTracks, setDeletedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'restore' | 'permanent'>('restore');
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load deleted tracks
  const loadDeletedTracks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedTracks((data as Track[]) || []);
    } catch (error) {
      console.error('Failed to load deleted tracks:', error);
      toast({
        title: "Erro ao carregar lixeira",
        description: "Falha ao carregar tracks excluídos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDeletedTracks();
    }
  }, [isOpen, user]);

  // Filter tracks based on search
  const filteredTracks = deletedTracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Restore track
  const restoreTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ deleted_at: null })
        .eq('id', trackId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setDeletedTracks(prev => prev.filter(t => t.id !== trackId));
      setSelectedTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });

      toast({
        title: "Track restaurado",
        description: "O track foi restaurado com sucesso.",
      });
    } catch (error) {
      console.error('Failed to restore track:', error);
      toast({
        title: "Erro ao restaurar",
        description: "Falha ao restaurar o track.",
        variant: "destructive",
      });
    }
  };

  // Permanently delete track
  const permanentlyDeleteTrack = async (trackId: string) => {
    try {
      // Get track data to find file path
      const track = deletedTracks.find(t => t.id === trackId);
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId)
        .eq('user_id', user?.id);

      if (dbError) throw dbError;

      // Delete file from storage if exists
      if (track?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('tracks')
          .remove([track.file_path]);
        
        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
        }
      }

      setDeletedTracks(prev => prev.filter(t => t.id !== trackId));
      setSelectedTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });

      toast({
        title: "Track excluído permanentemente",
        description: "O track foi excluído permanentemente.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Failed to permanently delete track:', error);
      toast({
        title: "Erro ao excluir",
        description: "Falha ao excluir permanentemente o track.",
        variant: "destructive",
      });
    }
  };

  // Bulk operations
  const handleBulkAction = async () => {
    if (selectedTracks.size === 0) return;

    try {
      if (confirmAction === 'restore') {
        for (const trackId of selectedTracks) {
          await restoreTrack(trackId);
        }
      } else {
        for (const trackId of selectedTracks) {
          await permanentlyDeleteTrack(trackId);
        }
      }
    } finally {
      setSelectedTracks(new Set());
      setShowConfirmDialog(false);
    }
  };

  // Toggle track selection
  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  // Auto-cleanup expired tracks (30 days)
  const cleanupExpiredTracks = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredTracks = deletedTracks.filter(track => {
        if (!track.deleted_at) return false;
        const deletedDate = new Date(track.deleted_at);
        return deletedDate < thirtyDaysAgo;
      });

      for (const track of expiredTracks) {
        await permanentlyDeleteTrack(track.id);
      }

      if (expiredTracks.length > 0) {
        toast({
          title: "Limpeza automática",
          description: `${expiredTracks.length} tracks antigos foram excluídos automaticamente.`,
        });
      }
    } catch (error) {
      console.error('Failed to cleanup expired tracks:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[80vh] glass border-glass-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trash2 className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Lixeira</h2>
                  <p className="text-sm text-muted-foreground">
                    {deletedTracks.length} tracks na lixeira
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tracks na lixeira..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {selectedTracks.size > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedTracks.size} selecionados
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmAction('restore');
                      setShowConfirmDialog(true);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setConfirmAction('permanent');
                      setShowConfirmDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={cleanupExpiredTracks}
              >
                Limpar expirados
              </Button>
            </div>

            <Separator className="mb-4" />

            {/* Tracks List */}
            <ScrollArea className="h-96">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="text-center py-8">
                  <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Nenhum track encontrado' : 'A lixeira está vazia'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-3 p-3 glass rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedTracks.has(track.id)}
                        onChange={() => toggleTrackSelection(track.id)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                      />
                      
                      <FileAudio className="h-8 w-8 text-muted-foreground" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">
                            {track.title}
                          </h3>
                          <span className="text-sm text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artist}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Excluído {track.deleted_at && formatDistanceToNow(
                              new Date(track.deleted_at), 
                              { addSuffix: true, locale: ptBR }
                            )}
                          </div>
                          
                          {track.file_size && (
                            <span>{Math.round(track.file_size / 1024 / 1024)} MB</span>
                          )}
                          
                          {track.duration && <span>{track.duration}</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => restoreTrack(track.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => permanentlyDeleteTrack(track.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmAction === 'restore' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Restaurar tracks
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Excluir permanentemente
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'restore' ? (
                `Tem certeza que deseja restaurar ${selectedTracks.size} track(s)? Eles voltarão para sua biblioteca.`
              ) : (
                `Tem certeza que deseja excluir permanentemente ${selectedTracks.size} track(s)? Esta ação NÃO pode ser desfeita.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={confirmAction === 'permanent' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmAction === 'restore' ? 'Restaurar' : 'Excluir permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}