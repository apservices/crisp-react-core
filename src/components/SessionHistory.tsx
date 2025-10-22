import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDJSessions } from "@/hooks/useDJSessions";
import { SessionViewer } from "./SessionViewer";
import { 
  History, 
  Clock, 
  Music, 
  Play, 
  Trash2, 
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SessionHistory() {
  const { sessions, loading, deleteSession, stats } = useDJSessions();
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getEnergyFlowBadge = (flow: string) => {
    const variants = {
      ascending: { emoji: '📈', label: 'Crescente', variant: 'default' as const },
      descending: { emoji: '📉', label: 'Decrescente', variant: 'secondary' as const },
      wave: { emoji: '🌊', label: 'Variado', variant: 'outline' as const }
    };
    return variants[flow as keyof typeof variants] || variants.wave;
  };

  if (selectedSession) {
    return (
      <SessionViewer 
        session={selectedSession} 
        onBack={() => setSelectedSession(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Estatísticas RemiXer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Sessões</p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {formatDuration(stats.totalDuration)}
              </p>
              <p className="text-xs text-muted-foreground">Tempo Total</p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <p className="text-2xl font-bold text-primary">{stats.totalTracks}</p>
              <p className="text-xs text-muted-foreground">Tracks Mixadas</p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {formatDuration(stats.avgSessionDuration)}
              </p>
              <p className="text-xs text-muted-foreground">Duração Média</p>
            </div>
          </div>

          {stats.mostUsedTrack && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Track Favorita
                </h4>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="font-medium">{stats.mostUsedTrack.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.mostUsedTrack.artist} • {stats.mostUsedTrack.count}x mixada
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista de Sessões */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Sessões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhuma sessão registrada</p>
              <p className="text-sm text-muted-foreground">
                Crie seu primeiro Quick Mix para começar!
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-4 bg-background/50 rounded-lg space-y-3">
                {/* Header da Sessão */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{session.session_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.created_at), "dd/MM/yyyy 'às' HH:mm", { 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSession(session.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Metadados */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDuration(session.duration || 0)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Music className="h-3 w-3 text-muted-foreground" />
                    <span>{session.tracks_mixed || 0} tracks</span>
                  </div>

                  {session.session_data?.average_bpm && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span>{session.session_data.average_bpm} BPM</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  {session.session_data?.energy_flow && (
                    <Badge 
                      variant={getEnergyFlowBadge(session.session_data.energy_flow).variant}
                      className="text-xs"
                    >
                      {getEnergyFlowBadge(session.session_data.energy_flow).emoji}
                      {getEnergyFlowBadge(session.session_data.energy_flow).label}
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="text-xs">
                    Quick Mix
                  </Badge>
                </div>

                {/* Botão para visualizar */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedSession(session)}
                  className="w-full"
                >
                  <Play className="h-3 w-3 mr-2" />
                  Ver Detalhes da Sessão
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}