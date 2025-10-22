import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Zap,
  Database,
  Shield,
  Cloud,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSystemHealth, type HealthCheck } from '@/hooks/useSystemHealth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemHealthMonitorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export function SystemHealthMonitor({ showDetails = true, compact = false }: SystemHealthMonitorProps) {
  const { health, isChecking, forceHealthCheck, getAverageResponseTime } = useSystemHealth();
  const [isExpanded, setIsExpanded] = useState(!compact);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'healthy': return 'secondary';
      case 'degraded': return 'outline';
      case 'down': return 'destructive';
      case 'checking': return 'secondary';
      default: return 'secondary';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'authentication':
        return <Shield className="h-4 w-4" />;
      case 'storage':
        return <Cloud className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'edge functions':
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  if (compact && !isExpanded) {
    return (
      <Card className="glass border-glass-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <Badge variant={getStatusColor(health.overall)}>
              {health.overall}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {getAverageResponseTime()}ms
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="h-6 w-6 p-0"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass border-glass-border">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">System Health</h3>
            <Badge variant={getStatusColor(health.overall)}>
              {health.overall}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={forceHealthCheck}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {getAverageResponseTime()}ms
            </div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {formatUptime(health.uptime)}
            </div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {health.checks.filter(c => c.status === 'healthy').length}/{health.checks.length}
            </div>
            <div className="text-xs text-muted-foreground">Services</div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Service Details */}
        {showDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground mb-2">Service Status</h4>
            
            {health.checks.map((check) => (
              <div key={check.service} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(check.service)}
                    <span className="text-sm font-medium text-foreground">
                      {check.service}
                    </span>
                    {getStatusIcon(check.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{check.responseTime}ms</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(check.lastCheck, { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Response Time Bar */}
                <div className="w-full bg-muted rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      check.status === 'healthy' 
                        ? 'bg-success' 
                        : check.status === 'degraded' 
                        ? 'bg-warning' 
                        : 'bg-destructive'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (check.responseTime / 2000) * 100)}%` 
                    }}
                  />
                </div>
                
                {/* Error Details */}
                {check.error && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    {check.error}
                  </div>
                )}
                
                {/* Service Details */}
                {check.details && Object.keys(check.details).length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {Object.entries(check.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Last Update */}
        <div className="mt-4 pt-3 border-t border-glass-border">
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {formatDistanceToNow(health.lastUpdate, { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}