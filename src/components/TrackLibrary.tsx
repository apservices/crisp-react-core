import React, { useMemo, useRef, useState } from 'react';
import { useTracks } from '@/hooks/useTracks';
import { TrackRow } from '@/components/TrackRow';
import { useAuth } from '@/hooks/useAuth';
import { AutoMixPlayer } from './AutoMixPlayer';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Filter, Music2 } from 'lucide-react';

export const TrackLibrary: React.FC = () => {
  const { tracks, setFilterMode, toggleLike, addTrack, deleteTrack } = useTracks();
  const { user } = useAuth();
  const { isPro, isExpert } = useSubscription();
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tracks;
    return tracks.filter(t =>
      (t.title || t.name || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q) ||
      (t.genre || '').toLowerCase().includes(q)
    );
  }, [tracks, query]);

  const onUploadClick = () => fileInputRef.current?.click();
  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) await addTrack(f);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-heading-xl">Biblioteca</h1>
          <p className="text-sm text-muted-foreground truncate">Gerencie suas faixas e análises</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onUploadClick} className="gap-2">
            <Upload className="h-4 w-4" />
            Adicionar faixas
          </Button>
          <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={onFilesSelected} />
        </div>
      </header>

      <div className='flex flex-wrap items-center gap-2'>
        <Button variant="outline" size="sm" onClick={() => setFilterMode('single')} className="gap-2">
          <Filter className="h-4 w-4" /> Single
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFilterMode('dual')} className="gap-2">
          <Music2 className="h-4 w-4" /> Dual
        </Button>
        <div className="ml-auto w-full sm:w-72">
          <Input placeholder="Buscar por título, artista, gênero…" value={query} onChange={(e) => setQuery(e.target.value)} className="glass" />
        </div>
      </div>

      <Separator />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <TrackRow key={t.id} track={t} onLikeToggle={toggleLike} onDelete={deleteTrack} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Nenhuma faixa encontrada para o filtro atual.</div>
      )}

      {(isPro || isExpert) && tracks.length > 0 && <AutoMixPlayer />}
    </div>
  );
};
