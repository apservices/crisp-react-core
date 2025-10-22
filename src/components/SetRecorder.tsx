import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CirclePlay,
  Square,
  Pause,
  Upload,
  Download,
  Share2,
  Clock,
  Volume2,
  Tag,
  Image as ImageIcon,
  Music,
  Globe,
  Lock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  format: 'mp3' | 'wav' | 'aac';
  quality: 'high' | 'medium' | 'low';
}

interface SetMetadata {
  title: string;
  description: string;
  tags: string[];
  artwork?: File;
  tracklist: string;
  privacy: 'public' | 'private' | 'unlisted';
  genre: string;
}

const EXPORT_PLATFORMS = [
  { id: 'mixcloud', name: 'Mixcloud', icon: '🎧', color: 'text-blue-400' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '☁️', color: 'text-orange-400' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'text-red-400' },
  { id: 'spotify', name: 'Spotify', icon: '🎵', color: 'text-green-400' },
];

const MUSIC_GENRES = [
  'House', 'Techno', 'Trance', 'Progressive', 'Deep House', 'Tech House',
  'Drum & Bass', 'Dubstep', 'Trap', 'Hip Hop', 'R&B', 'Funk',
  'Disco', 'Electronic', 'Ambient', 'Downtempo', 'Breakbeat'
];

