import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MarketplaceUploadDialog } from '@/components/MarketplaceUploadDialog';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, DollarSign, Play, ShoppingCart, Upload, Star, Crown, Filter } from 'lucide-react';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  tags: string[];
  license_type: string;
  seller_id: string;
  seller_name: string;
  created_at: string;
}

export default function Marketplace() {
  const { user } = useAuth();
  const { canUseMarketplace, isPro, isExpert } = useSubscription();
  const { toast } = useToast();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  const fetchMarketplaceItems = async () => {
    try {
      // For now, return mock data since marketplace_items table doesn't exist yet
      // TODO: Create marketplace_items table and uncomment real query
      const mockItems: MarketplaceItem[] = [
        {
          id: '1',
          title: 'Deep House Sample Pack',
          description: 'Atmospheric samples for deep house productions',
          type: 'sample',
          price: 19.90,
          tags: ['deep house', 'atmospheric', 'vinyl'],
          license_type: 'non_exclusive',
          seller_id: 'mock-seller-1',
          seller_name: 'DJ Producer',
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'Techno Loop Collection',
          description: 'Industrial techno loops and percussion',
          type: 'loop',
          price: 24.90,
          tags: ['techno', 'industrial', 'percussion'],
          license_type: 'exclusive',
          seller_id: 'mock-seller-2',
          seller_name: 'Underground Artist',
          created_at: new Date().toISOString()
        }
      ];

      setItems(mockItems);
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      toast({
        title: "Erro ao carregar marketplace",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId: string, price: number) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comprar itens",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create Stripe checkout for marketplace item
      const { data, error } = await supabase.functions.invoke('create-marketplace-checkout', {
        body: { item_id: itemId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro na compra",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === "all" || item.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando marketplace...</p>
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
                Marketplace 🛒
              </h1>
              <p className="text-muted-foreground text-sm">
                Compre e venda samples, loops e presets
              </p>
            </div>
            {canUseMarketplace() && (
              <MarketplaceUploadDialog onSuccess={fetchMarketplaceItems}>
                <Button variant="neon" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Vender
                </Button>
              </MarketplaceUploadDialog>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar samples, loops, presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-3 bg-muted border border-border rounded-lg text-foreground text-sm"
            >
              <option value="all">Todos</option>
              <option value="sample">Samples</option>
              <option value="loop">Loops</option>
              <option value="preset">Presets</option>
              <option value="stem">Stems</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {!canUseMarketplace() && (
          <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {isPro ? <Star className="h-8 w-8 text-blue-500" /> : <Crown className="h-8 w-8 text-amber-500" />}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Marketplace Exclusivo PRO/EXPERT
              </h3>
              <p className="text-muted-foreground mb-4">
                Acesse milhares de samples, loops e presets exclusivos da comunidade RemiXense
              </p>
              <Button variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </Card>
        )}

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "Nenhum resultado encontrado" : "Marketplace em construção"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery 
                ? "Tente ajustar sua busca ou filtros."
                : "Seja um dos primeiros a vender no marketplace RemiXense!"
              }
            </p>
            {canUseMarketplace() && (
              <MarketplaceUploadDialog onSuccess={fetchMarketplaceItems}>
                <Button variant="neon">
                  <Upload className="h-4 w-4 mr-2" />
                  Publicar Item
                </Button>
              </MarketplaceUploadDialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="glass border-glass-border hover:border-primary/30 transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.license_type === 'exclusive' ? 'Exclusiva' : 'Não Exclusiva'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-foreground">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    por {item.seller_name}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" disabled>
                        <Play className="h-3 w-3" />
                      </Button>
                      <span className="text-lg font-bold text-primary">
                        R$ {item.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="neon"
                      onClick={() => handlePurchase(item.id, item.price)}
                      disabled={!canUseMarketplace() || item.seller_id === user?.id}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Comprar
                    </Button>
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