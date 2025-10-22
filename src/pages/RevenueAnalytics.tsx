import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, DollarSign, Music, Eye, Clock, Users, Star, Trophy, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface RevenueData {
  platform: string;
  revenue: number;
  streams: number;
  growth: number;
  color: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  originalTrack: string;
  artist: string;
  prize: number;
  participants: number;
  deadline: string;
  status: 'active' | 'voting' | 'completed';
}

export default function RevenueAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canUseMarketplace, isPro, isExpert } = useSubscription();
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const [revenueData] = useState<RevenueData[]>([
    { platform: 'Spotify', revenue: 245.67, streams: 12450, growth: 12.5, color: '#1DB954' },
    { platform: 'Apple Music', revenue: 189.23, streams: 8920, growth: 8.3, color: '#FA243C' },
    { platform: 'YouTube Music', revenue: 134.89, streams: 15670, growth: -2.1, color: '#FF0000' },
    { platform: 'Deezer', revenue: 87.45, streams: 4320, growth: 15.7, color: '#FEAA2D' },
    { platform: 'Amazon Music', revenue: 76.32, streams: 3890, growth: 5.9, color: '#232F3E' }
  ]);

  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Summer Remix Challenge',
      description: 'Remixe esta track de Deep House e concorra a R$ 500',
      originalTrack: 'Sunset Vibes',
      artist: 'DJ Ocean',
      prize: 500,
      participants: 23,
      deadline: '2024-08-30',
      status: 'active'
    },
    {
      id: '2',
      title: 'Techno Madness',
      description: 'Transforme este Progressive em Techno pesado',
      originalTrack: 'Progressive Journey',
      artist: 'TechMaster',
      prize: 750,
      participants: 18,
      deadline: '2024-09-05',
      status: 'active'
    }
  ]);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalStreams = revenueData.reduce((sum, item) => sum + item.streams, 0);
  const avgGrowth = revenueData.reduce((sum, item) => sum + item.growth, 0) / revenueData.length;

  const periods = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: '1y', label: '1 ano' }
  ];

  const tabs = [
    { id: 'analytics', name: 'Análise de Receita', icon: TrendingUp },
    { id: 'challenges', name: 'Desafios de Remix', icon: Trophy }
  ];

  const joinChallenge = (challengeId: string) => {
    toast({
      title: "🏆 Inscrito no desafio!",
      description: "Boa sorte na competição. Envie seu remix até a data limite."
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-heading-xl text-foreground mb-1">
                Analytics & Desafios 📊
              </h1>
              <p className="text-muted-foreground text-sm">
                Acompanhe sua receita e participe de competições criativas
              </p>
            </div>
            <Badge variant={isPro || isExpert ? "default" : "secondary"} className="text-xs">
              {isPro ? "PRO" : isExpert ? "EXPERT" : "FREE"}
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1"
              >
                <tab.icon className="h-3 w-3" />
                {tab.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Revenue Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {!canUseMarketplace() && (
              <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Analytics Exclusivo PRO/EXPERT
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Acesse análises detalhadas de receita, performance por plataforma e insights de crescimento
                    </p>
                    <Button variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                      <Star className="h-4 w-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {canUseMarketplace() && (
              <>
                {/* Period Selector */}
                <div className="flex gap-2 justify-center">
                  {periods.map((period) => (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.value)}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass border-glass-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Receita Total</p>
                          <p className="text-2xl font-bold text-neon-green">
                            R$ {totalRevenue.toFixed(2)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-neon-green" />
                      </div>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs ${avgGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}% vs período anterior
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-glass-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total de Streams</p>
                          <p className="text-2xl font-bold text-neon-blue">
                            {totalStreams.toLocaleString()}
                          </p>
                        </div>
                        <Music className="h-8 w-8 text-neon-blue" />
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-green-500">
                          +8.5% vs período anterior
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-glass-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">RPM Médio</p>
                          <p className="text-2xl font-bold text-neon-violet">
                            R$ {(totalRevenue / totalStreams * 1000).toFixed(3)}
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-neon-violet" />
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          por 1000 reproduções
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform Breakdown */}
                <Card className="glass border-glass-border">
                  <CardHeader>
                    <CardTitle>Performance por Plataforma</CardTitle>
                    <CardDescription>
                      Análise detalhada de receita e crescimento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {revenueData.map((platform) => (
                      <div key={platform.platform} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: platform.color }}
                            />
                            <span className="font-medium">{platform.platform}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">R$ {platform.revenue.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              {platform.streams.toLocaleString()} streams
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(platform.revenue / totalRevenue) * 100} 
                            className="flex-1 h-2"
                          />
                          <span className={`text-xs ${platform.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {platform.growth >= 0 ? '+' : ''}{platform.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Remix Challenges */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Desafios de Remix Ativos
              </h2>
              <p className="text-muted-foreground">
                Participe de competições criativas e ganhe prêmios em dinheiro
              </p>
            </div>

            <div className="space-y-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="glass border-glass-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {challenge.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={challenge.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {challenge.status === 'active' ? 'Ativo' : 'Votação'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {challenge.originalTrack} - {challenge.artist}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {challenge.participants} participantes
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(challenge.deadline).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="text-lg font-bold text-green-500">
                          R$ {challenge.prize}
                        </span>
                        <span className="text-sm text-muted-foreground">prêmio</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ouvir Original
                        </Button>
                        <Button 
                          variant="neon" 
                          size="sm"
                          onClick={() => joinChallenge(challenge.id)}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Participar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* How it Works */}
            <Card className="glass border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Como Funcionam os Desafios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  1. <strong>Inscreva-se</strong> no desafio de sua escolha
                </div>
                <div className="text-sm text-muted-foreground">
                  2. <strong>Baixe</strong> os stems da track original
                </div>
                <div className="text-sm text-muted-foreground">
                  3. <strong>Crie</strong> seu remix único e envie antes do prazo
                </div>
                <div className="text-sm text-muted-foreground">
                  4. <strong>Comunidade vota</strong> nos melhores remixes
                </div>
                <div className="text-sm text-muted-foreground">
                  5. <strong>Vencedores</strong> recebem prêmios em dinheiro e exposição
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}