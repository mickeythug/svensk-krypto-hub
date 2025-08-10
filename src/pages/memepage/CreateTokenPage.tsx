import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MemeTokenCreator from './components/MemeTokenCreator';
import MobileBottomNavigation from '@/components/mobile/MobileBottomNavigation';
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
    <main className={`min-h-screen bg-gradient-to-br from-background via-mute to-background relative overflow-hidden ${isMobile ? 'pb-20' : ''}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-secondary rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-primary-glow rounded-full animate-spin"></div>
      </div>

      {/* Header */}
      <section className={`${isMobile ? 'py-4 px-3' : 'py-8 px-4'}`}>
        <div className="container mx-auto">
          <div className={`flex items-center gap-4 ${isMobile ? 'mb-4' : 'mb-8'}`}>
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "lg"}
              onClick={() => navigate('/meme')}
              className="font-crypto font-bold border-2 border-primary/50 hover:bg-primary/10 text-primary hover:text-primary-foreground hover:border-primary"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {isMobile ? "TILLBAKA" : "TILLBAKA TILL MEME TOKENS"}
            </Button>
          </div>
          
          <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
            <h1 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-4xl md:text-6xl'} font-black ${isMobile ? 'mb-3' : 'mb-6'} bg-gradient-primary bg-clip-text text-transparent animate-pulse-glow tracking-wider`}>
              SKAPA DIN MEME TOKEN
            </h1>
            <p className={`font-crypto ${isMobile ? 'text-sm' : 'text-xl md:text-2xl'} text-muted-foreground max-w-3xl mx-auto font-semibold ${isMobile ? 'px-2' : ''}`}>
              DESIGNA OCH LANSERA DIN EGEN MEME TOKEN MED VÅR AVANCERADE CREATOR
            </p>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className={`${isMobile ? 'py-8 px-3' : 'py-16 px-4'}`}>
        <div className="container mx-auto">
          <MemeTokenCreator />
        </div>
      </section>
      
      {isMobile && <MobileBottomNavigation />}
    </main>
  );
};

export default CreateTokenPage;