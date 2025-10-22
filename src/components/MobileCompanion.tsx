import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone,
  Wifi,
  WifiOff,
  Download,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Search,
  List,
  Star,
  Clock,
  Zap,
  Cloud,
  Music,
  Filter,
  Bell,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number | null;
  key_signature: string | null;
  genre: string | null;
  energy_level: number | null;
  isDownloaded: boolean;
  isFavorite: boolean;
  lastPlayed?: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  isDownloaded: boolean;
  syncStatus: 'synced' | 'syncing' | 'error';
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight Drive',
    artist: 'Synthwave Artist',
    duration: '4:32',
    bpm: 128,
    key_signature: 'A minor',
    genre: 'Synthwave',
    energy_level: 0.8,
    isDownloaded: true,
    isFavorite: true,
    lastPlayed: '2h ago'
  },
  {
    id: '2',
    title: 'Underground Vibes',
    artist: 'Tech House Producer',
    duration: '6:15',
    bpm: 125,
    key_signature: 'F# minor',
    genre: 'Tech House',
    energy_level: 0.9,
    isDownloaded: false,
    isFavorite: false
  },
  {
    id: '3',
    title: 'Sunrise Sessions',
    artist: 'Progressive DJ',
    duration: '7:45',
    bpm: 132,
    key_signature: 'C major',
    genre: 'Progressive',
    energy_level: 0.7,
    isDownloaded: true,
    isFavorite: true,
    lastPlayed: '1d ago'
  }
];

const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: '1',
    name: 'Weekend Set',
    tracks: SAMPLE_TRACKS.slice(0, 2),
    isDownloaded: true,
    syncStatus: 'synced'
  },
  {
    id: '2',
    name: 'Morning Vibes',
    tracks: [SAMPLE_TRACKS[2]],
    isDownloaded: false,
    syncStatus: 'syncing'
  }
];

export const MobileCompanion: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [tracks, setTracks] = useState<Track[]>(SAMPLE_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(SAMPLE_PLAYLISTS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'bpm' | 'energy' | 'recent'>('name');
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  // Simulate connection changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate connection changes for demo
      if (Math.random() < 0.1) {
        setIsConnected(prev => !prev);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === 'all' || track.genre === filterGenre;
    const matchesOffline = !offlineMode || track.isDownloaded;
    
    return matchesSearch && matchesGenre && matchesOffline;
  });

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    switch (sortBy) {
      case 'bpm':
        return (b.bpm || 0) - (a.bpm || 0);
      case 'energy':
        return (b.energy_level || 0) - (a.energy_level || 0);
      case 'recent':
        if (a.lastPlayed && b.lastPlayed) {
          return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
        }
        return 0;
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const toggleDownload = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, isDownloaded: !track.isDownloaded }
        : track
    ));
    
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      toast({
        title: track.isDownloaded ? "Download removido" : "Download iniciado",
        description: `${track.title} ${track.isDownloaded ? 'removida' : 'baixada'} para modo offline`,
      });
    }
  };

  const toggleFavorite = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, isFavorite: !track.isFavorite }
        : track
    ));
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Update last played
    setTracks(prev => prev.map(t => 
      t.id === track.id 
        ? { ...t, lastPlayed: 'now' }
        : t
    ));
  };

  const simulateSync = () => {
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Sincronização concluída",
            description: "Biblioteca atualizada com o desktop",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getEnergyColor = (energy: number | null) => {
    if (!energy) return 'text-muted-foreground';
    if (energy > 0.8) return 'text-red-400';
    if (energy > 0.6) return 'text-yellow-400';
    if (energy > 0.4) return 'text-green-400';
    return 'text-blue-400';
  };

  const genres = Array.from(new Set(tracks.map(t => t.genre).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-heading-lg text-foreground flex items-center justify-center gap-2">
          <Smartphone className="h-5 w-5 text-neon-teal" />
          Mobile Companion
        </h2>
        <p className="text-muted-foreground">
          Gerencie sua biblioteca e prepare sets em movimento
        </p>
      </div>

      {/* Connection Status */}
      <Card className="glass border-glass-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-neon-green" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {isConnected ? 'Conectado' : 'Offline'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'Sincronizado com desktop' : 'Usando cache local'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={offlineMode}
              onCheckedChange={setOfflineMode}
            />
            <span className="text-sm text-muted-foreground">Modo Offline</span>
          </div>
        </div>
      </Card>

      {/* Quick Player */}
      {currentTrack && (
        <Card className="glass border-glass-border p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="neon-glow"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">0:00</span>
              <div className="flex-1 bg-muted rounded-full h-1">
                <div className="bg-neon-blue h-1 rounded-full w-1/3"></div>
              </div>
              <span className="text-xs text-muted-foreground">{currentTrack.duration}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="glass border-glass-border p-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar faixas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="flex-1 px-3 py-2 glass rounded-md text-sm text-foreground"
            >
              <option value="all">Todos os gêneros</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 glass rounded-md text-sm text-foreground"
            >
              <option value="name">Nome</option>
              <option value="bpm">BPM</option>
              <option value="energy">Energia</option>
              <option value="recent">Recentes</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Track List */}
      <Card className="glass border-glass-border p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-heading-sm text-foreground flex items-center gap-2">
              <Music className="h-4 w-4 text-neon-blue" />
              Biblioteca ({sortedTracks.length})
            </h3>
            
            {isConnected && (
              <Button variant="outline" size="sm" onClick={simulateSync}>
                <RotateCw className="h-4 w-4 mr-2" />
                Sync
              </Button>
            )}
          </div>
          
          {syncProgress > 0 && syncProgress < 100 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Sincronizando...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          )}
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 glass rounded-lg hover:bg-primary/5 transition-colors"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => playTrack(track)}
                  className="shrink-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {track.bpm && (
                      <Badge variant="outline" className="text-xs text-neon-blue border-neon-blue/30">
                        {track.bpm} BPM
                      </Badge>
                    )}
                    {track.key_signature && (
                      <Badge variant="outline" className="text-xs text-neon-green border-neon-green/30">
                        {track.key_signature}
                      </Badge>
                    )}
                    {track.energy_level && (
                      <div className={cn("text-xs font-medium", getEnergyColor(track.energy_level))}>
                        ⚡ {Math.round(track.energy_level * 100)}%
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(track.id)}
                    className={cn(track.isFavorite && "text-yellow-400")}
                  >
                    <Star className={cn("h-4 w-4", track.isFavorite && "fill-current")} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleDownload(track.id)}
                    className={cn(track.isDownloaded ? "text-neon-green" : "text-muted-foreground")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass border-glass-border p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-blue">
              {tracks.filter(t => t.isDownloaded).length}
            </div>
            <div className="text-sm text-muted-foreground">Offline</div>
          </div>
        </Card>
        
        <Card className="glass border-glass-border p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-green">
              {tracks.filter(t => t.isFavorite).length}
            </div>
            <div className="text-sm text-muted-foreground">Favoritas</div>
          </div>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="glass border-glass-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-neon-violet" />
            <div>
              <p className="font-medium text-foreground">Notificações</p>
              <p className="text-sm text-muted-foreground">
                Receba alertas sobre novos conteúdos
              </p>
            </div>
          </div>
          
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
      </Card>
    </div>
  );
};