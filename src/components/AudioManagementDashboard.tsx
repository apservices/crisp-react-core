
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload, Music, Users, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types';
import { AudioUploader } from './AudioUploader';
import { AudioPlayer } from './AudioPlayer';

export function AudioManagementDashboard() {
  const { user } = useAuth();
  const { isAdmin } = useRoleAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTracks = async () => {
    try {
      setLoading(true);
      
      // Query tracks with proper type casting
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast data to Track[] with proper type assertion
      const tracksData = data?.map(track => ({
        ...track,
        type: (track.type || 'track') as 'track' | 'remix' | 'sample',
        name: track.title, // Add name property for compatibility
        url: track.file_url || track.file_path // Add url property for compatibility
      })) as Track[];

      setTracks(tracksData || []);
    } catch (error) {
      console.error('Error loading tracks:', error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handleUploadComplete = (trackId: string) => {
    // Reload tracks after successful upload
    loadTracks();
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audio Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie seu acervo de áudios e visualize analytics
          </p>
        </div>
        {isAdmin && (
          <Badge variant="secondary" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Admin
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Music className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{tracks.length}</p>
              <p className="text-muted-foreground">Total de Faixas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Upload className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {tracks.filter(t => t.upload_status === 'completed').length}
              </p>
              <p className="text-muted-foreground">Processadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">
                {new Set(tracks.map(t => t.user_id)).size}
              </p>
              <p className="text-muted-foreground">Usuários Ativos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="library" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por título ou artista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tracks List */}
          <div className="space-y-4">
            {filteredTracks.length === 0 ? (
              <Card className="p-8 text-center">
                <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma faixa encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Tente outros termos de busca' : 'Faça o upload da primeira faixa'}
                </p>
              </Card>
            ) : (
              filteredTracks.map((track) => (
                <Card key={track.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{track.title}</h3>
                        <Badge variant="outline">{track.type}</Badge>
                        {track.upload_status && (
                          <Badge 
                            variant={track.upload_status === 'completed' ? 'default' : 'secondary'}
                          >
                            {track.upload_status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {track.artist} • {track.duration || 'Duração desconhecida'}
                        {track.bpm && ` • ${track.bpm} BPM`}
                        {track.key_signature && ` • ${track.key_signature}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {track.file_path && (
                        <AudioPlayer track={track} showAnalysis={true} />
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload de Áudio</h2>
            <AudioUploader onUploadComplete={handleUploadComplete} />
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Painel Administrativo</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Total de Usuários</h3>
                    <p className="text-2xl font-bold text-primary">
                      {new Set(tracks.map(t => t.user_id)).size}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Armazenamento Usado</h3>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(tracks.reduce((acc, t) => acc + (t.file_size || 0), 0) / 1024 / 1024)} MB
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
