import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, Music, Tag, Calendar, FileText, Download, Upload, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  key: string;
  bpm: number;
  duration: string;
  release_date: string;
  isrc?: string;
  label?: string;
  composers: string[];
  tags: string[];
  mood: string;
  energy: number;
  created_at: string;
}

export default function MetadataManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<TrackMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackMetadata | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    key: '',
    bpm: '',
    duration: '',
    release_date: '',
    isrc: '',
    label: '',
    composers: '',
    tags: '',
    mood: ''
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      // Mock metadata for demonstration
      const mockTracks: TrackMetadata[] = [
        {
          id: '1',
          title: 'Sunset Dreams',
          artist: 'DJ Ocean',
          album: 'Summer Vibes EP',
          genre: 'Deep House',
          key: 'Am',
          bpm: 122,
          duration: '5:43',
          release_date: '2024-07-15',
          isrc: 'USRC17607839',
          label: 'Ocean Records',
          composers: ['DJ Ocean', 'Sarah Waves'],
          tags: ['sunset', 'deep', 'atmospheric', 'chill'],
          mood: 'Relaxed',
          energy: 65,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Electric Nights',
          artist: 'TechnoMaster',
          genre: 'Techno',
          key: 'Dm',
          bpm: 130,
          duration: '6:12',
          release_date: '2024-07-20',
          isrc: 'USRC17607840',
          composers: ['TechnoMaster'],
          tags: ['dark', 'industrial', 'club', 'peak-time'],
          mood: 'Energetic',
          energy: 92,
          created_at: new Date().toISOString()
        }
      ];
      setTracks(mockTracks);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast({
        title: "Erro ao carregar metadados",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const genres = [
    'all', 'House', 'Deep House', 'Tech House', 'Techno', 'Progressive', 
    'Trance', 'Ambient', 'Drum & Bass', 'Dubstep', 'Trap', 'Hip Hop'
  ];

  const keys = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
  ];

  const moods = [
    'Energetic', 'Relaxed', 'Dark', 'Uplifting', 'Melancholic', 
    'Aggressive', 'Peaceful', 'Mysterious', 'Euphoric', 'Romantic'
  ];

  const handleEdit = (track: TrackMetadata) => {
    setSelectedTrack(track);
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      genre: track.genre,
      key: track.key,
      bpm: track.bpm.toString(),
      duration: track.duration,
      release_date: track.release_date,
      isrc: track.isrc || '',
      label: track.label || '',
      composers: track.composers.join(', '),
      tags: track.tags.join(', '),
      mood: track.mood
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTrack) return;

    try {
      const updatedTrack: TrackMetadata = {
        ...selectedTrack,
        title: formData.title,
        artist: formData.artist,
        album: formData.album,
        genre: formData.genre,
        key: formData.key,
        bpm: parseInt(formData.bpm) || 0,
        duration: formData.duration,
        release_date: formData.release_date,
        isrc: formData.isrc,
        label: formData.label,
        composers: formData.composers.split(',').map(c => c.trim()).filter(c => c),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        mood: formData.mood
      };

      setTracks(tracks.map(t => t.id === selectedTrack.id ? updatedTrack : t));
      
      toast({
        title: "📝 Metadados atualizados!",
        description: `"${formData.title}" foi atualizada com sucesso`
      });

      setDialogOpen(false);
      setSelectedTrack(null);
    } catch (error) {
      console.error('Error updating metadata:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const exportMetadata = () => {
    const dataStr = JSON.stringify(tracks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'track_metadata.json';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "📋 Metadados exportados!",
      description: "Arquivo JSON baixado com sucesso"
    });
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = searchQuery === "" || 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = filterGenre === "all" || track.genre === filterGenre;
    
    return matchesSearch && matchesGenre;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando metadados...</p>
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
                Matriz de Metadados 📋
              </h1>
              <p className="text-muted-foreground text-sm">
                Organize e gerencie todas as informações das suas músicas
              </p>
            </div>
            <Button variant="outline" onClick={exportMetadata}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, artista ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre === 'all' ? 'Todos os Gêneros' : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-blue font-heading">
                {tracks.length}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </Card>
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-violet font-heading">
                {new Set(tracks.map(t => t.genre)).size}
              </div>
              <div className="text-xs text-muted-foreground">Gêneros</div>
            </Card>
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-teal font-heading">
                {Math.round(tracks.reduce((sum, t) => sum + t.bpm, 0) / tracks.length) || 0}
              </div>
              <div className="text-xs text-muted-foreground">BPM Médio</div>
            </Card>
            <Card className="glass border-glass-border p-3 text-center">
              <div className="text-lg font-bold text-neon-green font-heading">
                {tracks.filter(t => t.isrc).length}
              </div>
              <div className="text-xs text-muted-foreground">Com ISRC</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || filterGenre !== 'all' 
                ? "Nenhum resultado encontrado"
                : "Nenhuma faixa cadastrada"
              }
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery || filterGenre !== 'all'
                ? "Tente ajustar sua busca ou filtros."
                : "Faça upload de suas primeiras faixas para começar a organizar os metadados"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="glass border-glass-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground mb-1">
                        {track.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Music className="h-3 w-3" />
                        {track.artist}
                        {track.album && <span>• {track.album}</span>}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(track)}
                    >
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Technical Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Gênero:</span>
                      <div className="font-medium">{track.genre}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tom:</span>
                      <div className="font-medium">{track.key}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">BPM:</span>
                      <div className="font-medium">{track.bpm}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duração:</span>
                      <div className="font-medium">{track.duration}</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Lançamento:</span>
                      <div className="font-medium">
                        {new Date(track.release_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    {track.isrc && (
                      <div>
                        <span className="text-muted-foreground">ISRC:</span>
                        <div className="font-medium font-mono text-xs">{track.isrc}</div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {track.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {track.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {track.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{track.tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Composers */}
                  {track.composers.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Compositores:</span>
                      <span className="ml-2">{track.composers.join(', ')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl mx-auto glass max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Editar Metadados
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artista *</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="album">Álbum</Label>
                  <Input
                    id="album"
                    value={formData.album}
                    onChange={(e) => setFormData(prev => ({ ...prev, album: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Gravadora</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
              </div>

              {/* Technical Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select 
                    value={formData.genre} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.slice(1).map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tom</Label>
                  <Select 
                    value={formData.key} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, key: value }))}
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
                  <Label htmlFor="bpm">BPM</Label>
                  <Input
                    id="bpm"
                    type="number"
                    value={formData.bpm}
                    onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input
                    id="duration"
                    placeholder="5:43"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_date">Lançamento</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <Select 
                    value={formData.mood} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((mood) => (
                        <SelectItem key={mood} value={mood}>
                          {mood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isrc">ISRC</Label>
                <Input
                  id="isrc"
                  placeholder="USRC17607839"
                  value={formData.isrc}
                  onChange={(e) => setFormData(prev => ({ ...prev, isrc: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="composers">Compositores (separados por vírgula)</Label>
                <Input
                  id="composers"
                  placeholder="Compositor 1, Compositor 2"
                  value={formData.composers}
                  onChange={(e) => setFormData(prev => ({ ...prev, composers: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Textarea
                  id="tags"
                  placeholder="deep, atmospheric, chill, sunset"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}