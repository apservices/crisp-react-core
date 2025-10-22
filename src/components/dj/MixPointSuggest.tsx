import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchTrackFeatures } from '@/lib/supabase';
import { Lightbulb } from 'lucide-react';

interface MixPointSuggestProps {
  trackId?: string;
  onSuggest?: (ms: number) => void;
}

export const MixPointSuggest: React.FC<MixPointSuggestProps> = ({ trackId, onSuggest }) => {
  const [suggestion, setSuggestion] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!trackId) { setSuggestion(null); return; }
      const feat = await fetchTrackFeatures(trackId);
      if (!feat) { setSuggestion(null); return; }
      const analysis: any = (feat as any).analysis || {};
      const drop = analysis?.structure?.find((s: any) => s.section === 'drop');
      const ms = drop ? drop.start * 1000 : (analysis?.transients?.[0] ?? 0);
      setSuggestion(ms);
    };
    run();
  }, [trackId]);

  if (!trackId) return (
    <Button size="sm" variant="outline" disabled title="Selecione uma faixa">Sugestão</Button>
  );

  return (
    <Button size="sm" variant="secondary" onClick={() => suggestion != null && onSuggest?.(suggestion)} className="gap-2">
      <Lightbulb className="h-4 w-4"/> Sugerir Mix Point {suggestion != null ? `(${Math.round(suggestion/1000)}s)` : ''}
    </Button>
  );
};
