import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key_signature: string | null;
  energy_level: number | null;
  genre: string | null;
  duration: string;
  created_at: string;
}

export default function Tracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id,title,artist,bpm,key_signature,energy_level,genre,duration,created_at')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (error) {
          console.error('Erro ao carregar faixas:', error.message);
        } else {
          setTracks(data ?? []);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Minhas Faixas</h1>
        <p className="text-muted-foreground">Gerencie e analise suas faixas enviadas.</p>
      </header>

      {loading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : tracks.length === 0 ? (
        <Card className="glass border-glass-border p-8 text-center">
          <p className="mb-4">Você ainda não enviou nenhuma faixa.</p>
          <a href="/vault" className="underline text-primary">Enviar faixas</a>
        </Card>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((t) => (
            <Card key={t.id} className="glass border-glass-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{t.title}</h2>
                  <p className="text-sm text-muted-foreground">{t.artist}</p>
                </div>
                <Badge variant="outline">{new Date(t.created_at).toLocaleDateString()}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">BPM</span><div className="font-medium">{t.bpm ?? '—'}</div></div>
                <div><span className="text-muted-foreground">Key</span><div className="font-medium">{t.key_signature ?? '—'}</div></div>
                <div><span className="text-muted-foreground">Energia</span><div className="font-medium">{t.energy_level ?? '—'}</div></div>
                <div><span className="text-muted-foreground">Gênero</span><div className="font-medium">{t.genre ?? '—'}</div></div>
                <div><span className="text-muted-foreground">Duração</span><div className="font-medium">{t.duration}</div></div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
