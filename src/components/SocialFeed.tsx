import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart,
  MessageCircle,
  Share2,
  Play,
  Pause,
  Music,
  User,
  Trophy,
  Calendar,
  TrendingUp,
  Plus,
  Image as ImageIcon,
  AudioWaveform
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified: boolean;
  };
  content: string;
  type: 'set' | 'remix' | 'tip' | 'challenge';
  media?: {
    type: 'audio' | 'image';
    url: string;
    duration?: string;
  };
  metadata?: {
    title?: string;
    genre?: string;
    bpm?: number;
    key?: string;
  };
  stats: {
    likes: number;
    comments: number;
    plays?: number;
  };
  isLiked: boolean;
  isPlaying: boolean;
  timestamp: string;
  tags: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  endDate: string;
  participants: number;
  prize: string;
  theme: string;
}

const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    user: {
      id: 'dj_silva',
      name: 'DJ Silva',
      username: '@djsilva',
      verified: true
    },
    content: 'Novo set progressive house gravado hoje! Foquei nas transições harmônicas 🎧',
    type: 'set',
    media: {
      type: 'audio',
      url: '/audio/set1.mp3',
      duration: '45:32'
    },
    metadata: {
      title: 'Progressive Journey #3',
      genre: 'Progressive House',
      bpm: 128,
      key: 'A minor'
    },
    stats: {
      likes: 89,
      comments: 12,
      plays: 234
    },
    isLiked: false,
    isPlaying: false,
    timestamp: '2h',
    tags: ['progressive', 'house', 'transitions']
  },
  {
    id: '2',
    user: {
      id: 'beatmaker_ana',
      name: 'Ana Beats',
      username: '@anabeats',
      verified: false
    },
    content: 'Dica rápida: Usem o filtro high-pass antes do drop para criar mais tensão! 🔥',
    type: 'tip',
    stats: {
      likes: 156,
      comments: 28
    },
    isLiked: true,
    isPlaying: false,
    timestamp: '5h',
    tags: ['dica', 'producao', 'filter']
  },
  {
    id: '3',
    user: {
      id: 'remix_king',
      name: 'RemixKing',
      username: '@remixking',
      verified: true
    },
    content: 'Participando do desafio de remix tech house! Que acham dessa base?',
    type: 'challenge',
    media: {
      type: 'audio',
      url: '/audio/remix1.mp3',
      duration: '3:45'
    },
    metadata: {
      title: 'Tech Challenge Entry',
      genre: 'Tech House',
      bpm: 125
    },
    stats: {
      likes: 67,
      comments: 15,
      plays: 89
    },
    isLiked: false,
    isPlaying: false,
    timestamp: '1d',
    tags: ['remix', 'challenge', 'techhouse']
  }
];

const ACTIVE_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Tech House Challenge',
    description: 'Crie um remix tech house usando apenas samples fornecidos',
    endDate: '2024-02-15',
    participants: 45,
    prize: 'R$ 500 + destaque no app',
    theme: 'Groove & Energy'
  },
  {
    id: '2',
    title: 'Transition Master',
    description: 'Melhor transição entre gêneros diferentes',
    endDate: '2024-02-20',
    participants: 23,
    prize: 'Controlador Pioneer DDJ-FLX4',
    theme: 'Criatividade'
  }
];

