import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Check, Star, Crown, Zap } from 'lucide-react';

const PricingPage = () => {
  const { user } = useAuth();
  const { subscription, loading, createCheckoutSession, openCustomerPortal } = useSubscription();

  const plans = [
    {
      name: 'RemiXense Free',
      price: 'Grátis',
      description: 'Para começar sua jornada',
      icon: <Zap className="h-8 w-8" />,
      features: [
        'Até 3 faixas com análise completa',
        '100MB de armazenamento',
        'Análise IA básica (BPM, Key)',
        'Waveform com comentários',
        'Dashboard pessoal'
      ],
      limitations: [
        'Sem exportação para plataformas',
        'Sem acesso à comunidade',
        'Retenção de 50% nas monetizações'
      ],
      current: subscription?.plan_type === 'free',
      buttonText: 'Plano Atual',
      variant: 'outline' as const
    },
    {
      name: 'RemiXense PRO',
      price: 'R$ 19,90',
      priceDetail: '/mês',
      description: 'Para produtores sérios',
      icon: <Star className="h-8 w-8" />,
      popular: true,
      features: [
        'Uploads ilimitados',
        '2GB de armazenamento',
        'Análise IA completa',
        'Exportação para Dropbox, Spotify, SoundCloud',
        'Acesso limitado à comunidade',
        'Quick Mix com IA',
        'Sessões RemiXer avançadas'
      ],
      limitations: [
        'Retenção de 30% nas monetizações'
      ],
      current: subscription?.plan_type === 'pro',
      buttonText: subscription?.plan_type === 'pro' ? 'Gerenciar' : 'Assinar PRO',
      variant: 'default' as const,
      planKey: 'pro' as const
    },
    {
      name: 'RemiXense Expert',
      price: 'R$ 49,90',
      priceDetail: '/mês',
      description: 'Para profissionais e labels',
      icon: <Crown className="h-8 w-8" />,
      features: [
        'Tudo do PRO +',
        '10GB de armazenamento premium',
        'Acesso completo à comunidade',
        'Colaborações pagas e gratuitas',
        'Sessões RemiXer IA ao vivo',
        'Preferências de destaque',
        'Marketplace premium',
        'Suporte prioritário'
      ],
      limitations: [
        'Retenção reduzida de 20%'
      ],
      current: subscription?.plan_type === 'expert',
      buttonText: subscription?.plan_type === 'expert' ? 'Gerenciar' : 'Assinar Expert',
      variant: 'secondary' as const,
      planKey: 'expert' as const
    }
  ];

  const handlePlanAction = async (plan: typeof plans[0]) => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    if (plan.current && (plan.planKey === 'pro' || plan.planKey === 'expert')) {
      await openCustomerPortal();
    } else if (plan.planKey) {
      await createCheckoutSession(plan.planKey as 'pro' | 'expert', navigator.language || 'en');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Eleve sua produção musical com ferramentas profissionais de IA e uma comunidade vibrante de criadores.
          </p>
        </div>

        {/* Current Plan Badge */}
        {subscription && (
          <div className="text-center mb-8">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              Plano Atual: {subscription.plan_type.toUpperCase()}
              {subscription.status !== 'active' && (
                <span className="ml-2 text-destructive">
                  ({subscription.status === 'past_due' ? 'Pagamento Pendente' : 'Inativo'})
                </span>
              )}
            </Badge>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-primary shadow-2xl shadow-primary/20' 
                  : 'border-border hover:border-primary/50'
              } ${
                plan.current 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-center py-2 text-sm font-medium">
                  Mais Popular
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.priceDetail && (
                    <span className="text-muted-foreground ml-1">{plan.priceDetail}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Incluído
                  </h4>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Limitações
                    </h4>
                    {plan.limitations.map((limitation, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center mt-0.5 flex-shrink-0">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                        </div>
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant={plan.current ? 'outline' : plan.variant}
                  className="w-full"
                  disabled={loading || (!user && !!plan.planKey) || (plan.name === 'RemiXense Free' && !!plan.current)}
                  onClick={() => handlePlanAction(plan)}
                >
                  {loading ? 'Carregando...' : plan.buttonText}
                </Button>

                {!user && plan.planKey && (
                  <p className="text-xs text-center text-muted-foreground">
                    Faça login para assinar
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Todos os planos incluem suporte técnico e atualizações gratuitas.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Você pode cancelar sua assinatura a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;