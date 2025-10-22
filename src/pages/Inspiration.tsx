import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Lightbulb, Mic, Music, Palette, Search, MoreHorizontal, Edit3, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  type: "idea" | "lyrics" | "melody" | "concept";
  tags: string[];
  createdAt: string;
  color: string;
}

export default function Inspiration() {
  const [showNewNote, setShowNewNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const noteTypes = {
    idea: { label: "Ideia", icon: Lightbulb, color: "text-neon-blue" },
    lyrics: { label: "Letra", icon: Mic, color: "text-neon-violet" },
    melody: { label: "Melodia", icon: Music, color: "text-neon-teal" },
    concept: { label: "Conceito", icon: Palette, color: "text-primary" }
  };

  const notes: Note[] = [
    {
      id: "1",
      title: "Drop Progressivo",
      content: "Ideia para um drop que vai construindo camada por camada, começando apenas com kick + bass, depois adiciona hi-hats, depois pad atmosférico...",
      type: "idea",
      tags: ["progressive", "drop", "buildup"],
      createdAt: "2024-01-15",
      color: "border-neon-blue/30"
    },
    {
      id: "2", 
      title: "Vocal Hook - Noite",
      content: "A noite é nossa\nO som que nos move\nNa pista dançamos\nAté o sol nascer",
      type: "lyrics",
      tags: ["vocal", "hook", "noite"],
      createdAt: "2024-01-14",
      color: "border-neon-violet/30"
    },
    {
      id: "3",
      title: "Sequência Arpeggios",
      content: "C - Am - F - G progression mas com arpeggios em 16th notes, talvez usar um Moog lead filter sweep",
      type: "melody",
      tags: ["arpeggio", "progression", "moog"],
      createdAt: "2024-01-12",
      color: "border-neon-teal/30"
    },
    {
      id: "4",
      title: "Set Underground",
      content: "Conceito para set: começar dark & minimal, construir energia gradualmente, clímax tech house, finalizar com deep house melódico",
      type: "concept",
      tags: ["set", "underground", "journey"],
      createdAt: "2024-01-10",
      color: "border-primary/30"
    }
  ];

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-primary" />
              <h1 className="text-heading-xl text-foreground">
                Inspiração & Ideias
              </h1>
            </div>
            <Button 
              variant="neon" 
              size="sm"
              onClick={() => setShowNewNote(!showNewNote)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nas suas ideias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* New Note Form */}
        {showNewNote && (
          <Card className="glass border-glass-border p-4 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">Nova Inspiração</h3>
            
            <div className="space-y-4">
              <Input placeholder="Título da ideia..." />
              
              <Textarea 
                placeholder="Descreva sua inspiração, melodia, conceito ou letra..."
                rows={4}
                className="resize-none"
              />
              
              <div className="flex gap-2 flex-wrap">
                {Object.entries(noteTypes).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      className="border-border"
                    >
                      <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
              
              <Input placeholder="Tags (separadas por vírgula)" />
              
              <div className="flex gap-2">
                <Button variant="default" className="flex-1">
                  Salvar Ideia
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowNewNote(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="glass" className="h-16 flex-col gap-2">
            <Mic className="h-5 w-5 text-neon-violet" />
            <span className="text-xs">Gravar Voz</span>
          </Button>
          <Button variant="glass" className="h-16 flex-col gap-2">
            <Music className="h-5 w-5 text-neon-teal" />
            <span className="text-xs">Humming Capture</span>
          </Button>
        </div>

        {/* Notes Grid */}
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma inspiração encontrada
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "Tente outros termos de busca" : "Comece capturando suas primeiras ideias"}
              </p>
              {!searchQuery && (
                <Button variant="neon" onClick={() => setShowNewNote(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Primeira Inspiração
                </Button>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const noteType = noteTypes[note.type];
              const Icon = noteType.icon;
              
              return (
                <Card 
                  key={note.id} 
                  className={`glass ${note.color} p-4 group hover:border-primary/30 transition-smooth`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${noteType.color}`} />
                      <h3 className="font-medium text-foreground">{note.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                    {note.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs px-2 py-0"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Inspiration Feed */}
        {filteredNotes.length > 0 && (
          <Card className="glass border-glass-border p-4">
            <h3 className="font-semibold text-foreground mb-4">
              💡 Inspiração do Dia
            </h3>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-foreground mb-2 font-medium">
                "A música é o espaço entre as notas"
              </p>
              <p className="text-xs text-muted-foreground">
                — Claude Debussy
              </p>
            </div>
            
            <Button variant="ghost" size="sm" className="w-full mt-3">
              Ver Mais Inspirações
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}