export const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'set' | 'tip' | 'remix'>('tip');
  const [createDialog, setCreateDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sets' | 'tips' | 'challenges'>('all');
  const { toast } = useToast();

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            stats: { 
              ...post.stats, 
              likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1 
            }
          }
        : post
    ));
  };

  const togglePlay = (postId: string) => {
    setPosts(prev => prev.map(post => ({
      ...post,
      isPlaying: post.id === postId ? !post.isPlaying : false
    })));
  };

  const createPost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      user: {
        id: 'current_user',
        name: 'Você',
        username: '@voce',
        verified: false
      },
      content: newPost,
      type: postType,
      stats: {
        likes: 0,
        comments: 0,
        plays: postType === 'set' ? 0 : undefined
      },
      isLiked: false,
      isPlaying: false,
      timestamp: 'agora',
      tags: []
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setCreateDialog(false);
    
    toast({
      title: "Post criado",
      description: "Seu post foi publicado no feed",
    });
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'sets') return post.type === 'set';
    if (filter === 'tips') return post.type === 'tip';
    if (filter === 'challenges') return post.type === 'challenge';
    return true;
  });

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'set': return <AudioWaveform className="h-4 w-4" />;
      case 'tip': return <TrendingUp className="h-4 w-4" />;
      case 'challenge': return <Trophy className="h-4 w-4" />;
      case 'remix': return <Music className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'set': return 'text-neon-blue border-neon-blue/30';
      case 'tip': return 'text-neon-green border-neon-green/30';
      case 'challenge': return 'text-neon-violet border-neon-violet/30';
      case 'remix': return 'text-neon-teal border-neon-teal/30';
      default: return 'text-muted-foreground border-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-lg text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-neon-teal" />
            Feed Social
          </h2>
          <p className="text-muted-foreground">
            Conecte-se com a comunidade RemiXense
          </p>
        </div>
        
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogTrigger asChild>
            <Button className="neon-glow">
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-glass-border">
            <DialogHeader>
              <DialogTitle>Criar Post</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={postType === 'tip' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPostType('tip')}
                >
                  💡 Dica
                </Button>
                <Button
                  variant={postType === 'set' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPostType('set')}
                >
                  🎧 Set
                </Button>
                <Button
                  variant={postType === 'remix' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPostType('remix')}
                >
                  🎵 Remix
                </Button>
              </div>
              
              <Textarea
                placeholder="Compartilhe sua experiência, dica ou set..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="glass min-h-[100px]"
              />
              
              {postType === 'set' && (
                <Button variant="outline" className="w-full">
                  <AudioWaveform className="h-4 w-4 mr-2" />
                  Anexar Áudio
                </Button>
              )}
              
              <Button onClick={createPost} className="w-full">
                Publicar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Challenges */}
      <Card className="glass border-glass-border p-6">
        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-neon-violet" />
            Desafios Ativos
          </h3>
          
          <div className="grid gap-4">
            {ACTIVE_CHALLENGES.map((challenge) => (
              <div key={challenge.id} className="glass rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <Badge variant="outline" className="text-neon-violet border-neon-violet/30">
                    {challenge.theme}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      🏆 {challenge.prize}
                    </span>
                    <span className="text-muted-foreground">
                      👥 {challenge.participants} participantes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">até {challenge.endDate}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="mt-3">
                  Participar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Feed Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={filter === 'sets' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('sets')}
        >
          Sets
        </Button>
        <Button
          variant={filter === 'tips' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('tips')}
        >
          Dicas
        </Button>
        <Button
          variant={filter === 'challenges' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('challenges')}
        >
          Desafios
        </Button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="glass border-glass-border p-6">
            <div className="space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{post.user.name}</span>
                      {post.user.verified && <span className="text-neon-blue">✓</span>}
                      <span className="text-sm text-muted-foreground">{post.user.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{post.timestamp}</span>
                      <Badge variant="outline" className={cn("text-xs", getPostTypeColor(post.type))}>
                        {getPostIcon(post.type)}
                        <span className="ml-1 capitalize">{post.type}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                <p className="text-foreground">{post.content}</p>
                
                {/* Media/Set Info */}
                {post.media && (
                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePlay(post.id)}
                          className="neon-glow"
                        >
                          {post.isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <div>
                          {post.metadata?.title && (
                            <p className="font-medium text-foreground">{post.metadata.title}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {post.media.duration && <span>{post.media.duration}</span>}
                            {post.metadata?.genre && <span>• {post.metadata.genre}</span>}
                            {post.metadata?.bpm && <span>• {post.metadata.bpm} BPM</span>}
                            {post.metadata?.key && <span>• {post.metadata.key}</span>}
                          </div>
                        </div>
                      </div>
                      
                      {post.stats.plays !== undefined && (
                        <div className="text-sm text-muted-foreground">
                          {post.stats.plays} plays
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={cn(
                      "gap-2",
                      post.isLiked && "text-red-400 hover:text-red-300"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                    {post.stats.likes}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {post.stats.comments}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};