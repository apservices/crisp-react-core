
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Music, Brain, Sparkles } from 'lucide-react';
import { useCreditAwareServices } from '@/hooks/useCreditAwareServices';
import { Track } from '@/types';

interface CreditAwarePanelProps {
  track: Track;
}

export function CreditAwarePanel({ track }: CreditAwarePanelProps) {
  const {
    results,
    loading,
    processService,
    clearCache,
    services
  } = useCreditAwareServices();

  const handleAutoMaster = async () => {
    await processService(track.id, 'auto-mastering');
  };

  const handleStemSwap = async () => {
    await processService(track.id, 'stem-swap');
  };

  const handleMoodAnalysis = async () => {
    await processService(track.id, 'mood-analysis');
  };

  const handleMelodyGenerator = async () => {
    await processService(track.id, 'melody-generator');
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'auto-mastering':
        return <Zap className="w-4 h-4" />;
      case 'stem-swap':
        return <Music className="w-4 h-4" />;
      case 'mood-analysis':
        return <Brain className="w-4 h-4" />;
      case 'melody-generator':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Serviços de IA</h3>
          <p className="text-muted-foreground text-sm">
            Processe sua faixa com nossos serviços inteligentes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auto-Mastering */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Auto-Mastering</h4>
              </div>
              <Badge variant="outline">{services['auto-mastering'].creditCost} créditos</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {services['auto-mastering'].description}
            </p>
            <Button 
              onClick={handleAutoMaster}
              disabled={loading['auto-mastering']}
              className="w-full"
              size="sm"
            >
              {loading['auto-mastering'] ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Processar
            </Button>
            {results['auto-mastering'] && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                ✓ Processado {results['auto-mastering'].cached ? '(cache)' : ''}
              </div>
            )}
          </Card>

          {/* Stem-Swap */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Stem-Swap</h4>
              </div>
              <Badge variant="outline">{services['stem-swap'].creditCost} créditos</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {services['stem-swap'].description}
            </p>
            <Button 
              onClick={handleStemSwap}
              disabled={loading['stem-swap']}
              className="w-full"
              size="sm"
            >
              {loading['stem-swap'] ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Music className="w-4 h-4 mr-2" />
              )}
              Processar
            </Button>
            {results['stem-swap'] && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                ✓ Processado {results['stem-swap'].cached ? '(cache)' : ''}
              </div>
            )}
          </Card>

          {/* Mood Analysis */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Mood Analysis</h4>
              </div>
              <Badge variant="outline">{services['mood-analysis'].creditCost} créditos</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {services['mood-analysis'].description}
            </p>
            <Button 
              onClick={handleMoodAnalysis}
              disabled={loading['mood-analysis']}
              className="w-full"
              size="sm"
            >
              {loading['mood-analysis'] ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Processar
            </Button>
            {results['mood-analysis'] && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                ✓ Processado {results['mood-analysis'].cached ? '(cache)' : ''}
              </div>
            )}
          </Card>

          {/* Melody Generator */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Melody Generator</h4>
              </div>
              <Badge variant="outline">{services['melody-generator'].creditCost} créditos</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {services['melody-generator'].description}
            </p>
            <Button 
              onClick={handleMelodyGenerator}
              disabled={loading['melody-generator']}
              className="w-full"
              size="sm"
            >
              {loading['melody-generator'] ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Processar
            </Button>
            {results['melody-generator'] && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                ✓ Processado {results['melody-generator'].cached ? '(cache)' : ''}
              </div>
            )}
          </Card>
        </div>

        {/* Results Summary */}
        {Object.keys(results).length > 0 && (
          <Card className="p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Resultados Processados</h4>
            <div className="space-y-2">
              {Object.entries(results).map(([serviceType, result]) => (
                <div key={serviceType} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(serviceType)}
                    <span className="capitalize">{services[serviceType]?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.cached ? 'secondary' : 'default'} className="text-xs">
                      {result.cached ? 'Cache' : `${result.creditsUsed} créditos`}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearCache(track.id, serviceType)}
                      className="h-6 px-2 text-xs"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}
