
import { useState, useEffect, useCallback } from "react";
import { useTracks } from "@/hooks/useTracks";
import { useInsights } from "@/hooks/useInsights";
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedAudioUploadDialog } from "@/components/EnhancedAudioUploadDialog";
import { MultiFileUploadDialog } from "@/components/MultiFileUploadDialog";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Music, Zap, Plus, Upload, Crown, Star, BarChart3, TrendingUp, Clock, Headphones } from "lucide-react";
import { Link } from 'react-router-dom';

export default function Home() {
  const { tracks, loading, refetch: refetchTracks } = useTracks();
  const { insights, loading: insightsLoading, refetch: refetchInsights } = useInsights();
  const { subscription, getTrackLimit, isPro, isExpert, isFree } = useSubscription();
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleUploadSuccess = useCallback(() => {
    // Safely refresh data without full page reload
    refetchTracks?.();
    refetchInsights?.();
  }, [refetchTracks, refetchInsights]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const recentTracks = tracks.slice(0, 3);
  const totalDuration = tracks.reduce((acc, track) => {
    const [min, sec] = track.duration.split(':').map(Number);
    return acc + min + sec / 60;
  }, 0);

  if (loading || insightsLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full animate-glow" />
            <div className="space-y-2">
              <div className="h-4 bg-primary/20 rounded w-32" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-heading-xl text-foreground mb-1">
                {greeting()}, RemiXer 👋
              </h1>
              <p className="text-muted-foreground text-sm">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-heading text-neon-blue">
                RemiXense
              </div>
              <div className="flex items-center gap-1 text-xs">
                {isExpert && <Crown className="h-3 w-3 text-yellow-500" />}
                {isPro && <Star className="h-3 w-3 text-blue-500" />}
                <span className={`${isExpert ? 'text-yellow-500' : isPro ? 'text-blue-500' : 'text-muted-foreground'}`}>
                  {subscription?.plan_type?.toUpperCase() || 'FREE'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-blue font-heading">
                {tracks.length}
                {getTrackLimit() !== -1 && (
                  <span className="text-xs text-muted-foreground">/{getTrackLimit()}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Tracks</div>
            </Card>
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-violet font-heading">
                {Math.round(totalDuration)}m
              </div>
              <div className="text-xs text-muted-foreground">Duração</div>
            </Card>
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-teal font-heading">
                {insights?.mixSessions || 0}
              </div>
              <div className="text-xs text-muted-foreground">Sessões</div>
            </Card>
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-green font-heading">
                {insights?.averageBPM || 0}
              </div>
              <div className="text-xs text-muted-foreground">BPM Médio</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-heading-lg text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-neon-blue" />
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <EnhancedAudioUploadDialog onSuccess={handleUploadSuccess}>
              <Button variant="neon" className="h-16 flex-col gap-2">
                <Plus className="h-6 w-6" />
                Upload Single
              </Button>
            </EnhancedAudioUploadDialog>
            
            <MultiFileUploadDialog onSuccess={handleUploadSuccess}>
              <Button variant="glass" className="h-16 flex-col gap-2">
                <Upload className="h-6 w-6" />
                Upload Múltiplo
              </Button>
            </MultiFileUploadDialog>
          </div>
        </section>

        {/* Recent Activity */}
        {recentTracks.length > 0 && (
          <section>
            <h2 className="text-heading-lg text-foreground mb-4 flex items-center gap-2">
              <Music className="h-5 w-5 text-neon-violet" />
              Atividade Recente
            </h2>
            <div className="space-y-3">
              {recentTracks.map((track) => (
                <Card key={track.id} className="glass border-glass-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 glass rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {track.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={
                          track.type === 'track' ? 'text-neon-blue border-neon-blue/30' :
                          track.type === 'remix' ? 'text-neon-violet border-neon-violet/30' :
                          'text-neon-teal border-neon-teal/30'
                        }
                      >
                        {track.type}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {track.duration}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Quick Insights */}
        {insights && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-lg text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-teal" />
                Insights Rápidos
              </h2>
              <Link to="/explorer">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Completo
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="glass border-glass-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-neon-blue" />
                  <span className="text-sm font-medium">Tempo Total</span>
                </div>
                <div className="text-xl font-bold text-neon-blue font-heading">
                  {Math.round(insights.totalListeningTime / 60)}h
                </div>
                <div className="text-xs text-muted-foreground">
                  de áudio analisado
                </div>
              </Card>
              
              <Card className="glass border-glass-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="h-4 w-4 text-neon-violet" />
                  <span className="text-sm font-medium">Gênero Favorito</span>
                </div>
                <div className="text-xl font-bold text-neon-violet font-heading">
                  {insights.trackAnalytics.favoriteGenre || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                  mais tocado
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Upgrade Prompt for Free Users */}
        {isFree && tracks.length >= 2 && (
          <section>
            <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
              <div className="text-center">
                <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-500/20">
                  <Star className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Desbloqueie todo o potencial do RemiXense
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Você já usou {tracks.length} de 3 uploads gratuitos. Upgrade para PRO e tenha uploads ilimitados, 
                  exportação para plataformas e muito mais!
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/pricing">
                    <Button variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      <Crown className="h-4 w-4 mr-2" />
                      Ver Planos
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Getting Started */}
        {tracks.length === 0 && (
          <section className="text-center py-12">
            <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="h-10 w-10 text-primary animate-glow" />
            </div>
            <h2 className="text-heading-lg text-foreground mb-2">
              Bem-vindo ao RemiXense
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Sua plataforma profissional para criação, análise e performance musical. 
              Comece fazendo upload do seu primeiro track.
            </p>
            <EnhancedAudioUploadDialog onSuccess={handleUploadSuccess}>
              <Button variant="neon" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Fazer Primeiro Upload
              </Button>
            </EnhancedAudioUploadDialog>
          </section>
        )}
      </div>
      
      <PWAInstallPrompt />
    </div>
  );
}
