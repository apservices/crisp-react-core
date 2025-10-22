import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Music, Users, Zap, Upload, Sparkles, Check, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao RemiXense',
    description: 'Sua jornada musical começa aqui',
    icon: Sparkles,
    content: 'welcome'
  },
  {
    id: 'role',
    title: 'Como você se identifica?',
    description: 'Escolha sua função principal',
    icon: Users,
    content: 'role'
  },
  {
    id: 'features',
    title: 'Funcionalidades Principais',
    description: 'Conheça o que oferecemos',
    icon: Zap,
    content: 'features'
  },
  {
    id: 'ready',
    title: 'Tudo Pronto!',
    description: 'Comece sua experiência',
    icon: Check,
    content: 'ready'
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    {
      id: 'mixer',
      title: 'Mixer',
      description: 'Crio sets e mixagens incríveis',
      icon: Music,
      color: 'blue'
    },
    {
      id: 'dj',
      title: 'RemiXer',
      description: 'Artista profissional de performances',
      icon: Users,
      color: 'violet'
    },
    {
      id: 'producer',
      title: 'Producer',
      description: 'Produzo e remixo faixas originais',
      icon: Zap,
      color: 'teal'
    }
  ];

  const features = [
    {
      title: 'Análise IA Musical',
      description: 'BPM, key, energia e instrumentos detectados automaticamente',
      icon: Sparkles
    },
    {
      title: 'Quick Mix Engine',
      description: 'IA para mixagem inteligente com compatibilidade harmônica',
      icon: Zap
    },
    {
      title: 'Waveform Interativo',
      description: 'Comentários temporais e análise visual avançada',
      icon: Music
    },
    {
      title: 'Exportação Profissional',
      description: 'Integração direta com Spotify, SoundCloud e Dropbox',
      icon: Upload
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const canProceed = () => {
    if (steps[currentStep].id === 'role') {
      return selectedRole !== '';
    }
    return true;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="glass border-glass-border p-8">
          {/* Step Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              {React.createElement(steps[currentStep].icon, { className: "h-8 w-8 text-primary" })}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Welcome */}
            {steps[currentStep].content === 'welcome' && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center mb-4">
                  <img
                    src="/lovable-uploads/23e55981-72ea-4de5-a422-fa6833eeb2b0.png"
                    alt="RemiXense"
                    className="w-32 h-auto drop-shadow-lg"
                  />
                </div>
                <p className="text-foreground">
                  O RemiXense é sua plataforma completa para criação, análise e compartilhamento musical.
                </p>
                <p className="text-sm text-muted-foreground">
                  Vamos configurar sua experiência em alguns passos simples.
                </p>
              </div>
            )}

            {/* Role Selection */}
            {steps[currentStep].content === 'role' && (
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <role.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {role.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                      {selectedRole === role.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Features */}
            {steps[currentStep].content === 'features' && (
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card/50">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ready */}
            {steps[currentStep].content === 'ready' && (
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    {roles.find(r => r.id === selectedRole)?.title || 'Usuário'}
                  </Badge>
                  <p className="text-foreground">
                    Perfeito! Você está configurado como <strong>{roles.find(r => r.id === selectedRole)?.title}</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Agora você pode começar a explorar todas as funcionalidades do RemiXense.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-neon-blue/10">
                    <div className="text-lg font-bold text-neon-blue">∞</div>
                    <div className="text-xs text-muted-foreground">Uploads</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neon-violet/10">
                    <div className="text-lg font-bold text-neon-violet">IA</div>
                    <div className="text-xs text-muted-foreground">Análise</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neon-teal/10">
                    <div className="text-lg font-bold text-neon-teal">3</div>
                    <div className="text-xs text-muted-foreground">Plataformas</div>
                  </div>
                  <div className="p-3 rounded-lg bg-neon-green/10">
                    <div className="text-lg font-bold text-neon-green">HD</div>
                    <div className="text-xs text-muted-foreground">Qualidade</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-glass-border">
            <Button
              variant="ghost"
              onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="text-muted-foreground"
            >
              Anterior
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}