
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { useAudioAnalysis } from "@/hooks/useAudioAnalysis";
import { extractAudioMetadata } from "@/utils/audioMetadata";
import { Upload, Music, X, Zap, Clock, Brain, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
interface EnhancedAudioUploadDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function EnhancedAudioUploadDialog({ children, onSuccess }: EnhancedAudioUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    type: "track" as "track" | "remix" | "sample",
    genre: "",
    bpm: "",
    energy: "",
    tags: [] as string[],
    notes: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  const { uploadAudio, uploading, progress } = useAudioUpload();
  const { analyzeAudioFile, isAnalyzing } = useAudioAnalysis();
  const { toast } = useToast();
  const { session } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('audio/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de áudio",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setAnalyzing(true);
    
    try {
      // Basic metadata extraction
      const extractedMetadata = await extractAudioMetadata(selectedFile);
      setMetadata(extractedMetadata);
      
      // Advanced AI analysis
      const loadImage = (file: Blob): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      };

      // Convert audio file to analyzable format
      const audioUrl = URL.createObjectURL(selectedFile);
      const audioElement = new Audio(audioUrl);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout loading audio metadata'));
        }, 5000);
        
        audioElement.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          resolve(undefined);
        });
        audioElement.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error('Error loading audio'));
        });
        audioElement.load();
      });

      const aiResult = await analyzeAudioFile(selectedFile);
      setAiAnalysis(aiResult);
      
      // Auto-fill form with AI-enhanced metadata
      setFormData(prev => ({
        ...prev,
        title: prev.title || selectedFile.name.replace(/\.[^/.]+$/, ""),
        bpm: aiResult?.features.bpm.toString() || extractedMetadata.bpm?.toString() || "",
        energy: Math.round((aiResult?.features.energy === 'low' ? 3 : aiResult?.features.energy === 'medium' ? 6 : 9)).toString() || extractedMetadata.energy?.toString() || ""
      }));
      
      toast({
        title: "✨ Análise IA Completa!",
        description: `🎵 ${aiResult?.features.instruments.join(', ')} | 🎯 ${aiResult?.confidence}% confiança`,
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Análise básica realizada. IA indisponível.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !formData.title || !formData.artist) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e artista",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadAudio(file, {
        title: formData.title,
        artist: formData.artist,
        type: formData.type,
        genre: formData.genre || undefined,
        bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
        energy_level: formData.energy ? parseInt(formData.energy) : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      });

      // Reset form
      setFile(null);
      setMetadata(null);
      setAiAnalysis(null);
      setFormData({
        title: "",
        artist: "",
        type: "track",
        genre: "",
        bpm: "",
        energy: "",
        tags: [],
        notes: ""
      });
      
      setOpen(false);
      
      // Success feedback with celebration
      toast({
        title: "🎉 Upload Realizado!",
        description: `"${formData.title}" foi adicionado ao seu vault com sucesso!`,
      });
      
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto glass max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Áudio
          </DialogTitle>
          <DialogDescription>
            Selecione um arquivo de áudio e preencha os detalhes para enviar ao seu vault.
          </DialogDescription>
        </DialogHeader>

        {!session && (
          <div className="rounded-md border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            Para enviar arquivos, faça login com e-mail e senha. Os botões Free/Premium/Pro são apenas para demo e não permitem upload.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo de Áudio</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input
                id="file"
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={!session}
              />
              <label
                htmlFor="file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Music className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Clique para selecionar um arquivo"}
                </p>
              </label>
            </div>
          </div>

          {/* Analysis Progress */}
          {(analyzing || isAnalyzing) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm text-foreground">
                  {isAnalyzing ? "IA analisando áudio..." : "Extraindo metadados..."}
                </span>
              </div>
              <Progress value={isAnalyzing ? 90 : 45} className="h-1" />
            </div>
          )}

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <div className="glass border-primary/20 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-foreground text-sm">
                  Análise IA Musical
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {aiAnalysis.confidence}% confiança
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">
                    {aiAnalysis.features.bpm}
                  </p>
                  <p className="text-xs text-muted-foreground">BPM</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">
                    {aiAnalysis.features.key}
                  </p>
                  <p className="text-xs text-muted-foreground">Key</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">
                    {aiAnalysis.features.harmonicKey}
                  </p>
                  <p className="text-xs text-muted-foreground">Camelot</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-primary capitalize">
                    {aiAnalysis.features.energy}
                  </p>
                  <p className="text-xs text-muted-foreground">Energia</p>
                </div>
              </div>

              {aiAnalysis.features.instruments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Instrumentos detectados:</p>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysis.features.instruments.map((instrument: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs capitalize">
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Basic Metadata Fallback */}
          {metadata && !aiAnalysis && (
            <div className="glass border-glass-border rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-foreground text-sm">
                Metadados Básicos
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">
                    {metadata.bpm || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">BPM</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">
                    {metadata.duration || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Duração</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome da música"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artista *</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                placeholder="Nome do artista"
                required
              />
            </div>
          </div>

          {/* Type and Genre */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="track">Track</SelectItem>
                  <SelectItem value="remix">Remix</SelectItem>
                  <SelectItem value="sample">Sample</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Gênero</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="House, Techno, etc."
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                value={formData.bpm}
                onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
                placeholder="120"
                min="60"
                max="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy">Energia (1-10)</Label>
              <Input
                id="energy"
                type="number"
                value={formData.energy}
                onChange={(e) => setFormData(prev => ({ ...prev, energy: e.target.value }))}
                placeholder="5"
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Adicionar tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                +
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Enviando...</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress.percentage)}%
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!session || !file || uploading || analyzing || isAnalyzing}
          >
            {uploading ? "Enviando..." : (analyzing || isAnalyzing) ? "Analisando com IA..." : "Fazer Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
