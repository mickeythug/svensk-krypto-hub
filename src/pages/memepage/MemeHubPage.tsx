import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap, 
  Coins,
  ShoppingCart,
  BarChart3,
  Globe,
  Crown,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';

const MemeHubPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const title = 'Meme Zone Hub - Skapa, Handla & Analysera | Crypto Network Sweden';
    const description = 'Komplett meme token ekosystem: Skapa egna tokens, handla säkert och få djupanalys av marknaden.';
    document.title = title;
    
    const ensureTag = (selector: string, create: () => HTMLElement) => {
      const existing = document.head.querySelector(selector);
      if (existing) return existing as HTMLElement;
      const el = create();
      document.head.appendChild(el);
      return el;
    };

    const md = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    md.setAttribute('content', description);
  }, []);

  const hubFeatures = [
    {
      icon: Coins,
      title: 'Skapa Token',
      description: 'Designa din egen meme cryptocurrency med AI-assistans',
      path: '/meme/create',
      badge: 'New',
      color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      iconColor: 'text-yellow-500'
    },
    {
      icon: ShoppingCart,
      title: 'Handla Tokens',
      description: 'Köp och sälj meme tokens med avancerad marknadsanalys',
      path: '/meme/buy',
      badge: 'Beta',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      iconColor: 'text-green-500'
    },
    {
      icon: BarChart3,
      title: 'Marknadsstatistik',
      description: 'Live data, trender och djupanalys av meme token marknaden',
      path: '/meme/stats',
      badge: 'Live',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      iconColor: 'text-blue-500'
    },
    {
      icon: Zap,
      title: 'Token Explorer',
      description: 'Utforska alla meme tokens med detaljerad information',
      path: '/meme',
      badge: null,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      iconColor: 'text-purple-500'
    }
  ];

  const quickStats = [
    { label: 'Aktiva Tokens', value: '2,847', icon: TrendingUp },
    { label: 'Total Handelsvolym', value: '$125M', icon: BarChart3 },
    { label: 'Community', value: '150K+', icon: Users },
    { label: 'Skapade Tokens', value: '1,234', icon: Crown }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <main className={`${isMobile ? 'pb-24 px-4 pt-6' : 'px-8 pt-6'} space-y-8`}>
        {/* Internal Page Header */}
        <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Meme Zone Hub
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">Ditt centrum för meme token ekosystemet</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium</span>
            </div>
          </div>
        </div>
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-2 rounded-full text-primary font-medium text-sm border border-primary/30">
            <Sparkles className="h-4 w-4" />
            Komplett Meme Token Ekosystem
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
            Skapa, Handla & Analysera
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Allt du behöver för att delta i meme token revolutionen på ett ställe. Från skapande till handel och analys.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardContent className="p-4 text-center">
                  <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hubFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`relative bg-gradient-to-br ${feature.color} backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group`}
                onClick={() => navigate(feature.path)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-background/80 ${feature.iconColor}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                        {feature.badge && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  >
                    Öppna {feature.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Popular Actions */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Populära Aktioner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/meme/buy')}
            >
              <ShoppingCart className="h-4 w-4 mr-3" />
              Köp BONK Token
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/meme/create')}
            >
              <Coins className="h-4 w-4 mr-3" />
              Skapa Min Första Token
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/meme/stats')}
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Se Marknadsstatistik
            </Button>
          </CardContent>
        </Card>
      </main>

      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default MemeHubPage;