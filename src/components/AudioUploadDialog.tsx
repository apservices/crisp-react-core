import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { Upload, Music, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AudioUploadDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AudioUploadDialog({ children, onSuccess }: AudioUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [type, setType] = useState<'track' | 'remix' | 'sample'>('track');
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const { uploadAudio, uploading, progress } = useAudioUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        alert('Por favor, selecione apenas arquivos de áudio');
        return;
      }
      setFile(selectedFile);
      
      // Auto-fill title from filename if empty
      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !artist) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      await uploadAudio(file, {
        title,
        artist,
        type,
        genre: genre || undefined,
        bpm: bpm ? parseInt(bpm) : undefined,
        energy_level: energyLevel ? parseInt(energyLevel) : undefined,
        tags: tags.length > 0 ? tags : undefined
      });

      // Reset form
      setFile(null);
      setTitle("");
      setArtist("");
      setType('track');
      setGenre("");
      setBpm("");
      setEnergyLevel("");
      setTags([]);
      setNewTag("");
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Music className="h-5 w-5" />
            Upload de Áudio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="file">Arquivo de Áudio *</Label>
            <div className="mt-1">
              <input
                id="file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                disabled={uploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da track"
              disabled={uploading}
              required
            />
          </div>

          {/* Artist */}
          <div>
            <Label htmlFor="artist">Artista *</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nome do artista"
              disabled={uploading}
              required
            />
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as any)} disabled={uploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="track">Track Original</SelectItem>
                <SelectItem value="remix">Remix</SelectItem>
                <SelectItem value="sample">Sample</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Genre */}
            <div>
              <Label htmlFor="genre">Gênero</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ex: Techno"
                disabled={uploading}
              />
            </div>

            {/* BPM */}
            <div>
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="128"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <Label htmlFor="energy">Nível de Energia (1-10)</Label>
            <Input
              id="energy"
              type="number"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              placeholder="7"
              disabled={uploading}
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag"
                disabled={uploading}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm" disabled={uploading}>
                +
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      disabled={uploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fazendo upload...</span>
                <span>{progress.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={progress.percentage} className="w-full" />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading || !file || !title || !artist}
              className="flex-1"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}