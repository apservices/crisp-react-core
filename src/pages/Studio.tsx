import React from 'react';
import EnhancedDualPlayer from '@/components/EnhancedDualPlayer';
import { useSubscription } from '@/hooks/useSubscription';

export default function Studio() {
  const { isFree, subscription } = useSubscription();
  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-xl">Estúdio de Mixagem</h1>
        <div className="text-xs text-muted-foreground">Plano: {subscription?.plan_type?.toUpperCase() || '—'}</div>
      </div>
      <p className="text-sm text-muted-foreground">Carregue duas faixas, visualize waveforms, ajuste volumes e use o crossfader.</p>
      {isFree && (
        <div className="rounded-md border border-border bg-muted/20 p-3 text-xs">Alguns recursos avançados (stems, Key Sync auto, export avançado, sugestões ilimitadas) exigem upgrade.</div>
      )}
      <EnhancedDualPlayer />
    </div>
  );
}
