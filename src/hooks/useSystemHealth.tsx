import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down' | 'checking';
  responseTime: number;
  lastCheck: Date;
  error?: string;
  details?: Record<string, any>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  checks: HealthCheck[];
  lastUpdate: Date;
  uptime: number;
}

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'healthy',
    checks: [],
    lastUpdate: new Date(),
    uptime: 0,
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const { authHealth, refreshSession } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef(Date.now());

  // Individual health check functions
  const checkAuth = useCallback(async (): Promise<HealthCheck> => {
    const start = Date.now();
    
    try {
      const { data, error } = await supabase.auth.getSession();
      const responseTime = Date.now() - start;
      
      if (error) {
        return {
          service: 'Authentication',
          status: 'down',
          responseTime,
          lastCheck: new Date(),
          error: error.message,
        };
      }

      // Check if token is close to expiring
      const isTokenExpiringSoon = data.session?.expires_at ? 
        (data.session.expires_at * 1000 - Date.now()) < 5 * 60 * 1000 : false;

      return {
        service: 'Authentication',
        status: authHealth.isHealthy && !isTokenExpiringSoon ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date(),
        details: {
          hasSession: !!data.session,
          tokenExpiringSoon: isTokenExpiringSoon,
          lastAuthCheck: authHealth.lastCheck,
          retryCount: authHealth.retryCount,
        },
      };
    } catch (error) {
      return {
        service: 'Authentication',
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [authHealth]);

  const checkStorage = useCallback(async (): Promise<HealthCheck> => {
    const start = Date.now();
    
    try {
      // Test storage connectivity by listing buckets
      const { data, error } = await supabase.storage.listBuckets();
      const responseTime = Date.now() - start;
      
      if (error) {
        return {
          service: 'Storage',
          status: 'down',
          responseTime,
          lastCheck: new Date(),
          error: error.message,
        };
      }

      const tracksBucket = data?.find(bucket => bucket.name === 'tracks');
      const status = tracksBucket ? 'healthy' : 'degraded';
      
      return {
        service: 'Storage',
        status,
        responseTime,
        lastCheck: new Date(),
        details: {
          bucketsAvailable: data?.length || 0,
          tracksBucketExists: !!tracksBucket,
        },
      };
    } catch (error) {
      return {
        service: 'Storage',
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  const checkDatabase = useCallback(async (): Promise<HealthCheck> => {
    const start = Date.now();
    
    try {
      // Test database connectivity with a simple query
      const { data, error } = await supabase
        .from('tracks')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - start;
      
      if (error) {
        return {
          service: 'Database',
          status: 'down',
          responseTime,
          lastCheck: new Date(),
          error: error.message,
        };
      }

      return {
        service: 'Database',
        status: 'healthy',
        responseTime,
        lastCheck: new Date(),
        details: {
          querySuccessful: true,
        },
      };
    } catch (error) {
      return {
        service: 'Database',
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  const checkEdgeFunctions = useCallback(async (): Promise<HealthCheck> => {
    const start = Date.now();
    
    try {
      // Test edge functions with a health check function (if available)
      const { data, error } = await supabase.functions.invoke('health-check', {
        body: { timestamp: Date.now() }
      });
      
      const responseTime = Date.now() - start;
      
      // If health-check function doesn't exist, that's not necessarily an error
      if (error && !error.message?.includes('not found')) {
        return {
          service: 'Edge Functions',
          status: 'down',
          responseTime,
          lastCheck: new Date(),
          error: error.message,
        };
      }

      return {
        service: 'Edge Functions',
        status: error ? 'degraded' : 'healthy',
        responseTime,
        lastCheck: new Date(),
        details: {
          healthCheckAvailable: !error,
        },
      };
    } catch (error) {
      return {
        service: 'Edge Functions',
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  // Run all health checks
  const runHealthChecks = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const checks = await Promise.all([
        checkAuth(),
        checkStorage(),
        checkDatabase(),
        checkEdgeFunctions(),
      ]);

      // Determine overall health
      const downServices = checks.filter(check => check.status === 'down');
      const degradedServices = checks.filter(check => check.status === 'degraded');
      
      let overall: SystemHealth['overall'];
      if (downServices.length > 0) {
        overall = 'down';
      } else if (degradedServices.length > 0) {
        overall = 'degraded';
      } else {
        overall = 'healthy';
      }

      setHealth({
        overall,
        checks,
        lastUpdate: new Date(),
        uptime: Date.now() - startTimeRef.current,
      });

      // Auto-recovery attempts
      if (overall !== 'healthy') {
        // Try to refresh auth session if auth is having issues
        const authCheck = checks.find(c => c.service === 'Authentication');
        if (authCheck?.status !== 'healthy') {
          try {
            await refreshSession();
          } catch (error) {
            console.warn('Auto-recovery failed for auth:', error);
          }
        }
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkAuth, checkStorage, checkDatabase, checkEdgeFunctions, refreshSession]);

  // Start health monitoring
  useEffect(() => {
    // Initial check
    runHealthChecks();

    // Set up periodic checks (every 2 minutes)
    intervalRef.current = setInterval(runHealthChecks, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runHealthChecks]);

  // Manual health check trigger
  const forceHealthCheck = useCallback(async () => {
    await runHealthChecks();
  }, [runHealthChecks]);

  // Get health status for a specific service
  const getServiceHealth = useCallback((serviceName: string): HealthCheck | undefined => {
    return health.checks.find(check => check.service === serviceName);
  }, [health.checks]);

  // Get average response time
  const getAverageResponseTime = useCallback((): number => {
    if (health.checks.length === 0) return 0;
    
    const total = health.checks.reduce((sum, check) => sum + check.responseTime, 0);
    return Math.round(total / health.checks.length);
  }, [health.checks]);

  return {
    health,
    isChecking,
    forceHealthCheck,
    getServiceHealth,
    getAverageResponseTime,
  };
}