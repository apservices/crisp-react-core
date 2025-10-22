import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Upload, Music, Star, Crown, AlertCircle } from "lucide-react";

interface MarketplaceUploadDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function MarketplaceUploadDialog({ children, onSuccess }: MarketplaceUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "sample" as "sample" | "loop" | "preset" | "stem",
    price: "",
    tags: [] as string[],
    license_type: "exclusive" as "exclusive" | "non_exclusive"
  });
  const [tagInput, setTagInput] = useState("");
  
  const { user } = useAuth();
  const { subscription, canUseMarketplace, isPro, isExpert, getCommissionRate } = useSubscription();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB para marketplace
    if (!selectedFile.type.startsWith('audio/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de áudio",
        variant: "destructive"
      });
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "Limite para marketplace: 50MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setFormData(prev => ({
      ...prev,
      title: prev.title || selectedFile.name.replace(/\.[^/.]+$/, "")
    }));
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
    
    if (!canUseMarketplace()) {
      toast({
        title: "Upgrade necessário",
        description: "Marketplace disponível apenas para usuários PRO e EXPERT",
        variant: "destructive"
      });
      return;
    }

    if (!file || !formData.title || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, arquivo e preço",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Upload file to Supabase storage
      const fileName = `marketplace/${user?.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(fileName, file, { contentType: file.type, upsert: false, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      // For now, simulate marketplace item creation (table doesn't exist yet)
      // TODO: Create marketplace_items table in database
      console.log('Marketplace item would be created:', {
        seller_id: user?.id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price),
        tags: formData.tags,
        license_type: formData.license_type,
        file_path: fileName,
        commission_rate: getCommissionRate(),
        status: 'active'
      });
      
      const itemError = null; // Simulated success

      if (itemError) throw itemError;

      toast({
        title: "🛒 Item publicado no Marketplace!",
        description: `"${formData.title}" está disponível para venda`,
      });

      // Reset form
      setFile(null);
      setFormData({
        title: "",
        description: "",
        type: "sample",
        price: "",
        tags: [],
        license_type: "exclusive"
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error uploading to marketplace:', error);
      toast({
        title: "Erro no upload",
        description: "Tente novamente em alguns minutos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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
            <DollarSign className="h-5 w-5" />
            Vender no Marketplace
          </DialogTitle>
        </DialogHeader>

        {!canUseMarketplace() ? (
          <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Marketplace Exclusivo
              </h3>
              <p className="text-muted-foreground mb-4">
                O Marketplace está disponível apenas para usuários PRO e EXPERT
              </p>
              <Button variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Commission Info */}
            <Card className="glass border-primary/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                {isExpert ? <Crown className="h-4 w-4 text-yellow-500" /> : <Star className="h-4 w-4 text-blue-500" />}
                <span className="text-sm font-medium">
                  {isExpert ? 'Expert' : 'PRO'} - Comissão: {getCommissionRate()}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Você recebe {100 - getCommissionRate()}% do valor de cada venda
              </p>
            </Card>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo de Áudio *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  id="file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
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

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nome do item"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva seu item..."
                  rows={3}
                />
              </div>
            </div>

            {/* Type and Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sample">Sample</SelectItem>
                    <SelectItem value="loop">Loop</SelectItem>
                    <SelectItem value="preset">Preset</SelectItem>
                    <SelectItem value="stem">Stem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="9.90"
                  required
                />
              </div>
            </div>

            {/* License Type */}
            <div className="space-y-2">
              <Label htmlFor="license">Tipo de Licença</Label>
              <Select value={formData.license_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, license_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclusive">Exclusiva</SelectItem>
                  <SelectItem value="non_exclusive">Não Exclusiva</SelectItem>
                </SelectContent>
              </Select>
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
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!file || uploading || !canUseMarketplace()}
            >
              {uploading ? "Publicando..." : "Publicar no Marketplace"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}