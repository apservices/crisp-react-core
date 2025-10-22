import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useMixEngine } from "@/hooks/useMixEngine";
import { useHarmonyEngine } from "@/hooks/useHarmonyEngine";
import { 
  Zap, 
  Play, 
  Save, 
  Music, 
  Clock, 
  Activity, 
  TrendingUp,
  ArrowRight,
  Shuffle,
  Brain,
  Target
} from "lucide-react";

interface QuickMixEngineProps {
  onClose?: () => void;
}

export function QuickMixEngine({ onClose }: QuickMixEngineProps) {
  const { 
    generateQuickMix, 
    saveMixAsSession, 
    isGenerating, 
    availableTracksCount,
    totalTracksCount 
  } = useMixEngine();
  
  const { isAnalyzing: harmonyAnalyzing } = useHarmonyEngine();
  
  const [mixResult, setMixResult] = useState<any>(null);
  const [sessionName, setSessionName] = useState("");
  const [maxTracks, setMaxTracks] = useState(4);

  const handleGenerateMix = async () => {
    const result = await generateQuickMix(maxTracks);
    if (result) {
      setMixResult(result);
      setSessionName(`Quick Mix ${new Date().toLocaleDateString()}`);
    }
  };

  const handleSaveSession = async () => {
    if (mixResult && sessionName.trim()) {
      const success = await saveMixAsSession(mixResult, sessionName.trim());
      if (success) {
        setMixResult(null);
        setSessionName("");
        onClose?.();
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Mix Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{availableTracksCount}</p>
              <p className="text-xs text-muted-foreground">Com BPM</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{totalTracksCount}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{maxTracks}</p>
              <p className="text-xs text-muted-foreground">No Mix</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <label className="text-sm font-medium">
              Número de tracks no mix: {maxTracks}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={maxTracks}
              onChange={(e) => setMaxTracks(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <Button
            onClick={handleGenerateMix}
            disabled={isGenerating || harmonyAnalyzing || availableTracksCount < 2}
            className="w-full"
            size="lg"
          >
            {isGenerating || harmonyAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                IA analisando harmonia...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Gerar Quick Mix IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado do Mix */}
      {mixResult && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Mix Gerado
              </span>
              <Badge variant="secondary" className="flex items-center gap-1">
                {getEnergyFlowIcon(mixResult.energyFlow)}
                {mixResult.energyFlow === 'ascending' ? 'Crescente' : 
                 mixResult.energyFlow === 'descending' ? 'Decrescente' : 'Variado'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estatísticas do Mix */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">
                  {formatDuration(mixResult.totalDuration)}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duração Total
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">
                  {mixResult.averageBpm} BPM
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Activity className="h-3 w-3" />
                  BPM Médio
                </p>
              </div>
            </div>

            {/* Lista de Tracks */}
            <div className="space-y-2">
              {mixResult.tracks.map((item: any, index: number) => (
                <div key={item.track.id} className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.track.artist}
                      </p>
                    </div>

                    <div className="text-right text-sm space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {item.track.bpm} BPM
                        </Badge>
                        {item.compatibilityScore && (
                          <Badge 
                            variant={item.compatibilityScore > 80 ? "default" : item.compatibilityScore > 60 ? "secondary" : "destructive"} 
                            className="text-xs"
                          >
                            <Target className="h-2 w-2 mr-1" />
                            {item.compatibilityScore}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.track.duration}
                      </p>
                    </div>
                  </div>

                  {/* Transição (exceto na última track) */}
                  {index < mixResult.tracks.length - 1 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-sm">
                          {getTransitionIcon(mixResult.tracks[index + 1].transitionType)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium">
                          {mixResult.tracks[index + 1].transitionType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Salvar como Sessão */}
            <div className="space-y-3">
              <Input
                placeholder="Nome da sessão..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="glass"
              />
              
              <Button
                onClick={handleSaveSession}
                disabled={!sessionName.trim()}
                className="w-full"
                variant="secondary"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar como Sessão RemiXer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info sobre algoritmo */}
      <Card className="glass border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Como funciona a IA Musical
            </h4>
            <ul className="space-y-1 text-xs">
              <li>• <strong>BPM Matching:</strong> Analisa compatibilidade rítmica com Web Audio API</li>
              <li>• <strong>Harmonic Mixing:</strong> Detecta keys e sugere combinações Camelot</li>
              <li>• <strong>Energy Flow:</strong> Cria curva de energia e danceability inteligente</li>
              <li>• <strong>Smart Transitions:</strong> IA sugere fade, cut, filter baseado em instrumentos</li>
              <li>• <strong>Audio Fingerprint:</strong> Evita duplicações e detecta samples</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}