import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MemeTokenCreator from './components/MemeTokenCreator';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const CreateTokenPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const title = 'Skapa Din Meme Token – Token Creator | Crypto Network Sweden';
    const description = 'Skapa din egen meme token med vår avancerade token creator. Ladda upp bilder, anpassa metadata och lansera din token på blockchain.';
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

    const canonical = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    const origin = window.location.origin || 'https://cryptonetworksweden.se';
    canonical.setAttribute('href', `${origin}/meme/create`);

    const ldId = 'ld-json-create-token-page';
    const oldLd = document.getElementById(ldId);
    if (oldLd) oldLd.remove();
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = ldId;
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Skapa Din Meme Token – Token Creator',
      description,
      url: `${origin}/meme/create`
    });
    document.head.appendChild(ld);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-secondary rounded-full animate-pulse-glow"></div>
      </div>

      <main className={`${isMobile ? 'pb-24 px-4 pt-6' : 'px-8 pt-6'} relative z-10 space-y-8`}>
        {/* Internal Page Header - No sticky, flows with content */}
        <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/meme')}
              className="h-12 w-12 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Skapa Meme Token
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">Designa din egen meme cryptocurrency med AI</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Beta</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium text-sm">
            <Sparkles className="h-4 w-4" />
            Powered by AI • Blockchain Ready
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Skapa Din Egen Meme Token
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designa och förhandsgranska din meme cryptocurrency med AI-genererade bilder, anpassningsbara metadata och modern UI.
          </p>
        </div>

        <MemeTokenCreator />
      </main>
      
      {/* Mobile Navigation */}
      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default CreateTokenPage;