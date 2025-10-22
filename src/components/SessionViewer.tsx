import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Music, 
  Clock, 
  Activity, 
  TrendingUp,
  ArrowRight,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SessionViewerProps {
  session: any;
  onBack: () => void;
}

export function SessionViewer({ session, onBack }: SessionViewerProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const getTransitionIcon = (type: string) => {
    switch (type) {
      case 'fade': return '🎚️';
      case 'cut': return '✂️';
      case 'filter': return '🎛️';
      default: return '🎵';
    }
  };

  const getEnergyFlowIcon = (flow: string) => {
    switch (flow) {
      case 'ascending': return '📈';
      case 'descending': return '📉';
      case 'wave': return '🌊';
      default: return '🎢';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const sessionData = session.session_data || {};
  const tracks = sessionData.tracks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                {session.session_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {format(new Date(session.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas da Sessão */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <p className="text-xl font-bold text-primary">
                {formatDuration(session.duration || 0)}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Duração Total
              </p>
            </div>
            
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <p className="text-xl font-bold text-primary">
                {session.tracks_mixed || 0}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Music className="h-3 w-3" />
                Tracks
              </p>
            </div>
            
            {sessionData.average_bpm && (
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <p className="text-xl font-bold text-primary">
                  {sessionData.average_bpm} BPM
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Activity className="h-3 w-3" />
                  BPM Médio
                </p>
              </div>
            )}
            
            {sessionData.energy_flow && (
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <p className="text-xl">
                  {getEnergyFlowIcon(sessionData.energy_flow)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sessionData.energy_flow === 'ascending' ? 'Crescente' : 
                   sessionData.energy_flow === 'descending' ? 'Decrescente' : 'Variado'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tracklist Detalhada */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Tracklist & Transições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tracks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma informação de tracks disponível
            </p>
          ) : (
            tracks.map((track: any, index: number) => (
              <div key={index} className="space-y-3">
                {/* Track Info */}
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    {track.match_score && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getMatchScoreColor(track.match_score)}`}
                      >
                        {track.match_score}% match
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Transição (exceto na última track) */}
                {index < tracks.length - 1 && track.transition_type && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <span className="text-sm">
                        {getTransitionIcon(track.transition_type)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium uppercase">
                        {track.transition_type}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Metadados Técnicos */}
      {sessionData.generated_at && (
        <Card className="glass border-primary/20">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-1">
              <h4 className="font-medium text-foreground">Informações Técnicas</h4>
              <p>• Gerado em: {format(new Date(sessionData.generated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              <p>• Algoritmo: Quick Mix Engine v1.0</p>
              <p>• Critérios: BPM, Harmonia e Energia</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}