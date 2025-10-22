
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProcessingResult {
  trackId: string;
  serviceType: string;
  result: any;
  cached: boolean;
  creditsUsed: number;
  timestamp: string;
}

interface ServiceConfig {
  name: string;
  creditCost: number;
  description: string;
}

const SERVICES: Record<string, ServiceConfig> = {
  'auto-mastering': {
    name: 'Auto-Mastering',
    creditCost: 5,
    description: 'Masterização automática da faixa'
  },
  'stem-swap': {
    name: 'Stem-Swap',
    creditCost: 3,
    description: 'Separação de stems (vocal, instrumentos, etc.)'
  },
  'mood-analysis': {
    name: 'Mood Analysis',
    creditCost: 2,
    description: 'Análise de humor e energia da música'
  },
  'melody-generator': {
    name: 'Melody Generator',
    creditCost: 4,
    description: 'Geração de melodias compatíveis'
  }
};

export function useCreditAwareServices() {
  const [results, setResults] = useState<Record<string, ProcessingResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Check if result is cached and valid
  const checkCache = useCallback(async (trackId: string, serviceType: string): Promise<ProcessingResult | null> => {
    try {
      const { data, error } = await supabase
        .from('processing_cache')
        .select('*')
        .eq('track_id', trackId)
        .eq('service_type', serviceType)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return {
          trackId,
          serviceType,
          result: data.result,
          cached: true,
          creditsUsed: 0,
          timestamp: data.created_at || new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error('Cache check error:', error);
      return null;
    }
  }, []);

  // Process service with credit deduction
  const processService = useCallback(async (
    trackId: string, 
    serviceType: keyof typeof SERVICES,
    forceReprocess = false
  ): Promise<ProcessingResult | null> => {
    const service = SERVICES[serviceType];
    if (!service) {
      throw new Error(`Service ${serviceType} not found`);
    }

    try {
      setLoading(prev => ({ ...prev, [serviceType]: true }));

      // Check cache first (unless forced reprocess)
      if (!forceReprocess) {
        const cached = await checkCache(trackId, serviceType);
        if (cached) {
          toast({
            title: "Resultado do cache",
            description: `${SERVICES[serviceType].name} carregado do cache (0 créditos)`,
          });
          return { ...cached, cached: true };
        }
      }

      // Check user credits
      const { data: user } = await supabase.auth.getUser();
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', user.user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const creditsAvailable = profile?.credits_remaining || 0;
      if (creditsAvailable < service.creditCost) {
        toast({
          title: "Créditos insuficientes",
          description: `${service.name} requer ${service.creditCost} créditos. Você tem ${creditsAvailable}.`,
          variant: "destructive"
        });
        return null;
      }

      // Deduct credits first
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          credits_remaining: creditsAvailable - service.creditCost 
        })
        .eq('id', user.user?.id);

      if (updateError) throw updateError;

      // Cache the result
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

      const mockResult = {
        [serviceType]: `Processed ${serviceType} for track ${trackId}`,
        timestamp: new Date().toISOString(),
        credits_used: service.creditCost
      };

      const { error: cacheError } = await supabase
        .from('processing_cache')
        .insert({
          user_id: user.user?.id || '',
          track_id: trackId,
          service_type: serviceType,
          result: mockResult,
          credits_used: service.creditCost,
          expires_at: expiresAt.toISOString()
        });

      if (cacheError) {
        console.warn('Cache storage failed:', cacheError);
      }

      const processedResult: ProcessingResult = {
        trackId,
        serviceType,
        result: mockResult,
        cached: false,
        creditsUsed: service.creditCost,
        timestamp: new Date().toISOString()
      };

      setResults(prev => ({ ...prev, [serviceType]: processedResult }));

      toast({
        title: "Processamento concluído",
        description: `${service.name} processado (${service.creditCost} créditos)`,
      });

      return processedResult;

    } catch (error) {
      console.error(`Service ${serviceType} error:`, error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Falha no serviço",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [serviceType]: false }));
    }
  }, [checkCache, toast]);

  // Clear cache for a specific service/track
  const clearCache = useCallback(async (trackId: string, serviceType: string) => {
    try {
      const { error } = await supabase
        .from('processing_cache')
        .delete()
        .eq('track_id', trackId)
        .eq('service_type', serviceType);

      if (error) throw error;

      // Remove from local results
      setResults(prev => {
        const newResults = { ...prev };
        delete newResults[serviceType];
        return newResults;
      });

      toast({
        title: "Cache limpo",
        description: `Cache de ${SERVICES[serviceType]?.name} removido`,
      });

    } catch (error) {
      console.error('Clear cache error:', error);
      toast({
        title: "Erro ao limpar cache",
        description: "Não foi possível limpar o cache",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    results,
    loading,
    processService,
    clearCache,
    services: SERVICES
  };
}
