import React, { useState } from 'react';
import { BackgroundUploadPanel } from './BackgroundUploadPanel';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Activity, 
  Plus,
  Settings
} from 'lucide-react';
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { useSystemHealth } from '@/hooks/useSystemHealth';

interface UploadManagerLayoutProps {
  children: React.ReactNode;
}

export function UploadManagerLayout({ children }: UploadManagerLayoutProps) {
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showHealthMonitor, setShowHealthMonitor] = useState(false);
  
  const { uploadQueue, isUploading, analytics } = useBackgroundUpload();
  const { health } = useSystemHealth();

  const activeUploads = uploadQueue.filter(job => 
    job.status === 'uploading' || job.status === 'processing' || job.status === 'pending'
  ).length;

  const hasIssues = health.overall !== 'healthy';

  return (
    <div className="relative">
      {children}
      
      {/* Upload Manager Toggle Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="flex flex-col gap-2">
          {/* System Health Button */}
          <Button
            variant={hasIssues ? "destructive" : "secondary"}
            size="sm"
            onClick={() => setShowHealthMonitor(!showHealthMonitor)}
            className="glass shadow-lg"
          >
            <Activity className="h-4 w-4" />
            {hasIssues && (
              <Badge variant="destructive" className="ml-1 text-xs">
                !
              </Badge>
            )}
          </Button>
          
          {/* Upload Manager Button */}
          <Button
            variant={activeUploads > 0 ? "default" : "secondary"}
            size="sm"
            onClick={() => setShowUploadPanel(!showUploadPanel)}
            className="glass shadow-lg"
          >
            <Upload className="h-4 w-4" />
            {activeUploads > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeUploads}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Background Upload Panel */}
      <BackgroundUploadPanel 
        isOpen={showUploadPanel}
        onToggle={() => setShowUploadPanel(!showUploadPanel)}
      />

      {/* System Health Monitor */}
      {showHealthMonitor && (
        <div className="fixed bottom-4 left-4 w-80 z-50">
          <SystemHealthMonitor showDetails={true} compact={true} />
        </div>
      )}
    </div>
  );
}