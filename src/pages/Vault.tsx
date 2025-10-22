
import { useState } from "react";
import { useTracks } from "@/hooks/useTracks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedDJCard } from "@/components/EnhancedDJCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedAudioUploadDialog } from "@/components/EnhancedAudioUploadDialog";
import { Search, Plus, SortDesc, Grid3X3, List, Upload, Music, Filter } from "lucide-react";

export default function Vault() {
  const { tracks, loading, toggleLike, refetch, deleteTrack } = useTracks();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "bpm">("newest");

  const filteredTracks = tracks.filter(track => {
    const matchesFilter = activeFilter === "all" || track.type === activeFilter;
    const matchesSearch = searchQuery === "" || 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "name":
        return a.title.localeCompare(b.title);
      case "bpm":
        return (b.bpm || 0) - (a.bpm || 0);
      default:
        return 0;
    }
  });

  const filterTabs = [
    { id: "all", label: "Todos", count: tracks.length },
    { id: "track", label: "Tracks", count: tracks.filter(t => t.type === "track").length },
    { id: "remix", label: "Remixes", count: tracks.filter(t => t.type === "remix").length },
    { id: "sample", label: "Samples", count: tracks.filter(t => t.type === "sample").length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando vault...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-heading-xl text-foreground">
              Meu Vault 🎵
            </h1>
            <EnhancedAudioUploadDialog onSuccess={refetch}>
              <Button variant="neon" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </EnhancedAudioUploadDialog>
          </div>

          {/* Search & Controls */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar na sua biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-smooth text-sm"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 bg-muted border border-border rounded-lg text-foreground text-sm"
            >
              <option value="newest">Mais recente</option>
              <option value="oldest">Mais antigo</option>
              <option value="name">Nome</option>
              <option value="bpm">BPM</option>
            </select>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0 px-3"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none border-0 px-3"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass">
              {filterTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-xs"
                >
                  {tab.label}
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "Nenhum resultado encontrado" : "Nenhum arquivo encontrado"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery 
                ? "Tente ajustar sua busca ou filtros."
                : "Comece fazendo upload dos seus primeiros tracks, remixes ou samples."
              }
            </p>
            {!searchQuery && (
              <EnhancedAudioUploadDialog onSuccess={refetch}>
                <Button variant="neon">
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </EnhancedAudioUploadDialog>
            )}
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 gap-4" 
              : "space-y-2"
          }>
            {filteredTracks.map((track) => (
              <EnhancedDJCard
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.artist}
                duration={track.duration}
                type={track.type}
                bpm={track.bpm || undefined}
                genre={track.genre || undefined}
                keySignature={track.key_signature || undefined}
                energy={track.energy_level || undefined}
                isLiked={track.is_liked}
                onLike={() => toggleLike(track.id)}
                onPlay={() => console.log("Playing track:", track.id)}
                onComment={() => console.log("Commenting on track:", track.id)}
                onDelete={async () => {
                  try {
                    await deleteTrack(track.id);
                    toast({
                      title: "Track excluído!",
                      description: `${track.title} foi removido do seu vault.`
                    });
                  } catch (error) {
                    toast({
                      title: "Erro ao excluir",
                      description: "Não foi possível excluir o track. Tente novamente.",
                      variant: "destructive"
                    });
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Enhanced Stats Summary */}
        {filteredTracks.length > 0 && (
          <div className="mt-8 glass border-glass-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">
              Estatísticas da Coleção
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-blue font-heading">
                    {filteredTracks.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Arquivos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-violet font-heading">
                    {Math.round(filteredTracks.reduce((acc, track) => {
                      const [min, sec] = track.duration.split(':').map(Number);
                      return acc + min + sec / 60;
                    }, 0))}m
                  </p>
                  <p className="text-xs text-muted-foreground">Duração</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-teal font-heading">
                    {Math.round(filteredTracks.reduce((acc, track) => acc + (track.bpm || 0), 0) / filteredTracks.length) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">BPM Médio</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-neon-green font-heading">
                    {Math.round(filteredTracks.reduce((acc, track) => acc + (track.energy_level || 0), 0) / filteredTracks.length) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Energia Média</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
