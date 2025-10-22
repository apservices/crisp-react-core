import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onNeedRefresh = () => setShow(true);
    window.addEventListener('pwa:need-refresh', onNeedRefresh);
    return () => window.removeEventListener('pwa:need-refresh', onNeedRefresh);
  }, []);

  if (!show) return null;

  const doUpdate = async () => {
    try {
      await window.__PWA_UPDATE_SW?.();
      // Give SW a moment to take control, then reload
      setTimeout(() => window.location.reload(), 150);
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 sm:left-1/2 sm:-translate-x-1/2 sm:w-[560px]">
      <Card className="glass border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg">
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <span className="text-sm text-foreground/90">
            Nova versão disponível. Atualize para receber melhorias.
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="neon" onClick={doUpdate}>
              <RefreshCcw className="h-4 w-4 mr-1" /> Atualizar agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
