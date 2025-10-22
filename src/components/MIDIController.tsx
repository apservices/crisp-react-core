import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Gamepad2, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Music,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: 'connected' | 'disconnected';
  type: 'input' | 'output';
}

interface ControllerPreset {
  id: string;
  name: string;
  manufacturer: string;
  mappings: {
    [key: string]: {
      control: string;
      type: 'knob' | 'fader' | 'button' | 'jog';
      channel?: number;
    };
  };
}

const CONTROLLER_PRESETS: ControllerPreset[] = [
  {
    id: 'pioneer_ddj_sb3',
    name: 'DDJ-SB3',
    manufacturer: 'Pioneer',
    mappings: {
      'play_a': { control: 'Play/Pause A', type: 'button' },
      'play_b': { control: 'Play/Pause B', type: 'button' },
      'crossfader': { control: 'Crossfader', type: 'fader' },
      'volume_a': { control: 'Volume A', type: 'fader' },
      'volume_b': { control: 'Volume B', type: 'fader' },
      'jog_a': { control: 'Jog Wheel A', type: 'jog' },
      'jog_b': { control: 'Jog Wheel B', type: 'jog' },
    }
  },
  {
    id: 'hercules_djcontrol_inpulse_200',
    name: 'DJControl Inpulse 200',
    manufacturer: 'Hercules',
    mappings: {
      'play_a': { control: 'Play/Pause A', type: 'button' },
      'play_b': { control: 'Play/Pause B', type: 'button' },
      'crossfader': { control: 'Crossfader', type: 'fader' },
      'volume_a': { control: 'Volume A', type: 'fader' },
      'volume_b': { control: 'Volume B', type: 'fader' },
    }
  },
  {
    id: 'numark_party_mix',
    name: 'Party Mix',
    manufacturer: 'Numark',
    mappings: {
      'play_a': { control: 'Play/Pause A', type: 'button' },
      'play_b': { control: 'Play/Pause B', type: 'button' },
      'crossfader': { control: 'Crossfader', type: 'fader' },
      'volume_a': { control: 'Volume A', type: 'fader' },
      'volume_b': { control: 'Volume B', type: 'fader' },
    }
  }
];

