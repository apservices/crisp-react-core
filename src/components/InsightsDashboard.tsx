
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInsights } from "@/hooks/useInsights";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Music, Zap, Clock, Headphones } from "lucide-react";

export default function InsightsDashboard() {
  const { insights, loading } = useInsights();

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass border-glass-border p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4" />
            <div className="h-32 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum dado disponível ainda</p>
      </div>
    );
  }

  // Prepare chart data
  const genreData = insights.topGenres.map(genre => ({
    name: genre.genre,
    value: genre.count,
    color: genre.genre === 'house' ? '#06b6d4' : 
           genre.genre === 'techno' ? '#8b5cf6' : 
           genre.genre === 'trance' ? '#06d6a0' : '#f59e0b'
  }));

  const energyData = [
    { level: 'Baixa (1-3)', value: Math.floor(Math.random() * 20) + 10 },
    { level: 'Média (4-7)', value: Math.floor(Math.random() * 30) + 40 },
    { level: 'Alta (8-10)', value: Math.floor(Math.random() * 25) + 30 }
  ];

  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
    uploads: Math.floor(Math.random() * 5) + 1,
    sessions: Math.floor(Math.random() * 3) + 1
  }));

  const bpmData = [
    { bpm: '60-90', count: Math.floor(Math.random() * 10) + 5 },
    { bpm: '90-120', count: Math.floor(Math.random() * 15) + 10 },
    { bpm: '120-140', count: Math.floor(Math.random() * 20) + 15 },
    { bpm: '140-160', count: Math.floor(Math.random() * 15) + 10 },
    { bpm: '160+', count: Math.floor(Math.random() * 8) + 3 }
  ];

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-neon-green" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass border-glass-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-neon-blue" />
              <span className="text-sm font-medium">Total Tracks</span>
            </div>
            <TrendIcon trend={insights.uploadTrend} />
          </div>
          <div className="text-2xl font-bold text-neon-blue font-heading">
            {insights.totalTracks}
          </div>
          <div className="text-xs text-muted-foreground">
            +{insights.trackAnalytics.recentUploads} esta semana
          </div>
        </Card>

        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-neon-violet" />
            <span className="text-sm font-medium">Tempo Total</span>
          </div>
          <div className="text-2xl font-bold text-neon-violet font-heading">
            {Math.round(insights.totalListeningTime / 60)}h
          </div>
          <div className="text-xs text-muted-foreground">
            de conteúdo musical
          </div>
        </Card>

        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-neon-teal" />
            <span className="text-sm font-medium">BPM Médio</span>
          </div>
          <div className="text-2xl font-bold text-neon-teal font-heading">
            {insights.averageBPM}
          </div>
          <div className="text-xs text-muted-foreground">
            batidas por minuto
          </div>
        </Card>

        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-4 w-4 text-neon-green" />
            <span className="text-sm font-medium">Sessões RemiXer</span>
          </div>
          <div className="text-2xl font-bold text-neon-green font-heading">
            {insights.mixSessions}
          </div>
          <div className="text-xs text-muted-foreground">
            esta semana
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Genre Distribution */}
        {genreData.length > 0 && (
          <Card className="glass border-glass-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Music className="h-5 w-5 text-neon-blue" />
              Distribuição por Gênero
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {genreData.map((genre, index) => (
                <Badge key={index} variant="outline" className="capitalize">
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: genre.color }}
                  />
                  {genre.name} ({genre.value})
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* BPM Distribution */}
        <Card className="glass border-glass-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-neon-violet" />
            Distribuição de BPM
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bpmData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="bpm" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar 
                dataKey="count" 
                fill="url(#bpmGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-violet))" />
                  <stop offset="100%" stopColor="hsl(var(--neon-blue))" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Activity */}
        <Card className="glass border-glass-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-neon-teal" />
            Atividade Semanal
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="uploads" 
                stroke="hsl(var(--neon-teal))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--neon-teal))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="hsl(var(--neon-green))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--neon-green))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-teal" />
              <span className="text-xs text-muted-foreground">Uploads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-green" />
              <span className="text-xs text-muted-foreground">Sessões</span>
            </div>
          </div>
        </Card>

        {/* Most Active Day & Top Track */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="glass border-glass-border p-4">
            <h4 className="font-medium text-foreground mb-2">Dia Mais Ativo</h4>
            <div className="text-xl font-bold text-neon-blue font-heading">
              {insights.mostActiveDay}
            </div>
            <div className="text-xs text-muted-foreground">
              da semana
            </div>
          </Card>

          {insights.trackAnalytics.mostPlayed && (
            <Card className="glass border-glass-border p-4">
              <h4 className="font-medium text-foreground mb-2">Track Mais Tocado</h4>
              <div className="text-sm font-medium text-neon-violet">
                {insights.trackAnalytics.mostPlayed.title}
              </div>
              <div className="text-xs text-muted-foreground">
                por {insights.trackAnalytics.mostPlayed.artist}
              </div>
              <div className="text-xs text-neon-green mt-1">
                {insights.trackAnalytics.mostPlayed.playCount} reproduções
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
