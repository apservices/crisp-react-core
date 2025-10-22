
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InsightsDashboard from "@/components/InsightsDashboard";
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, Zap } from "lucide-react";

export default function Trends() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-heading-xl text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-neon-teal" />
              Analytics & Trends
            </h1>
            <Badge variant="outline" className="text-neon-teal border-neon-teal/30">
              Tempo Real
            </Badge>
          </div>

          {/* View Tabs */}
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 text-xs"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              className="flex items-center gap-2 text-xs"
            >
              <Calendar className="h-4 w-4" />
              Semanal
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 text-xs"
            >
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <TabsContent value="dashboard" className="mt-0">
          <InsightsDashboard />
        </TabsContent>

        <TabsContent value="weekly" className="mt-0">
          <div className="space-y-6">
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-neon-violet" />
                Relatório Semanal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uploads</span>
                    <span className="text-sm font-medium text-neon-blue">+12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sessões RemiXer</span>
                    <span className="text-sm font-medium text-neon-violet">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tempo Total</span>
                    <span className="text-sm font-medium text-neon-teal">4.2h</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">BPM Médio</span>
                    <span className="text-sm font-medium text-neon-green">128</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gênero Top</span>
                    <span className="text-sm font-medium text-neon-pink">House</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Energia Média</span>
                    <span className="text-sm font-medium text-neon-blue">7.2/10</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Weekly Goals */}
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Metas da Semana
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-neon-blue" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>Upload de Tracks</span>
                      <span className="text-muted-foreground">8/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div className="bg-neon-blue h-2 rounded-full w-4/5" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-neon-violet" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>Sessões de Mix</span>
                      <span className="text-muted-foreground">5/7</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div className="bg-neon-violet h-2 rounded-full w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Community Trends */}
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Tendências da Comunidade
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                    <span className="text-sm text-foreground">Deep House em alta</span>
                  </div>
                  <Badge variant="outline" className="text-neon-blue border-neon-blue/30">
                    +45%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neon-violet animate-pulse" />
                    <span className="text-sm text-foreground">BPM 126-130 popular</span>
                  </div>
                  <Badge variant="outline" className="text-neon-violet border-neon-violet/30">
                    Trending
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neon-teal animate-pulse" />
                    <span className="text-sm text-foreground">Key Dm/Fm compatíveis</span>
                  </div>
                  <Badge variant="outline" className="text-neon-teal border-neon-teal/30">
                    Mix Ready
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <div className="space-y-6">
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-neon-green" />
                Performance Metrics
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Upload Performance */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Upload Quality Score</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Qualidade Média</span>
                        <span className="text-neon-green font-medium">9.2/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className="bg-gradient-to-r from-neon-green to-neon-teal h-3 rounded-full" 
                             style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-neon-blue font-heading">98%</div>
                      <div className="text-xs text-muted-foreground">Metadata</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-neon-violet font-heading">95%</div>
                      <div className="text-xs text-muted-foreground">Audio Quality</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-neon-teal font-heading">87%</div>
                      <div className="text-xs text-muted-foreground">Tagging</div>
                    </div>
                  </div>
                </div>

                {/* Consistency Score */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Consistency Score</h4>
                  <div className="text-center py-6">
                    <div className="text-4xl font-bold text-neon-violet font-heading mb-2">
                      8.7
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Score de Consistência
                    </div>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                        <div 
                          key={i} 
                          className={`w-2 h-8 rounded-sm ${
                            i <= 8 ? 'bg-neon-violet' : 'bg-muted'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="glass border-glass-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Conquistas Recentes
              </h3>
              <div className="space-y-3">
                {[
                  { 
                    title: "10 Tracks Milestone", 
                    description: "Uploaded your first 10 tracks", 
                    color: "neon-blue",
                    earned: true
                  },
                  { 
                    title: "Mix Master", 
                    description: "Created 5 perfect mixes", 
                    color: "neon-violet",
                    earned: true
                  },
                  { 
                    title: "Genre Explorer", 
                    description: "Explored 5 different genres", 
                    color: "neon-teal",
                    earned: false
                  }
                ].map((achievement, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      achievement.earned 
                        ? 'bg-card border-border' 
                        : 'bg-muted/20 border-muted opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-${achievement.color} flex items-center justify-center`}>
                      <Zap className="h-4 w-4 text-background" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                    {achievement.earned && (
                      <Badge variant="outline" className="text-neon-green border-neon-green/30">
                        Conquistado
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </div>
      </Tabs>
    </div>
  );
}