export const SetRecorder: React.FC = () => {
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    format: 'mp3',
    quality: 'high'
  });
  
  const [metadata, setMetadata] = useState<SetMetadata>({
    title: '',
    description: '',
    tags: [],
    tracklist: '',
    privacy: 'public',
    genre: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    if (recording.isRecording && !recording.isPaused) {
      timerRef.current = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording.isRecording, recording.isPaused]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: `audio/webm;codecs=opus`
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      
      setRecording(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false,
        duration: 0 
      }));

      toast({
        title: "Gravação iniciada",
        description: "Seu set está sendo gravado",
      });
    } catch (error) {
      toast({
        title: "Erro na gravação",
        description: "Não foi possível acessar o microfone",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recording.isRecording) {
      if (recording.isPaused) {
        mediaRecorderRef.current.resume();
        setRecording(prev => ({ ...prev, isPaused: false }));
        toast({ title: "Gravação retomada" });
      } else {
        mediaRecorderRef.current.pause();
        setRecording(prev => ({ ...prev, isPaused: true }));
        toast({ title: "Gravação pausada" });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setRecording(prev => ({ 
        ...prev, 
        isRecording: false, 
        isPaused: false 
      }));

      toast({
        title: "Gravação finalizada",
        description: `Set de ${formatDuration(recording.duration)} gravado`,
      });
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !metadata.tags.includes(currentTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleArtworkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMetadata(prev => ({ ...prev, artwork: file }));
      toast({ title: "Artwork carregado" });
    }
  };

  const downloadSet = async () => {
    if (audioChunksRef.current.length === 0) {
      toast({
        title: "Nenhuma gravação encontrada",
        description: "Grave um set primeiro",
        variant: "destructive"
      });
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.title || 'remix_set'}_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "Seu set está sendo baixado",
    });
  };

  const simulateUpload = async (platforms: string[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simular upload progressivo
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }
    
    setIsUploading(false);
    setExportDialog(false);
    
    toast({
      title: "Upload concluído",
      description: `Set publicado em ${platforms.length} plataforma(s)`,
    });
  };

  const handleExport = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Selecione uma plataforma",
        description: "Escolha pelo menos uma plataforma para publicar",
        variant: "destructive"
      });
      return;
    }

    simulateUpload(selectedPlatforms);
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-heading-lg text-foreground flex items-center justify-center gap-2">
          <Music className="h-5 w-5 text-neon-violet" />
          Gravador de Sets
        </h2>
        <p className="text-muted-foreground">
          Grave, exporte e publique seus sets diretamente nas plataformas
        </p>
      </div>

      {/* Recording Controls */}
      <Card className="glass border-glass-border p-6">
        <div className="space-y-4">
          <div className="text-center space-y-4">
            {/* Recording Status */}
            <div className="flex items-center justify-center gap-4">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                recording.isRecording 
                  ? recording.isPaused
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                  : "bg-muted text-muted-foreground"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  recording.isRecording && !recording.isPaused && "animate-pulse bg-red-400"
                )} />
                {recording.isRecording 
                  ? recording.isPaused ? 'Pausado' : 'Gravando'
                  : 'Parado'
                }
              </div>
              
              <div className="flex items-center gap-2 text-2xl font-mono text-foreground">
                <Clock className="h-5 w-5 text-muted-foreground" />
                {formatDuration(recording.duration)}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3">
              {!recording.isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="neon-glow bg-red-500 hover:bg-red-600"
                >
                  <CirclePlay className="h-5 w-5 mr-2" />
                  Iniciar Gravação
                </Button>
              ) : (
                <>
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    size="lg"
                  >
                    {recording.isPaused ? (
                      <>
                        <CirclePlay className="h-5 w-5 mr-2" />
                        Retomar
                      </>
                    ) : (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pausar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Parar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Recording Settings */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Formato</label>
              <Select 
                value={recording.format} 
                onValueChange={(value: any) => 
                  setRecording(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="aac">AAC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Qualidade</label>
              <Select 
                value={recording.quality} 
                onValueChange={(value: any) => 
                  setRecording(prev => ({ ...prev, quality: value }))
                }
              >
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta (320kbps)</SelectItem>
                  <SelectItem value="medium">Média (192kbps)</SelectItem>
                  <SelectItem value="low">Baixa (128kbps)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Set Metadata */}
      <Card className="glass border-glass-border p-6">
        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-neon-teal" />
            Informações do Set
          </h3>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Título</label>
                <Input
                  placeholder="Nome do seu set"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  className="glass"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gênero</label>
                <Select 
                  value={metadata.genre} 
                  onValueChange={(value) => setMetadata(prev => ({ ...prev, genre: value }))}
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSIC_GENRES.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descrição</label>
              <Textarea
                placeholder="Descreva seu set..."
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="glass"
                rows={3}
              />
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="glass flex-1"
                />
                <Button onClick={addTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {metadata.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Artwork Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Artwork</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkUpload}
                  className="hidden"
                  id="artwork-upload"
                />
                <label
                  htmlFor="artwork-upload"
                  className="cursor-pointer glass rounded-lg p-4 flex items-center gap-2 hover:bg-primary/10 transition-colors"
                >
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  {metadata.artwork ? metadata.artwork.name : 'Escolher imagem'}
                </label>
              </div>
            </div>
            
            {/* Privacy */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Privacidade</label>
              <Select 
                value={metadata.privacy} 
                onValueChange={(value: any) => setMetadata(prev => ({ ...prev, privacy: value }))}
              >
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Público
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Não listado
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Privado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <Card className="glass border-glass-border p-6">
        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground flex items-center gap-2">
            <Share2 className="h-4 w-4 text-neon-blue" />
            Exportar & Publicar
          </h3>
          
          <div className="flex gap-3">
            <Button onClick={downloadSet} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Local
            </Button>
            
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1 neon-glow">
                  <Upload className="h-4 w-4 mr-2" />
                  Publicar Online
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-glass-border max-w-md">
                <DialogHeader>
                  <DialogTitle>Publicar Set</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione as plataformas onde deseja publicar seu set:
                  </p>
                  
                  <div className="grid gap-3">
                    {EXPORT_PLATFORMS.map((platform) => (
                      <div
                        key={platform.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                          selectedPlatforms.includes(platform.id)
                            ? "glass border-neon-blue/50 bg-neon-blue/10"
                            : "glass hover:bg-primary/5"
                        )}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <span className="text-lg">{platform.icon}</span>
                        <span className="font-medium text-foreground">{platform.name}</span>
                        {selectedPlatforms.includes(platform.id) && (
                          <span className="ml-auto text-neon-blue">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleExport}
                    disabled={isUploading || selectedPlatforms.length === 0}
                    className="w-full"
                  >
                    {isUploading ? 'Publicando...' : 'Publicar Set'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </div>
  );
};