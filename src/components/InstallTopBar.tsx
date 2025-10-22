import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export default function InstallTopBar() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  if (!show) return null;

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-2 my-2 rounded-md backdrop-blur bg-background/60 border border-primary/30 px-3 py-2 shadow">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Instale o app para uma experiência mais rápida</span>
          <Button size="sm" variant="neon" onClick={install}>
            <Download className="h-3 w-3 mr-1" /> Instalar App
          </Button>
        </div>
      </div>
    </div>
  );
}
