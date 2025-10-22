import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTracks } from '@/hooks/useTracks';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { 
  User, 
  Edit3, 
  Music, 
  Calendar, 
  MapPin, 
  Globe, 
  Share2, 
  Award,
  TrendingUp,
  Clock,
  PlayCircle,
  Plus,
  LogOut,
  Save,
  X,
  Mail
} from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { tracks, loading: tracksLoading } = useTracks();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    dj_name: profile?.dj_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
  });

  // Update form data when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        dj_name: profile.dj_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
      });
    }
  });

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      dj_name: profile?.dj_name || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
    });
    setIsEditing(false);
  };

  const profileStats = [
    { 
      label: "Tracks", 
      value: tracks?.length.toString() || "0", 
      icon: PlayCircle, 
      color: "text-neon-blue" 
    },
    { 
      label: "Playlists", 
      value: "0", 
      icon: TrendingUp, 
      color: "text-neon-violet" 
    },
    { 
      label: "Horas", 
      value: tracks?.length ? Math.round(tracks.reduce((acc, track) => {
        const [min, sec] = track.duration.split(':').map(Number);
        return acc + min + sec / 60;
      }, 0) / 60 * 10) / 10 + "h" : "0h", 
      icon: Clock, 
      color: "text-neon-teal" 
    }
  ];

  const achievements = [
    { title: "Primeira Música", description: "Upload de primeira track", icon: "🎵", completed: (tracks?.length || 0) > 0 },
    { title: "Colecionador", description: "10 tracks no vault", icon: "🔥", completed: (tracks?.length || 0) >= 10 },
    { title: "Diversidade", description: "5 gêneros diferentes", icon: "⭐", completed: false },
    { title: "Ativo", description: "Profile completo", icon: "👥", completed: !!(profile?.dj_name && profile?.bio) }
  ];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Profile */}
      <div className="relative">
        {/* Cover Background */}
        <div className="h-32 bg-gradient-primary" />
        
        {/* Profile Info */}
        <div className="px-4 pb-6">
          <div className="relative -mt-16 mb-4">
            <Avatar className="w-24 h-24 border-4 border-background mx-auto">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {profile?.dj_name?.charAt(0) || user?.email?.charAt(0) || 'R'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center mb-6">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="dj_name" className="text-foreground text-sm">
                    RemiXer Username
                  </Label>
                  <Input 
                    id="dj_name"
                    value={formData.dj_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, dj_name: e.target.value }))}
                    className="text-center text-xl font-bold"
                    placeholder="Seu RemiXer Username"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-foreground text-sm">
                    Bio
                  </Label>
                  <Textarea 
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="text-center"
                    rows={3}
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-foreground text-sm">
                    Localização
                  </Label>
                  <Input 
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="text-center"
                    placeholder="Cidade, País"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="neon" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-heading-xl text-foreground mb-2">
                  {profile?.dj_name || 'RemiXer'}
                </h1>
                <p className="text-muted-foreground text-sm mb-2 max-w-xs mx-auto">
                  {profile?.bio || 'Adicione uma bio para contar sobre você...'}
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {profile?.location && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {profileStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="glass border-glass-border p-3 text-center">
                  <Icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-lg font-bold text-foreground font-heading">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="neon" className="h-11">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="glass" className="h-11">
              <Globe className="h-4 w-4 mr-2" />
              Portfolio
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass mb-6">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="platforms">Plataformas</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            {/* Genres */}
            <Card className="glass border-glass-border p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Music className="h-4 w-4" />
                Gêneros Favoritos
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {profile?.favorite_genres?.length ? (
                  profile.favorite_genres.map((genre, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-primary/30 text-primary"
                    >
                      {genre}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum gênero adicionado ainda
                  </p>
                )}
              </div>
              
              <Button variant="ghost" size="sm" className="w-full mt-3">
                <Edit3 className="h-4 w-4 mr-2" />
                Editar Gêneros
              </Button>
            </Card>

            {/* Recent Tracks */}
            {tracks && tracks.length > 0 && (
              <Card className="glass border-glass-border p-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Últimas Adições
                </h3>
                
                <div className="space-y-2">
                  {tracks.slice(0, 3).map((track, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-foreground font-medium text-sm">{track.title}</p>
                        <p className="text-muted-foreground text-xs">{track.artist}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground text-sm">{track.duration}</p>
                        <Badge variant="outline" className="text-xs">
                          {track.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <Card className="glass border-glass-border p-4">
              <h3 className="font-semibold text-foreground mb-4">
                Conectar Plataformas
              </h3>
              <p className="text-muted-foreground text-sm">
                Em breve: conecte suas contas Spotify, SoundCloud e Dropbox para export automático.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card className="glass border-glass-border p-4">
              <h3 className="font-semibold text-foreground mb-4">
                Informações da Conta
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground">{user?.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Membro desde</span>
                  <span className="text-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="glass border-glass-border p-4">
              <h3 className="font-semibold text-foreground mb-4">
                Ações da Conta
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sair da conta
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <h2 className="text-heading-lg text-foreground mb-4">
              Conquistas
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement, index) => (
                <Card key={index} className={`glass border-glass-border p-4 ${achievement.completed ? 'border-primary/30' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.completed ? (
                      <Award className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="h-5 w-5 border border-muted-foreground rounded-full" />
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="glass border-glass-border p-4 text-center">
              <h3 className="font-semibold text-foreground mb-2">
                Continue Explorando!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione mais tracks e complete seu perfil para desbloquear mais conquistas.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}