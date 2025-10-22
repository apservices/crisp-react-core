import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Palette, Layout, Download, Share2, Eye, Wand2, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

export default function LandingPageGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canExport, isPro, isExpert } = useSubscription();
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    artistName: '',
    releaseTitle: '',
    releaseDate: '',
    description: '',
    genre: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    youtubeUrl: '',
    template: 'modern',
    colorScheme: 'neon'
  });

  const templates = [
    { id: 'modern', name: 'Modern Minimal', description: 'Design limpo e moderno' },
    { id: 'dark', name: 'Dark Electronic', description: 'Tema escuro para música eletrônica' },
    { id: 'vibrant', name: 'Vibrant Pop', description: 'Cores vibrantes e energéticas' },
    { id: 'retro', name: 'Retro Wave', description: 'Estilo retrô anos 80' },
    { id: 'minimal', name: 'Ultra Minimal', description: 'Foco total no conteúdo' }
  ];

  const colorSchemes = [
    { id: 'neon', name: 'Neon Glow', colors: ['#00ff88', '#0099ff', '#ff0066'] },
    { id: 'sunset', name: 'Sunset Vibes', colors: ['#ff6b35', '#f7931e', '#ffcc02'] },
    { id: 'ocean', name: 'Ocean Deep', colors: ['#0077be', '#00a8cc', '#4fc3f7'] },
    { id: 'purple', name: 'Purple Haze', colors: ['#9c27b0', '#673ab7', '#3f51b5'] },
    { id: 'monochrome', name: 'Monochrome', colors: ['#212121', '#757575', '#ffffff'] }
  ];

  const handleGenerate = async () => {
    if (!formData.artistName || !formData.releaseTitle) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome do artista e título do lançamento",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    
    try {
      // Simulate landing page generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "🌐 Landing Page criada com sucesso!",
        description: `Página para "${formData.releaseTitle}" está pronta para compartilhar`
      });

      // In production, this would generate actual HTML/CSS and provide download link
    } catch (error) {
      console.error('Error generating landing page:', error);
      toast({
        title: "Erro na geração",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-heading-xl text-foreground mb-1">
                Gerador de Landing Page 🌐
              </h1>
              <p className="text-muted-foreground text-sm">
                Crie páginas profissionais para seus lançamentos em minutos
              </p>
            </div>
            <Badge variant={isPro || isExpert ? "default" : "secondary"} className="text-xs">
              {isPro ? "PRO" : isExpert ? "EXPERT" : "FREE"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados principais do seu lançamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artistName">Nome do Artista *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
                    placeholder="Seu nome artístico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseTitle">Título do Lançamento *</Label>
                  <Input
                    id="releaseTitle"
                    value={formData.releaseTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, releaseTitle: e.target.value }))}
                    placeholder="Nome da música/EP/álbum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Data de Lançamento</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Gênero</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                    placeholder="House, Techno, Pop..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Conte a história por trás da sua música..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform Links */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Links das Plataformas
              </CardTitle>
              <CardDescription>
                Onde sua música estará disponível
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spotifyUrl">Spotify URL</Label>
                <Input
                  id="spotifyUrl"
                  value={formData.spotifyUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                  placeholder="https://open.spotify.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appleMusicUrl">Apple Music URL</Label>
                <Input
                  id="appleMusicUrl"
                  value={formData.appleMusicUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, appleMusicUrl: e.target.value }))}
                  placeholder="https://music.apple.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Design Customization */}
          <Card className="glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalização Visual
              </CardTitle>
              <CardDescription>
                Escolha o template e esquema de cores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Esquema de Cores</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {colorSchemes.map((scheme) => (
                    <Button
                      key={scheme.id}
                      variant={formData.colorScheme === scheme.id ? "default" : "outline"}
                      className="justify-start h-auto p-3"
                      onClick={() => setFormData(prev => ({ ...prev, colorScheme: scheme.id }))}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {scheme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-sm">{scheme.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1"
              variant="neon"
            >
              {generating ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Gerar Landing Page
                </>
              )}
            </Button>
            
            <Button variant="outline" disabled={!canExport()}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button variant="outline" disabled={!canExport()}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Upgrade Notice */}
          {!isPro && !isExpert && (
            <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="h-6 w-6 text-amber-500" />
                  <h3 className="font-semibold text-foreground">Desbloqueie Todos os Templates</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Usuários PRO e EXPERT têm acesso a templates premium, customização avançada e domínio personalizado.
                </p>
                <Button variant="default" size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500">
                  Fazer Upgrade
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}