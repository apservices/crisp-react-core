import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  MoreHorizontal,
  Play,
  Heart,
  MessageSquare,
  Share2,
  Download,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Track } from '@/types';

interface EnhancedTrackActionsProps {
  track: Track;
  onPlay?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: (permanent?: boolean) => Promise<void>;
  onRestore?: () => Promise<void>;
  isLiked?: boolean;
  isDeleted?: boolean;
  showExtended?: boolean;
}

export function EnhancedTrackActions({
  track,
  onPlay,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onRestore,
  isLiked = false,
  isDeleted = false,
  showExtended = true,
}: EnhancedTrackActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (permanent = false) => {
    if (!onDelete) return;

    setIsLoading(true);
    try {
      await onDelete(permanent);
      
      toast({
        title: permanent ? "Track excluído permanentemente" : "Track movido para lixeira",
        description: permanent 
          ? `${track.title} foi excluído permanentemente.`
          : `${track.title} foi movido para a lixeira. Pode ser restaurado por 30 dias.`,
        variant: permanent ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Falha ao excluir track",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setShowPermanentDeleteDialog(false);
    }
  };

  const handleRestore = async () => {
    if (!onRestore) return;

    setIsLoading(true);
    try {
      await onRestore();
      toast({
        title: "Track restaurado",
        description: `${track.title} foi restaurado com sucesso.`,
      });
    } catch (error) {
      console.error('Restore failed:', error);
      toast({
        title: "Erro ao restaurar",
        description: error instanceof Error ? error.message : "Falha ao restaurar track",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick actions (always visible)
  const quickActions = (
    <div className="flex items-center gap-1">
      {onPlay && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlay}
          className="h-8 w-8 p-0 hover:bg-primary/20"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      
      {onLike && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      )}
    </div>
  );

  // Extended actions dropdown
  const extendedActions = showExtended && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isLoading}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {!isDeleted ? (
          <>
            {onComment && (
              <DropdownMenuItem onClick={onComment}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Comentários
              </DropdownMenuItem>
            )}
            
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
              <Archive className="h-4 w-4 mr-2" />
              Mover para lixeira
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setShowPermanentDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir permanentemente
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {onRestore && (
              <DropdownMenuItem onClick={handleRestore} disabled={isLoading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={() => setShowPermanentDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir permanentemente
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className="flex items-center gap-1">
        {quickActions}
        {extendedActions}
        
        {/* Status badges */}
        {isDeleted && (
          <Badge variant="destructive" className="text-xs ml-2">
            Lixeira
          </Badge>
        )}
        
        {track.upload_status === 'processing' && (
          <Badge variant="secondary" className="text-xs ml-2">
            Processando
          </Badge>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-warning" />
              Mover para lixeira
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mover "{track.title}" para a lixeira? 
              O arquivo poderá ser restaurado nos próximos 30 dias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(false)}
              disabled={isLoading}
            >
              {isLoading ? "Movendo..." : "Mover para lixeira"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  Tem certeza que deseja excluir "{track.title}" permanentemente? 
                </p>
                <p className="font-semibold text-destructive">
                  Esta ação NÃO pode ser desfeita. O arquivo e todos os dados associados serão perdidos para sempre.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(true)}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}