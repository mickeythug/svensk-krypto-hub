import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, TrendingUp, Users, Newspaper, Settings, BarChart3, Home, Wallet, Zap, PieChart, Star, ExternalLink } from "lucide-react";
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';
import CryptoPriceTicker from '@/components/CryptoPriceTicker';
import MemeLiveTicker from '@/pages/memepage/components/MemeLiveTicker';
import { useLanguage } from '@/contexts/LanguageContext';
interface HeaderProps {
  showTicker?: boolean;
}
const Header = ({
  showTicker = true
}: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    t
  } = useLanguage();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Complete list of all app pages
  const allPages = [{
    name: t('nav.home'),
    href: "/",
    icon: Home,
    route: true,
    description: t('desc.home')
  }, {
    name: "Market",
    href: "/market",
    icon: TrendingUp,
    route: true,
    description: "Market overview"
  }, {
    name: t('nav.portfolio'),
    href: "/portfolio",
    icon: PieChart,
    route: true,
    description: t('desc.portfolio')
  }, {
    name: t('nav.trading'),
    href: "/crypto/btc",
    icon: BarChart3,
    route: true,
    description: t('desc.trading')
  }, {
    name: t('nav.memeZone'),
    href: "/meme",
    icon: Zap,
    route: true,
    description: t('desc.memeZone')
  }, {
    name: t('nav.createToken'),
    href: "/meme/create",
    icon: Star,
    route: true,
    description: t('desc.createToken')
  }, {
    name: "Tools",
    href: "/tools",
    icon: Settings,
    route: true,
    description: "Crypto tools"
  }, {
    name: "News",
    href: "/news",
    icon: Newspaper,
    route: true,
    description: "Latest news"
  }, {
    name: "Community",
    href: "/community",
    icon: Users,
    route: true,
    description: "Community & forum"
  }];

  // Main navigation items (visible in desktop nav)
  const mainNavItems = [{
    name: "Market",
    href: "/market",
    icon: TrendingUp,
    route: true
  }, {
    name: "News",
    href: "/news",
    icon: Newspaper,
    route: true
  }, {
    name: t('nav.portfolio'),
    href: "/portfolio",
    icon: PieChart,
    route: true
  }, {
    name: t('nav.trading'),
    href: "/crypto/btc",
    icon: BarChart3,
    route: true
  }, {
    name: t('nav.memeZone'),
    href: "/meme",
    icon: Zap,
    route: true
  }, {
    name: t('nav.community'),
    href: "#community",
    icon: Users,
    route: false
  }];
  const handleNavigation = (item: {
    name: string;
    href: string;
    route: boolean;
  }) => {
    if (item.route) {
      navigate(item.href);
    } else {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(item.href);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }, 100);
      } else {
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    }
    setIsOpen(false);
  };

  // Check if we're on meme pages for ticker selection
  const isMemeZone = location.pathname.startsWith('/meme');
  const shouldShowTicker = showTicker;
  return <header className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${isScrolled ? "bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl" : "bg-background/90 backdrop-blur-md"}`}>
      {/* Main Header */}
      <div className="px-0">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center space-x-4 hover:opacity-80 transition-opacity cursor-pointer ml-2">
            <img src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png" alt="Velo" className={`${isMobile ? 'h-10 w-10 object-contain' : 'h-14 w-auto'} drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]`} />
            {!isMobile && <div>
                <h1 className="font-orbitron text-xl font-bold tracking-wider">
                  <span className="text-brand-turquoise">VE</span>
                  <span className="text-brand-white">LO</span>
                </h1>
                <p className="font-orbitron text-sm font-medium text-muted-foreground tracking-widest">
                  CRYPTO HUB
                </p>
              </div>}
          </button>

          {/* Desktop Navigation */}
          {!isMobile && <nav className="hidden lg:flex items-center space-x-8">
              {mainNavItems.map(item => {
            return <button key={item.name} onClick={() => handleNavigation(item)} className="relative flex items-center space-x-2 text-foreground hover:text-primary transition-all duration-300 font-orbitron font-bold tracking-widest uppercase text-sm hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:scale-105 group">
                    <span className="relative z-10">{item.name}</span>
                    <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>;
          })}
            </nav>}

          {/* CTA Buttons & Hamburger Menu for Desktop */}
          {!isMobile && <div className="flex items-center gap-4 shrink-0 mr-2">
              <ConnectWalletButton />
              {/* Desktop Hamburger Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/40 hover:bg-primary/10">
                    <Menu size={20} className="text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-96 bg-background/98 backdrop-blur-xl border-l border-border z-[120] flex flex-col">
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                    <button onClick={() => {
                  navigate('/');
                  setIsOpen(false);
                }} className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                      <img src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png" alt="Velo" className="h-8 w-auto" />
                      <div>
                        <h1 className="font-orbitron text-sm font-bold">
                          <span className="text-brand-turquoise">VE</span>
                          <span className="text-brand-white">LO</span>
                        </h1>
                        <p className="font-orbitron text-xs text-muted-foreground">
                          CRYPTO HUB
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-6 scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50 scrollbar-thumb-rounded-full">
                    {/* Wallet Connect Section */}
                    <div className="p-4 rounded-xl border border-border bg-muted/30">
                      <div className="font-orbitron text-sm font-bold text-foreground mb-3 uppercase tracking-wider">{t('nav.wallet')}</div>
                      <ConnectWalletButton />
                    </div>
                    {/* Complete Navigation Menu */}
                    <div>
                      <h3 className="font-orbitron text-sm font-bold text-foreground mb-4 uppercase tracking-wider">{t('nav.mainPages')}</h3>
                      <nav className="space-y-2">
                        {allPages.map(item => {
                      const isActive = location.pathname === item.href || item.href.startsWith('/crypto') && location.pathname.startsWith('/crypto');
                      return <button key={item.name} onClick={() => handleNavigation(item)} className={`relative flex items-center justify-between w-full p-4 rounded-xl transition-all duration-300 group ${isActive ? 'bg-primary/10 border border-primary/20 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]' : 'hover:bg-muted/50 border border-transparent hover:shadow-[0_0_8px_hsl(var(--primary)/0.2)] hover:border-primary/10'}`}>
                              <div className="flex items-center space-x-3">
                                <div className="text-left">
                                  <div className="font-orbitron font-bold tracking-wider uppercase text-sm relative z-10">
                                    {item.name}
                                  </div>
                                  
                                </div>
                              </div>
                              {!isActive && <div className="absolute inset-0 rounded-xl bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
                            </button>;
                    })}
                      </nav>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>}
        </div>
      </div>
      
      {/* Crypto Ticker - Integrated into header */}
      {shouldShowTicker && <div className="border-t border-border/30">
          {isMemeZone ? <MemeLiveTicker /> : <CryptoPriceTicker />}
        </div>}
    </header>;
};
export default Header;