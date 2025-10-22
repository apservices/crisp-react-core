import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Download, ExternalLink, Music, Loader2, CheckCircle, XCircle, Crown } from "lucide-react";

interface ExportDialogProps {
  children: React.ReactNode;
  trackId: string;
  trackTitle: string;
}

interface ExportStatus {
  platform: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export function ExportDialog({ children, trackId, trackTitle }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<Record<string, ExportStatus>>({
    dropbox: { platform: 'Dropbox', status: 'idle' },
    spotify: { platform: 'Spotify', status: 'idle' }
  });
  
  const { user } = useAuth();
  const { canExport } = useSubscription();
  const { toast } = useToast();

  const platforms = [
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Salvar na nuvem',
      icon: '☁️',
      color: 'blue'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Distribuir para streaming',
      icon: '🎵',
      color: 'green'
    }
  ];

  const handleExport = async (platform: string) => {
    if (!canExport()) {
      toast({
        title: "Upgrade necessário",
        description: "Exportação disponível apenas para usuários PRO e EXPERT",
        variant: "destructive"
      });
      return;
    }

    setExportStatus(prev => ({
      ...prev,
      [platform]: { ...prev[platform], status: 'uploading' }
    }));

    try {
      // Create export record
      const { data: exportData, error: exportError } = await supabase
        .from('exports')
        .insert({
          user_id: user?.id,
          track_id: trackId,
          platform: platform,
          status: 'pending',
          metadata: {
            track_title: trackTitle,
            export_date: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (exportError) throw exportError;

      // Call appropriate export function
      const functionName = `export-to-${platform}`;
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          export_id: exportData.id,
          track_id: trackId,
          metadata: {
            title: trackTitle
          }
        }
      });

      if (error) throw error;

      setExportStatus(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: 'success',
          url: data?.url
        }
      }));

      toast({
        title: `✅ Exportado para ${platform}!`,
        description: `"${trackTitle}" foi enviado com sucesso`,
      });

    } catch (error) {
      console.error(`Error exporting to ${platform}:`, error);
      
      setExportStatus(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: 'error',
          error: error.message || 'Erro na exportação'
        }
      }));

      toast({
        title: "Erro na exportação",
        description: `Falha ao exportar para ${platform}`,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Download className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Exportar "{trackTitle}"
          </DialogTitle>
        </DialogHeader>

        {!canExport() ? (
          <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
            <div className="text-center">
              <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Exportação PRO
              </h3>
              <p className="text-muted-foreground mb-4">
                Exporte suas músicas para Dropbox, Spotify e outras plataformas
              </p>
              <Button variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha as plataformas para exportar sua música:
            </p>

            <div className="space-y-3">
              {platforms.map((platform) => {
                const status = exportStatus[platform.id];
                
                return (
                  <Card key={platform.id} className="glass border-glass-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {platform.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {platform.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {platform.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        
                        {status.status === 'success' && status.url ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(status.url, '_blank')}
                          >
                            Abrir
                          </Button>
                        ) : status.status === 'error' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleExport(platform.id)}
                          >
                            Tentar Novamente
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="neon"
                            onClick={() => handleExport(platform.id)}
                            disabled={status.status === 'uploading'}
                          >
                            {status.status === 'uploading' ? 'Enviando...' : 'Exportar'}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {status.status === 'uploading' && (
                      <div className="mt-3">
                        <Progress value={75} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enviando para {platform.name}...
                        </p>
                      </div>
                    )}
                    
                    {status.status === 'success' && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-green-600 border-green-600/30">
                          ✅ Exportado com sucesso
                        </Badge>
                      </div>
                    )}
                    
                    {status.status === 'error' && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-red-600 border-red-600/30">
                          ❌ {status.error || 'Erro na exportação'}
                        </Badge>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="border-t border-glass-border pt-4">
              <p className="text-xs text-muted-foreground text-center">
                💡 Dica: Conecte suas contas nas configurações para exportação mais rápida
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}