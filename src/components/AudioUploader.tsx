
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileAudio, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  trackId?: string;
}

interface AudioUploaderProps {
  onUploadComplete?: (trackId: string) => void;
}

export function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      return 'Apenas arquivos MP3 e WAV são permitidos';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Limite: 5MB';
    }

    return null;
  };

  const processUpload = async (uploadFile: UploadFile) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Update status to uploading
      setUploads(prev => prev.map(u => 
        u.id === uploadFile.id ? { ...u, status: 'uploading', progress: 0 } : u
      ));

      // Create unique filename
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload to audio bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, uploadFile.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: uploadFile.file.type
        });

      if (uploadError) throw uploadError;

      // Update progress to 50%
      setUploads(prev => prev.map(u => 
        u.id === uploadFile.id ? { ...u, progress: 50 } : u
      ));

      // Get audio duration
      const audio = new Audio();
      const duration = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        
        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
        
        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error('Error loading audio'));
        });
        
        audio.src = URL.createObjectURL(uploadFile.file);
      });

      // Update progress to 75%
      setUploads(prev => prev.map(u => 
        u.id === uploadFile.id ? { ...u, progress: 75, status: 'processing' } : u
      ));

      // Create track record with proper type casting
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          title: uploadFile.file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          type: 'track' as const,
          duration,
          file_path: fileName,
          original_filename: uploadFile.file.name,
          file_size: uploadFile.file.size,
          upload_status: 'completed' as const
        })
        .select()
        .single();

      if (trackError) throw trackError;

      // Update to completed
      setUploads(prev => prev.map(u => 
        u.id === uploadFile.id ? { 
          ...u, 
          progress: 100, 
          status: 'completed',
          trackId: track.id 
        } : u
      ));

      toast({
        title: "Upload concluído!",
        description: `${uploadFile.file.name} foi adicionado ao seu vault.`
      });

      if (onUploadComplete) {
        onUploadComplete(track.id);
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      setUploads(prev => prev.map(u => 
        u.id === uploadFile.id ? { 
          ...u, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro no upload'
        } : u
      ));

      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : 'Falha no upload',
        variant: "destructive"
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadFile[] = [];

    for (const file of acceptedFiles) {
      const validationError = validateFile(file);
      
      if (validationError) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name}: ${validationError}`,
          variant: "destructive"
        });
        continue;
      }

      const uploadFile: UploadFile = {
        file,
        id: crypto.randomUUID(),
        progress: 0,
        status: 'uploading'
      };

      newUploads.push(uploadFile);
    }

    if (newUploads.length > 0) {
      setUploads(prev => [...prev, ...newUploads]);

      // Start uploads - fix the callable error
      for (const uploadFile of newUploads) {
        processUpload(uploadFile);
      }
    }
  }, [user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav']
    },
    multiple: true
  });

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Upload className="h-4 w-4 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="default">Enviando</Badge>;
      case 'processing':
        return <Badge variant="default">Processando</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card 
        {...getRootProps()} 
        className={`
          border-2 border-dashed p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Solte os arquivos aqui' : 'Upload de Áudio'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Arraste arquivos MP3 ou WAV aqui, ou clique para selecionar
            </p>
            <p className="text-sm text-muted-foreground">
              Limite: 5MB por arquivo
            </p>
          </div>
        </div>
      </Card>

      {/* Upload List */}
      {uploads.length > 0 && (
        <Card className="p-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              Uploads ({uploads.length})
            </h4>
            
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {getStatusIcon(upload.status)}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{upload.file.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {getStatusBadge(upload.status)}
                  </div>
                  
                  {upload.status === 'uploading' || upload.status === 'processing' ? (
                    <Progress value={upload.progress} className="h-2 mt-2" />
                  ) : null}
                  
                  {upload.error && (
                    <p className="text-sm text-red-500 mt-1">{upload.error}</p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUpload(upload.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
