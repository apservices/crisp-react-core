import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedUploadFlow } from './EnhancedUploadFlow';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { TrashManager } from './TrashManager';
import { 
  Upload, 
  Activity, 
  Trash2, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useUploadAnalytics } from '@/hooks/useUploadAnalytics';

export function UploadDashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [showTrashManager, setShowTrashManager] = useState(false);
  
  const { uploadQueue, analytics: uploadAnalytics } = useBackgroundUpload();
  const { health } = useSystemHealth();
  const { stats, loading: analyticsLoading } = useUploadAnalytics();

  const activeUploads = uploadQueue.filter(job => 
    job.status === 'uploading' || job.status === 'processing' || job.status === 'pending'
  ).length;

  const recentFailures = uploadQueue.filter(job => job.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uploads Ativos</p>
              <p className="text-xl font-semibold text-foreground">{activeUploads}</p>
            </div>
          </div>
        </Card>

        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
              <Activity className={`h-5 w-5 ${health.overall === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sistema</p>
              <p className="text-xl font-semibold text-foreground capitalize">{health.overall}</p>
            </div>
          </div>
        </Card>

        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
              <p className="text-xl font-semibold text-foreground">
                {uploadAnalytics.totalUploads > 0 ? 
                  Math.round((uploadAnalytics.successfulUploads / uploadAnalytics.totalUploads) * 100) : 0
                }%
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass border-glass-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Uploads</p>
              <p className="text-xl font-semibold text-foreground">{uploadAnalytics.totalUploads}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card className="glass border-glass-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between p-4 border-b border-glass-border">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTrashManager(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Lixeira
              </Button>
            </div>
          </div>

          <div className="p-4">
            <TabsContent value="upload" className="mt-0">
              <EnhancedUploadFlow />
            </TabsContent>

            <TabsContent value="health" className="mt-0">
              <SystemHealthMonitor showDetails={true} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              {analyticsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando analytics...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upload Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="glass border-glass-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">Uploads Totais</h4>
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalUploads}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">
                          {stats.successfulUploads} sucessos
                        </span>
                      </div>
                    </Card>

                    <Card className="glass border-glass-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">Taxa de Sucesso</h4>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(stats.successRate)}%
                      </p>
                      <Progress value={stats.successRate} className="mt-2 h-2" />
                    </Card>

                    <Card className="glass border-glass-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">Tempo Médio</h4>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(stats.averageUploadTime / 1000)}s
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por upload
                      </p>
                    </Card>
                  </div>

                  {/* Error Analysis */}
                  {stats.commonErrors.length > 0 && (
                    <Card className="glass border-glass-border">
                      <div className="p-4 border-b border-glass-border">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                          <h4 className="font-medium text-foreground">Erros Mais Comuns</h4>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {stats.commonErrors.map((error, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-foreground flex-1 truncate">
                              {error.error}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {error.count}x
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* File Type Statistics */}
                  {stats.fileTypeStats.length > 0 && (
                    <Card className="glass border-glass-border">
                      <div className="p-4 border-b border-glass-border">
                        <h4 className="font-medium text-foreground">Estatísticas por Tipo</h4>
                      </div>
                      <div className="p-4 space-y-3">
                        {stats.fileTypeStats.map((stat) => (
                          <div key={stat.type} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs font-mono">
                                {stat.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {stat.count} uploads
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {Math.round(stat.successRate)}%
                              </span>
                              <Progress value={stat.successRate} className="w-16 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Trash Manager Modal */}
      <TrashManager 
        isOpen={showTrashManager}
        onClose={() => setShowTrashManager(false)}
      />
    </div>
  );
}