import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wand2, Music, Download, Play, Pause, Volume2, Star, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

export default function AIStudio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canExport, isPro, isExpert } = useSubscription();
  const [activeTab, setActiveTab] = useState('mastering');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-Mastering AI State
  const [masteringSettings, setMasteringSettings] = useState({
    loudness: [-14],
    dynamics: [50],
    brightness: [50],
    warmth: [50],
    stereoWidth: [50],
    preset: 'balanced'
  });

  // Melody Generator State
  const [melodySettings, setMelodySettings] = useState({
    genre: 'house',
    key: 'C',
    tempo: 128,
    complexity: [60],
    mood: 'energetic',
    length: 16
  });

  // Stem Separator State
  const [stemSettings, setStemSettings] = useState({
    separationType: 'full',
    quality: 'high'
  });

  // Mood Analyzer State
  const [moodResults, setMoodResults] = useState({
    energy: 75,
    valence: 68,
    danceability: 82,
    mood: 'Energético',
    recommendations: []
  });

  const presets = [
    { id: 'balanced', name: 'Balanceado', description: 'Som equilibrado para todas as situações' },
    { id: 'club', name: 'Club', description: 'Otimizado para sistemas de som de club' },
    { id: 'radio', name: 'Rádio', description: 'Compressão para transmissão em rádio' },
    { id: 'streaming', name: 'Streaming', description: 'Otimizado para plataformas digitais' },
    { id: 'vinyl', name: 'Vinyl', description: 'Calor e caráter analógico' }
  ];

  const genres = [
    'house', 'techno', 'trance', 'progressive', 'deep house', 
    'melodic techno', 'ambient', 'downtempo', 'drum & bass'
  ];

  const keys = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];

  const moods = [
    'energetic', 'melancholic', 'uplifting', 'dark', 'romantic', 
    'aggressive', 'peaceful', 'mysterious', 'euphoric'
  ];

  const handleAutoMaster = async () => {
    if (!canExport()) {
      toast({
        title: "Upgrade necessário",
        description: "Auto-Mastering disponível para usuários PRO e EXPERT",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate AI mastering process
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast({
        title: "🎛️ Masterização concluída!",
        description: "Sua faixa foi otimizada com IA avançada"
      });
    } catch (error) {
      console.error('Error in auto-mastering:', error);
      toast({
        title: "Erro na masterização",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleGenerateMelody = async () => {
    setProcessing(true);
    
    try {
      // Simulate melody generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "🎵 Melodia gerada!",
        description: `Nova melodia em ${melodySettings.key} criada com sucesso`
      });
    } catch (error) {
      console.error('Error generating melody:', error);
      toast({
        title: "Erro na geração",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSeparateStems = async () => {
    setProcessing(true);
    
    try {
      // Simulate stem separation
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast({
        title: "🎛️ Stems separados!",
        description: "Vocais, bateria, baixo e melodia isolados com sucesso"
      });
    } catch (error) {
      console.error('Error separating stems:', error);
      toast({
        title: "Erro na separação",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'mastering', name: 'Auto-Mastering', icon: Volume2 },
    { id: 'melody', name: 'Gerador de Melodia', icon: Music },
    { id: 'stems', name: 'Stem-Swap', icon: Wand2 },
    { id: 'mood', name: 'Análise de Mood', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-heading-xl text-foreground mb-1">
                Estúdio de IA 🎛️
              </h1>
              <p className="text-muted-foreground text-sm">
                Ferramentas avançadas de inteligência artificial para produção musical
              </p>
            </div>
            <Badge variant={isPro || isExpert ? "default" : "secondary"} className="text-xs">
              {isPro ? "PRO" : isExpert ? "EXPERT" : "FREE"}
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1 whitespace-nowrap"
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
        {/* Auto-Mastering AI */}
        {activeTab === 'mastering' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Auto-Mastering AI
                </CardTitle>
                <CardDescription>
                  Masterização automática com IA para som profissional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preset Selection */}
                <div className="space-y-2">
                  <Label>Preset de Masterização</Label>
                  <Select 
                    value={masteringSettings.preset} 
                    onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, preset: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          <div>
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">{preset.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Audio Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loudness (LUFS)</Label>
                    <Slider
                      value={masteringSettings.loudness}
                      onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, loudness: value }))}
                      min={-24}
                      max={-6}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {masteringSettings.loudness[0]} LUFS
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dinâmica</Label>
                    <Slider
                      value={masteringSettings.dynamics}
                      onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, dynamics: value }))}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {masteringSettings.dynamics[0]}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Brilho</Label>
                    <Slider
                      value={masteringSettings.brightness}
                      onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, brightness: value }))}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {masteringSettings.brightness[0]}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Calor</Label>
                    <Slider
                      value={masteringSettings.warmth}
                      onValueChange={(value) => setMasteringSettings(prev => ({ ...prev, warmth: value }))}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {masteringSettings.warmth[0]}%
                    </div>
                  </div>
                </div>

                {processing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Processando...</span>
                      <span className="text-sm">{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <Button 
                  onClick={handleAutoMaster}
                  disabled={processing || !canExport()}
                  className="w-full"
                  variant="neon"
                >
                  {processing ? "Masterizando..." : "Iniciar Auto-Mastering"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Melody Generator */}
        {activeTab === 'melody' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Gerador de Melodia IA
                </CardTitle>
                <CardDescription>
                  Crie melodias e harmonias originais com inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gênero</Label>
                    <Select 
                      value={melodySettings.genre} 
                      onValueChange={(value) => setMelodySettings(prev => ({ ...prev, genre: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre.charAt(0).toUpperCase() + genre.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tonalidade</Label>
                    <Select 
                      value={melodySettings.key} 
                      onValueChange={(value) => setMelodySettings(prev => ({ ...prev, key: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {keys.map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>BPM</Label>
                    <Input
                      type="number"
                      value={melodySettings.tempo}
                      onChange={(e) => setMelodySettings(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                      min={60}
                      max={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mood</Label>
                    <Select 
                      value={melodySettings.mood} 
                      onValueChange={(value) => setMelodySettings(prev => ({ ...prev, mood: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {moods.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Complexidade</Label>
                  <Slider
                    value={melodySettings.complexity}
                    onValueChange={(value) => setMelodySettings(prev => ({ ...prev, complexity: value }))}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {melodySettings.complexity[0]}% complexidade
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateMelody}
                  disabled={processing}
                  className="w-full"
                  variant="neon"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {processing ? "Gerando..." : "Gerar Melodia"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stem Separator */}
        {activeTab === 'stems' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Stem-Swap Automatizado
                </CardTitle>
                <CardDescription>
                  Separe e manipule elementos individuais de suas faixas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Separação</Label>
                    <Select 
                      value={stemSettings.separationType} 
                      onValueChange={(value) => setStemSettings(prev => ({ ...prev, separationType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Completa (4 stems)</SelectItem>
                        <SelectItem value="vocals">Apenas Vocais</SelectItem>
                        <SelectItem value="drums">Apenas Bateria</SelectItem>
                        <SelectItem value="bass">Apenas Baixo</SelectItem>
                        <SelectItem value="melody">Apenas Melodia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Qualidade</Label>
                    <Select 
                      value={stemSettings.quality} 
                      onValueChange={(value) => setStemSettings(prev => ({ ...prev, quality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Rápida</SelectItem>
                        <SelectItem value="balanced">Balanceada</SelectItem>
                        <SelectItem value="high">Alta Qualidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Stems Disponíveis:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Vocais', 'Bateria', 'Baixo', 'Melodia'].map((stem, index) => (
                      <div key={stem} className="flex items-center justify-between p-3 glass rounded-lg">
                        <span className="text-sm">{stem}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSeparateStems}
                  disabled={processing}
                  className="w-full"
                  variant="neon"
                >
                  {processing ? "Processando..." : "Separar Stems"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mood Analyzer */}
        {activeTab === 'mood' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="glass border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Análise de Mood
                </CardTitle>
                <CardDescription>
                  Analise o conteúdo emocional e a atmosfera das suas músicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 glass rounded-lg">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-lg font-semibold mb-2">Mood Detectado</h3>
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    {moodResults.mood}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Energia</span>
                      <span className="text-sm">{moodResults.energy}%</span>
                    </div>
                    <Progress value={moodResults.energy} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Valência (Positividade)</span>
                      <span className="text-sm">{moodResults.valence}%</span>
                    </div>
                    <Progress value={moodResults.valence} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Dançabilidade</span>
                      <span className="text-sm">{moodResults.danceability}%</span>
                    </div>
                    <Progress value={moodResults.danceability} className="w-full" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recomendações de IA:</h4>
                  <div className="space-y-2">
                    <div className="p-3 glass rounded-lg text-sm">
                      💡 Adicione mais elementos de percussão para aumentar a energia
                    </div>
                    <div className="p-3 glass rounded-lg text-sm">
                      🎹 Progressões menores podem intensificar a atmosfera
                    </div>
                    <div className="p-3 glass rounded-lg text-sm">
                      🔊 Considere um breakdown para criar contraste dinâmico
                    </div>
                  </div>
                </div>

                <Button variant="neon" className="w-full">
                  Analisar Nova Faixa
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade Notice for Free Users */}
        {!isPro && !isExpert && (
          <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 mt-8 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-500/20">
                  <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Desbloqueie o Poder Total da IA
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Usuários PRO e EXPERT têm acesso completo a todas as ferramentas de IA, 
                  processamento em alta qualidade e recursos avançados de produção.
                </p>
                <Button variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Star className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}