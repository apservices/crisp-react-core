import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CalendarDays, Clock, Target, Bell, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LaunchEvent {
  id: string;
  title: string;
  description: string;
  launch_date: string;
  status: 'planned' | 'in_progress' | 'completed';
  platform: string;
  user_id: string;
  created_at: string;
}

export default function LaunchCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<LaunchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    launch_date: '',
    platform: ''
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      // Mock data for now - in production this would query the launch_events table
      const mockEvents: LaunchEvent[] = [
        {
          id: '1',
          title: 'Summer Vibes EP',
          description: 'Lançamento do EP de verão com 4 faixas',
          launch_date: '2024-08-15',
          status: 'planned',
          platform: 'Spotify, Apple Music',
          user_id: user?.id || '',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Remix Contest',
          description: 'Concurso de remix da faixa principal',
          launch_date: '2024-08-20',
          status: 'in_progress',
          platform: 'RemiXense Community',
          user_id: user?.id || '',
          created_at: new Date().toISOString()
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.launch_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e data de lançamento",
        variant: "destructive"
      });
      return;
    }

    try {
      // In production, this would insert into launch_events table
      const newEvent: LaunchEvent = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        launch_date: formData.launch_date,
        status: 'planned',
        platform: formData.platform,
        user_id: user?.id || '',
        created_at: new Date().toISOString()
      };

      setEvents([...events, newEvent]);
      
      toast({
        title: "📅 Evento criado!",
        description: `"${formData.title}" agendado para ${new Date(formData.launch_date).toLocaleDateString('pt-BR')}`
      });

      setFormData({
        title: '',
        description: '',
        launch_date: '',
        platform: ''
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro ao criar evento",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Progresso';
      default: return 'Planejado';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando calendário...</p>
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
                Calendário de Lançamentos 📅
              </h1>
              <p className="text-muted-foreground text-sm">
                Organize seus lançamentos e mantenha tudo sob controle
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="neon" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-auto glass">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Criar Evento de Lançamento
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome do lançamento"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva seu lançamento..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="launch_date">Data de Lançamento *</Label>
                    <Input
                      id="launch_date"
                      type="date"
                      value={formData.launch_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, launch_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Plataformas</Label>
                    <Input
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                      placeholder="Spotify, Apple Music, YouTube..."
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Criar Evento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum evento agendado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Crie seu primeiro evento de lançamento e mantenha sua carreira organizada
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="neon">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Evento
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="glass border-glass-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground mb-1">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(event.launch_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  
                  {event.platform && (
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {event.platform}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Lembrete ativo
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}