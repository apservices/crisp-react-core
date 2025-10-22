import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileAudio, 
  CheckCircle, 
  AlertCircle,
  Music,
  User,
  Clock,
  Headphones
} from 'lucide-react';
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { useDropzone } from 'react-dropzone';

interface EnhancedUploadFlowProps {
  onUploadComplete?: (trackId: string) => void;
}

export function EnhancedUploadFlow({ onUploadComplete }: EnhancedUploadFlowProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const { addToQueue, uploadQueue } = useBackgroundUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        await addToQueue(file);
      } catch (error) {
        console.error('Failed to add file to queue:', error);
      }
    }
  }, [addToQueue]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.aiff']
    },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const recentUploads = uploadQueue.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Area */}
      <Card 
        {...getRootProps()} 
        className={`
          glass border-2 border-dashed transition-all duration-300 cursor-pointer
          ${(isDragActive || dropzoneActive) 
            ? 'border-primary bg-primary/10' 
            : 'border-glass-border hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="p-8 text-center">
          <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className={`h-8 w-8 ${(isDragActive || dropzoneActive) ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {(isDragActive || dropzoneActive) ? 'Solte os arquivos aqui' : 'Enviar Áudios'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            Arraste e solte arquivos de áudio ou clique para selecionar
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">MP3</Badge>
            <Badge variant="outline" className="text-xs">WAV</Badge>
            <Badge variant="outline" className="text-xs">FLAC</Badge>
            <Badge variant="outline" className="text-xs">M4A</Badge>
            <Badge variant="outline" className="text-xs">AAC</Badge>
          </div>
        </div>
      </Card>

      {/* Recent Uploads Preview */}
      {recentUploads.length > 0 && (
        <Card className="glass border-glass-border">
          <div className="p-4">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              Uploads Recentes
            </h4>
            
            <div className="space-y-3">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center gap-3 p-2 glass rounded-lg">
                  <div className="w-8 h-8 glass rounded-full flex items-center justify-center">
                    {upload.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : upload.status === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <FileAudio className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Music className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground truncate">
                        {upload.metadata?.title || upload.file.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {upload.metadata?.artist || 'Unknown Artist'}
                      </div>
                      
                      {upload.metadata?.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(upload.metadata.duration / 60)}:
                          {Math.floor(upload.metadata.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                      
                      {upload.metadata?.format && (
                        <div className="flex items-center gap-1">
                          <Headphones className="h-3 w-3" />
                          {upload.metadata.format.toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {(upload.status === 'uploading' || upload.status === 'processing') && (
                      <Progress value={upload.progress} className="h-1 mt-2" />
                    )}
                    
                    {upload.error && (
                      <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                    )}
                  </div>
                  
                  <Badge 
                    variant={
                      upload.status === 'completed' ? 'secondary' :
                      upload.status === 'error' ? 'destructive' : 
                      'default'
                    }
                    className="text-xs"
                  >
                    {upload.status === 'uploading' ? 'Enviando' :
                     upload.status === 'processing' ? 'Processando' :
                     upload.status === 'completed' ? 'Concluído' :
                     upload.status === 'error' ? 'Erro' :
                     upload.status === 'retrying' ? 'Tentando' :
                     'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}