import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { extractAudioMetadata } from "@/utils/audioMetadata";
import { Upload, Music, X, Check, AlertCircle, FileAudio, Brain, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'analyzing' | 'ready' | 'uploading' | 'success' | 'error';
  metadata?: any;
  error?: string;
  progress?: number;
}

interface MultiFileUploadDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB per file
const MAX_FILES = 10; // Max 10 files per batch

export function MultiFileUploadDialog({ children, onSuccess }: MultiFileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [globalProgress, setGlobalProgress] = useState(0);
  
  const { uploadAudio } = useAudioUpload();
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('audio/')) return 'Arquivo deve ser de áudio';
    if (file.size > MAX_FILE_SIZE) return `Arquivo muito grande (máx: ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
    return null;
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast({ title: "Limite excedido", description: `Máximo de ${MAX_FILES} arquivos por vez`, variant: "destructive" });
      return;
    }

    const newFiles: FileUploadItem[] = [];
    for (const file of selectedFiles) {
      const error = validateFile(file);
      if (error) {
        toast({ title: "Arquivo inválido", description: `${file.name}: ${error}`, variant: "destructive" });
        continue;
      }
      newFiles.push({ id: generateId(), file, status: 'pending' });
    }

    setFiles(prev => [...prev, ...newFiles]);
    for (const fileItem of newFiles) {
      analyzeFile(fileItem.id);
    }
  }, [files.length]);

  const analyzeFile = async (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'analyzing' } : f));
    try {
      const current = files.find(f => f.id === fileId) || files[files.length - 1];
      if (!current) return;
      const metadata = await extractAudioMetadata(current.file);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, metadata, status: 'ready' } : f));
    } catch (error) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error', error: 'Erro na análise' } : f));
    }
  };

  const removeFile = (fileId: string) => setFiles(prev => prev.filter(f => f.id !== fileId));

  const uploadAllFiles = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    if (readyFiles.length === 0) {
      toast({ title: "Nenhum arquivo pronto", description: "Aguarde a análise dos arquivos", variant: "destructive" });
      return;
    }

    let completed = 0; const total = readyFiles.length;
    for (const fileItem of readyFiles) {
      try {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f));
        const baseTitle = fileItem.file.name.replace(/\.[^/.]+$/, "");
        const metadata = fileItem.metadata;
        await uploadAudio(fileItem.file, {
          title: baseTitle,
          artist: 'Unknown Artist',
          type: 'track',
          bpm: metadata?.bpm,
          energy_level: metadata?.energy,
          genre: metadata?.genre,
          tags: metadata?.instruments
        });
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'success', progress: 100 } : f));
        completed++; setGlobalProgress((completed / total) * 100);
      } catch (error) {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', error: 'Falha no upload' } : f));
      }
    }

    const successCount = files.filter(f => f.status === 'success').length;
    toast({ title: "Upload concluído", description: `${successCount} de ${total} arquivos enviados com sucesso` });
    if (successCount > 0) {
      onSuccess?.();
      setTimeout(() => { setFiles([]); setGlobalProgress(0); setOpen(false); }, 2000);
    }
  };

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'pending': return <FileAudio className="h-4 w-4 text-muted-foreground" />;
      case 'analyzing': return <Brain className="h-4 w-4 text-primary animate-pulse" />;
      case 'ready': return <Check className="h-4 w-4 text-green-500" />;
      case 'uploading': return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileAudio className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'analyzing': return 'bg-blue-500/10 border-blue-500/20';
      case 'ready': return 'bg-green-500/10 border-green-500/20';
      case 'uploading': return 'bg-primary/10 border-primary/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  const allReady = files.length > 0 && files.every(f => f.status === 'ready' || f.status === 'success' || f.status === 'error');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl mx-auto glass max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Múltiplo de Áudio
            <Badge variant="outline" className="ml-auto">{files.length}/{MAX_FILES}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="files">Selecionar Arquivos</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input id="files" type="file" accept="audio/*" multiple onChange={handleFileSelect} className="hidden" />
              <label htmlFor="files" className="cursor-pointer flex flex-col items-center gap-3">
                <Music className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground mb-1">Clique para selecionar arquivos de áudio</p>
                  <p className="text-xs text-muted-foreground">Máximo {MAX_FILES} arquivos, até {MAX_FILE_SIZE / 1024 / 1024}MB cada</p>
                </div>
              </label>
            </div>
          </div>

          {/* Global Progress */}
          {files.length > 0 && globalProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Geral</span>
                <span>{Math.round(globalProgress)}%</span>
              </div>
              <Progress value={globalProgress} className="h-2" />
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Arquivos Selecionados</h3>
                <Button variant="outline" size="sm" onClick={() => setFiles([])} className="text-red-500 hover:text-red-600">Limpar Todos</Button>
              </div>
              {files.map((fileItem) => (
                <Card key={fileItem.id} className={`p-4 ${getStatusColor(fileItem.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(fileItem.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{fileItem.file.name}</p>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(fileItem.id)} className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{(fileItem.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      {fileItem.error && <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>}
                      {fileItem.progress !== undefined && (
                        <div className="mt-2"><Progress value={fileItem.progress} className="h-1" /></div>
                      )}
                      {/* Metadata preview */}
                      {fileItem.metadata && (
                        <div className="flex gap-2 mt-2">
                          {fileItem.metadata.bpm && (
                            <Badge variant="outline" className="text-xs">{fileItem.metadata.bpm} BPM</Badge>
                          )}
                          {fileItem.metadata.key && (
                            <Badge variant="outline" className="text-xs">{fileItem.metadata.key}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Actions */}
          {files.length > 0 && (
            <div className="flex gap-3 pt-4 border-t border-glass-border">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={uploadAllFiles} disabled={!allReady} className="flex-1 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Enviar Todos ({files.filter(f => f.status === 'ready').length})
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
