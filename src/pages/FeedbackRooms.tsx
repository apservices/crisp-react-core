import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mic, Users, MessageCircle, Play, Share2, Plus, Clock, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FeedbackRoom {
  id: string;
  title: string;
  description: string;
  track_url?: string;
  creator_id: string;
  creator_name: string;
  participants: number;
  status: 'active' | 'closed';
  privacy: 'public' | 'private';
  created_at: string;
}

interface FeedbackComment {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  content: string;
  timestamp: number;
  created_at: string;
}

export default function FeedbackRooms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<FeedbackRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    privacy: 'public' as 'public' | 'private'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      // Mock data for feedback rooms
      const mockRooms: FeedbackRoom[] = [
        {
          id: '1',
          title: 'Summer Vibes - Feedback Session',
          description: 'Preciso de feedback na melodia principal e na mixagem',
          track_url: 'https://example.com/track1.mp3',
          creator_id: 'user1',
          creator_name: 'DJ Producer',
          participants: 8,
          status: 'active',
          privacy: 'public',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Techno Loop Arrangement',
          description: 'Como posso melhorar a transição entre as seções?',
          creator_id: 'user2',
          creator_name: 'TechnoMaster',
          participants: 5,
          status: 'active',
          privacy: 'public',
          created_at: new Date().toISOString()
        }
      ];
      setRooms(mockRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Erro ao carregar salas",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha o título da sala",
        variant: "destructive"
      });
      return;
    }

    try {
      const newRoom: FeedbackRoom = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        creator_id: user?.id || '',
        creator_name: user?.user_metadata?.name || 'Usuário',
        participants: 1,
        status: 'active',
        privacy: formData.privacy,
        created_at: new Date().toISOString()
      };

      setRooms([newRoom, ...rooms]);
      
      toast({
        title: "🎤 Sala de Feedback criada!",
        description: `"${formData.title}" está aberta para colaboração`
      });

      setFormData({
        title: '',
        description: '',
        privacy: 'public'
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Erro ao criar sala",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const joinRoom = (roomId: string) => {
    toast({
      title: "🎧 Entrando na sala...",
      description: "Conectando com outros produtores"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <Mic className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando salas de feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-glass-border backdrop-blur-glass">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-heading-xl text-foreground mb-1">
                Salas de Feedback 🎤
              </h1>
              <p className="text-muted-foreground text-sm">
                Colabore em tempo real e aprimorre suas músicas
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="neon" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Sala
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-auto glass">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Criar Sala de Feedback
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Sala *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Feedback para minha nova track"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="O que você gostaria de melhorar na sua música?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Privacidade</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.privacy === 'public' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'public' }))}
                        className="flex-1"
                      >
                        Pública
                      </Button>
                      <Button
                        type="button"
                        variant={formData.privacy === 'private' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, privacy: 'private' }))}
                        className="flex-1"
                      >
                        Privada
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Criar Sala
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mic className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma sala ativa
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Crie sua primeira sala de feedback e receba comentários valiosos da comunidade
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="neon">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Sala
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <Card key={room.id} className="glass border-glass-border hover:border-primary/30 transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg text-foreground">
                          {room.title}
                        </CardTitle>
                        <Badge variant={room.privacy === 'public' ? 'secondary' : 'outline'} className="text-xs">
                          {room.privacy === 'public' ? 'Pública' : 'Privada'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        por {room.creator_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`text-xs ${room.status === 'active' ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'}`}>
                      {room.status === 'active' ? 'Ativa' : 'Fechada'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {room.description && (
                    <p className="text-sm text-muted-foreground">
                      {room.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {room.participants} participantes
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Há {Math.floor(Math.random() * 30 + 1)} min
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {room.track_url && (
                        <Button size="sm" variant="outline" className="h-8">
                          <Play className="h-3 w-3 mr-1" />
                          Ouvir
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="neon"
                        onClick={() => joinRoom(room.id)}
                        disabled={room.status !== 'active'}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Entrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Tips */}
        <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Star className="h-5 w-5 text-amber-500" />
              Dicas para Feedback Efetivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Seja específico: "A batida no compasso 16 está muito alta"
            </p>
            <p className="text-sm text-muted-foreground">
              • Dê feedback construtivo: sugira melhorias, não apenas critique
            </p>
            <p className="text-sm text-muted-foreground">
              • Use timestamps para indicar momentos específicos da música
            </p>
            <p className="text-sm text-muted-foreground">
              • Seja respeitoso e apoie outros produtores da comunidade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}