export const MIDIController: React.FC = () => {
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [mappingDialog, setMappingDialog] = useState(false);
  const { toast } = useToast();

  // Initialize MIDI access
  useEffect(() => {
    const initMIDI = async () => {
      try {
        if (navigator.requestMIDIAccess) {
          const access = await navigator.requestMIDIAccess();
          setMidiAccess(access);
          updateDevices(access);
          
          access.onstatechange = () => updateDevices(access);
        } else {
          toast({
            title: "MIDI não suportado",
            description: "Seu navegador não suporta WebMIDI API",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Erro MIDI",
          description: "Falha ao acessar dispositivos MIDI",
          variant: "destructive"
        });
      }
    };

    initMIDI();
  }, [toast]);

  const updateDevices = (access: any) => {
    const deviceList: MIDIDevice[] = [];
    
    // Input devices
    access.inputs.forEach((input: any) => {
      deviceList.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
        state: input.state,
        type: 'input'
      });
    });

    // Output devices
    access.outputs.forEach((output: any) => {
      deviceList.push({
        id: output.id,
        name: output.name || 'Unknown Device',
        manufacturer: output.manufacturer || 'Unknown',
        state: output.state,
        type: 'output'
      });
    });

    setDevices(deviceList);
  };

  const connectDevice = (deviceId: string) => {
    setSelectedDevice(deviceId);
    const device = devices.find(d => d.id === deviceId);
    
    if (device && midiAccess) {
      const input = midiAccess.inputs.get(deviceId);
      if (input) {
        input.onmidimessage = handleMIDIMessage;
        toast({
          title: "Controlador conectado",
          description: `${device.name} está pronto para uso`,
        });
      }
    }
  };

  const handleMIDIMessage = (message: any) => {
    const [status, control, value] = message.data;
    console.log('MIDI Message:', { status, control, value });
    
    // Aqui seria implementada a lógica de mapeamento
    // Por exemplo, mapear controle 64 para play/pause
    if (isLearning) {
      toast({
        title: "MIDI Learn",
        description: `Controle ${control} detectado com valor ${value}`,
      });
    }
  };

  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = CONTROLLER_PRESETS.find(p => p.id === presetId);
    
    if (preset) {
      toast({
        title: "Preset aplicado",
        description: `Mapeamento ${preset.name} carregado com sucesso`,
      });
    }
  };

  const startMIDILearn = () => {
    setIsLearning(true);
    toast({
      title: "MIDI Learn ativo",
      description: "Mova um controle no seu equipamento para mapeá-lo",
    });
    
    // Auto-desativar após 10 segundos
    setTimeout(() => {
      setIsLearning(false);
    }, 10000);
  };

  const connectedDevices = devices.filter(d => d.state === 'connected');
  const selectedDeviceInfo = devices.find(d => d.id === selectedDevice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-heading-lg text-foreground flex items-center justify-center gap-2">
          <Gamepad2 className="h-5 w-5 text-neon-blue" />
          Controladores MIDI
        </h2>
        <p className="text-muted-foreground">
          Configure e mapeie seus controladores DJ
        </p>
      </div>

      {/* Device Detection */}
      <Card className="glass border-glass-border p-6">
        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-neon-teal" />
            Dispositivos Detectados
          </h3>
          
          {connectedDevices.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum controlador MIDI detectado
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Conecte seu controlador e atualize a página
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {connectedDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 glass rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg glass">
                      <Music className="h-4 w-4 text-neon-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{device.name}</p>
                      <p className="text-sm text-muted-foreground">{device.manufacturer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        selectedDevice === device.id 
                          ? "text-neon-green border-neon-green/30" 
                          : "text-muted-foreground"
                      )}
                    >
                      {selectedDevice === device.id ? 'Conectado' : device.type}
                    </Badge>
                    {selectedDevice !== device.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => connectDevice(device.id)}
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Controller Presets */}
      {selectedDevice && (
        <Card className="glass border-glass-border p-6">
          <div className="space-y-4">
            <h3 className="text-heading-sm text-foreground flex items-center gap-2">
              <Settings className="h-4 w-4 text-neon-violet" />
              Presets de Controladores
            </h3>
            
            <div className="grid gap-3">
              {CONTROLLER_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 glass rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{preset.name}</p>
                    <p className="text-sm text-muted-foreground">{preset.manufacturer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPreset === preset.id && (
                      <CheckCircle className="h-4 w-4 text-neon-green" />
                    )}
                    <Button
                      variant={selectedPreset === preset.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => applyPreset(preset.id)}
                    >
                      {selectedPreset === preset.id ? 'Aplicado' : 'Aplicar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* MIDI Learn & Custom Mapping */}
      {selectedDevice && (
        <Card className="glass border-glass-border p-6">
          <div className="space-y-4">
            <h3 className="text-heading-sm text-foreground flex items-center gap-2">
              <RotateCw className="h-4 w-4 text-neon-teal" />
              Mapeamento Personalizado
            </h3>
            
            <div className="flex gap-3">
              <Button
                variant={isLearning ? "default" : "outline"}
                onClick={startMIDILearn}
                disabled={isLearning}
                className="flex-1"
              >
                {isLearning ? 'Aprendendo...' : 'MIDI Learn'}
              </Button>
              
              <Dialog open={mappingDialog} onOpenChange={setMappingDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    Mapeamento Manual
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-glass-border">
                  <DialogHeader>
                    <DialogTitle>Mapeamento Manual</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Configure controles específicos do seu equipamento
                    </p>
                    {/* Aqui seria implementada a interface de mapeamento manual */}
                    <div className="text-center py-8 text-muted-foreground">
                      Interface de mapeamento em desenvolvimento
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      )}

      {/* Connection Status */}
      {selectedDeviceInfo && (
        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-neon-green" />
            <div>
              <p className="font-medium text-foreground">
                {selectedDeviceInfo.name} conectado
              </p>
              <p className="text-sm text-muted-foreground">
                Pronto para controlar o RemiXense
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};