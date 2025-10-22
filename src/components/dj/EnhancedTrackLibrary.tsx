
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Music } from 'lucide-react';
import { Track } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedTrackLibraryProps {
  onTrackSelect?: (track: Track) => void;
}

export function EnhancedTrackLibrary({ onTrackSelect }: EnhancedTrackLibraryProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tracksData = data?.map(track => ({
        ...track,
        type: (track.type || 'track') as 'track' | 'remix' | 'sample',
        name: track.title,
        url: track.file_url || track.file_path
      })) as Track[];

      setTracks(tracksData || []);
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar faixas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onTrackSelect?.(track)}
              className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{track.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {track.bpm && (
                    <Badge variant="outline" className="text-xs">
                      {track.bpm} BPM
                    </Badge>
                  )}
                  {track.key_signature && (
                    <Badge variant="outline" className="text-xs">
                      {track.key_signature}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTracks.length === 0 && (
          <div className="text-center py-8">
            <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma faixa encontrada' : 'Nenhuma faixa disponível'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
