import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Zap, 
  Volume2, 
  Music, 
  AlertTriangle,
  Cpu,
  AudioWaveform
} from 'lucide-react';
import { getFeatureStatus, isFeatureEnabled } from '@/lib/experimentalFeatures';
import { useToast } from '@/hooks/use-toast';

export const ExperimentalFeatures: React.FC = () => {
  const { toast } = useToast();
  const [keyShift, setKeyShift] = useState([0]);
  const [pitchShift, setPitchShift] = useState([0]);
  const [enableRealtime, setEnableRealtime] = useState(false);

  const features = getFeatureStatus();

  const handleKeySyncTest = () => {
    if (!isFeatureEnabled('KEY_SYNC_AUTO')) {
      toast({
        title: "Recurso Bloqueado",
        description: "Key Sync automático não está habilitado",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Key Sync Aplicado",
      description: `Transposição: ${keyShift[0]} semitons`,
    });
  };

  const handlePitchShiftTest = () => {
    if (!isFeatureEnabled('PITCH_SHIFT_REALTIME')) {
      toast({
        title: "Recurso Bloqueado", 
        description: "Pitch shift em tempo real não está habilitado",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Pitch Shift Aplicado",
      description: `Mudança: ${pitchShift[0]} semitons`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Recursos Experimentais
          <Badge variant="destructive" className="text-xs">BETA</Badge>
        </CardTitle>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Recursos experimentais podem afetar a performance e estabilidade. 
            Use apenas em ambiente de desenvolvimento.
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Feature Status */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Status dos Recursos
          </h4>
          <div className="grid gap-2">
            {features.map(({ feature, enabled, description }) => (
              <div key={feature} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <span className="text-sm font-medium">{description}</span>
                  <p className="text-xs text-muted-foreground">{feature}</p>
                </div>
                <Badge variant={enabled ? "default" : "secondary"}>
                  {enabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Key Sync Controls */}
        {isFeatureEnabled('AUDIO_EXPERIMENTAL') && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Music className="h-4 w-4" />
              Key Sync Automático
            </h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Transposição (semitons)</span>
                  <span>{keyShift[0] > 0 ? '+' : ''}{keyShift[0]}</span>
                </div>
                <Slider
                  value={keyShift}
                  onValueChange={setKeyShift}
                  min={-12}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <Button 
                onClick={handleKeySyncTest}
                disabled={!isFeatureEnabled('KEY_SYNC_AUTO')}
                size="sm"
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Aplicar Key Sync
              </Button>
            </div>
          </div>
        )}

        {/* Pitch Shift Controls */}
        {isFeatureEnabled('AUDIO_EXPERIMENTAL') && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <AudioWaveform className="h-4 w-4" />
              Pitch Shift em Tempo Real
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processamento em Tempo Real</span>
                <Switch
                  checked={enableRealtime}
                  onCheckedChange={setEnableRealtime}
                  disabled={!isFeatureEnabled('PITCH_SHIFT_REALTIME')}
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Pitch Shift (semitons)</span>
                  <span>{pitchShift[0] > 0 ? '+' : ''}{pitchShift[0]}</span>
                </div>
                <Slider
                  value={pitchShift}
                  onValueChange={setPitchShift}
                  min={-12}
                  max={12}
                  step={0.1}
                  className="w-full"
                  disabled={!enableRealtime}
                />
              </div>
              
              <Button 
                onClick={handlePitchShiftTest}
                disabled={!enableRealtime || !isFeatureEnabled('PITCH_SHIFT_REALTIME')}
                size="sm"
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Aplicar Pitch Shift
              </Button>
            </div>
          </div>
        )}

        {/* AI Features */}
        <div className="space-y-3">
          <h4 className="font-medium">Recursos de IA</h4>
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Mixagem Assistida por IA</span>
              <Badge variant="secondary">Em Breve</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Separação de Stems</span>
              <Badge variant="secondary">Em Breve</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Análise Avançada</span>
              <Badge variant={isFeatureEnabled('ADVANCED_ANALYSIS') ? "default" : "secondary"}>
                {isFeatureEnabled('ADVANCED_ANALYSIS') ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Warning */}
        {isFeatureEnabled('AUDIO_EXPERIMENTAL') && (
          <Alert>
            <Cpu className="h-4 w-4" />
            <AlertDescription>
              Recursos experimentais ativos. Monitore o uso de CPU e memória.
              Para melhor performance, desative quando não necessário.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};