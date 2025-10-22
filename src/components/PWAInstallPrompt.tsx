import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInstalled) {
      return; // Don't show prompt if already installed
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show the prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Show after 10 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual install instructions
    if (iOS && !isInstalled) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 15000); // Show after 15 seconds for iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        toast({
          title: "📱 Instalação no iOS",
          description: "Use o botão 'Compartilhar' do Safari e selecione 'Adicionar à Tela de Início'"
        });
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "🎉 RemiXense instalado!",
          description: "Agora você pode usar o app offline"
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Don't show again for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  useEffect(() => {
    // Check if prompt was dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < dayInMs) {
        setShowPrompt(false);
        return;
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <Card className="glass border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {isIOS ? <Smartphone className="h-5 w-5 text-primary" /> : <Monitor className="h-5 w-5 text-primary" />}
              <h3 className="font-semibold text-foreground">
                Instalar RemiXense
              </h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {isIOS 
              ? "Acesse offline! Toque em 'Compartilhar' → 'Adicionar à Tela de Início'"
              : "Instale o app e produza música mesmo sem internet!"
            }
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall}
              size="sm" 
              variant="neon"
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              {isIOS ? "Como Instalar" : "Instalar App"}
            </Button>
            <Button 
              onClick={handleDismiss}
              size="sm" 
              variant="outline"
            >
              Depois
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}