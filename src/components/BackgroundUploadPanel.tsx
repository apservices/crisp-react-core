import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Minimize2,
  Maximize2,
  Trash,
  FileAudio
} from 'lucide-react';
import { useBackgroundUpload, type UploadJob } from '@/hooks/useBackgroundUpload';
import { formatBytes, formatDuration } from '@/lib/utils';


interface BackgroundUploadPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function BackgroundUploadPanel({ isOpen, onToggle }: BackgroundUploadPanelProps) {
  const { 
    uploadQueue, 
    isUploading, 
    analytics, 
    cancelUpload, 
    retryUpload, 
    clearCompleted 
  } = useBackgroundUpload();
  
  const [isMinimized, setIsMinimized] = useState(false);

  const getStatusIcon = (job: UploadJob) => {
    switch (job.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
      case 'processing':
        return <Upload className="h-4 w-4 text-primary animate-pulse" />;
      case 'retrying':
        return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: UploadJob['status']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'uploading': return 'default';
      case 'processing': return 'default';
      case 'retrying': return 'outline';
      case 'completed': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const activeJobs = uploadQueue.filter(job => 
    job.status !== 'completed' && job.status !== 'error'
  );

  const completedJobs = uploadQueue.filter(job => 
    job.status === 'completed' || job.status === 'error'
  );

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 glass border-glass-border shadow-lg z-50">
      <div className="flex items-center justify-between p-3 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <FileAudio className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-foreground">
            Upload Manager
          </span>
          {isUploading && (
            <Badge variant="secondary" className="text-xs">
              {activeJobs.length} ativos
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="max-h-48">
            <div className="p-3 space-y-2">
              {uploadQueue.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Nenhum upload na fila
                </div>
              ) : (
                <>
                  {/* Active Uploads */}
                  {activeJobs.map((job) => (
                    <div key={job.id} className="space-y-2 p-2 glass rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {getStatusIcon(job)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {job.metadata?.title || job.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {job.metadata?.artist} • {formatBytes(job.file.size)}
                            </p>
                            {job.error && (
                              <p className="text-xs text-destructive mt-1">
                                {job.error}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={getStatusColor(job.status)} 
                            className="text-xs"
                          >
                            {job.status}
                          </Badge>
                          {job.status === 'error' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryUpload(job.id)}
                              className="h-6 w-6 p-0"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                          {(job.status === 'pending' || job.status === 'error') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelUpload(job.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {(job.status === 'uploading' || job.status === 'processing') && (
                        <Progress value={job.progress} className="h-1" />
                      )}
                      
                      {job.retryCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Tentativa {job.retryCount + 1}/4
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Completed/Failed Jobs */}
                  {completedJobs.length > 0 && (
                    <>
                      {activeJobs.length > 0 && <Separator />}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Recentes
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearCompleted}
                          className="h-6 text-xs"
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Limpar
                        </Button>
                      </div>
                      
                      {completedJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex items-center gap-2 p-2 glass rounded-lg opacity-75">
                          {getStatusIcon(job)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate">
                              {job.metadata?.title || job.file.name}
                            </p>
                            {job.endTime && job.startTime && (
                              <p className="text-xs text-muted-foreground">
                                {formatDuration(job.endTime - job.startTime)}
                              </p>
                            )}
                          </div>
                          <Badge variant={getStatusColor(job.status)} className="text-xs">
                            {job.status === 'completed' ? 'OK' : 'Erro'}
                          </Badge>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
          
          {/* Analytics Footer */}
          {uploadQueue.length > 0 && (
            <div className="border-t border-glass-border p-2">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  Taxa de sucesso: {analytics.totalUploads > 0 ? 
                    Math.round((analytics.successfulUploads / analytics.totalUploads) * 100) : 0
                  }%
                </div>
                <div>
                  Total: {formatBytes(analytics.totalBytesUploaded)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
