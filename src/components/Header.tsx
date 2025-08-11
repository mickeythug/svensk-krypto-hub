import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Menu, 
  X, 
  TrendingUp, 
  Users, 
  Newspaper,
  Settings,
  BarChart3,
  Home,
  Wallet,
  Zap,
  PieChart,
  Star,
  ExternalLink
} from "lucide-react";
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';
import CryptoPriceTicker from '@/components/CryptoPriceTicker';
import MemeLiveTicker from '@/pages/memepage/components/MemeLiveTicker';
import MobileWalletConnect from './mobile/MobileWalletConnect';


const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Complete list of all app pages
  const allPages = [
    { name: "Hem", href: "/", icon: Home, route: true, description: "Startsida" },
    { name: "Marknad", href: "/marknad", icon: TrendingUp, route: true, description: "Marknadsöversikt" },
    { name: "Portfolio", href: "/portfolio", icon: PieChart, route: true, description: "Min portfolio & watchlist" },
    { name: "Handel", href: "/crypto/btc", icon: BarChart3, route: true, description: "Trading & analys" },
    { name: "Meme Zone", href: "/meme", icon: Zap, route: true, description: "Meme coins & tokens" },
    { name: "Skapa Token", href: "/meme/create", icon: Star, route: true, description: "Skapa din egen token" },
    { name: "Verktyg", href: "/verktyg", icon: Settings, route: true, description: "Krypto verktyg" },
    { name: "Nyheter", href: "/nyheter", icon: Newspaper, route: true, description: "Senaste nyheterna" },
    { name: "Community", href: "/community", icon: Users, route: true, description: "Community & forum" }
  ];

  // Main navigation items (visible in desktop nav)
  const mainNavItems = [
    { name: "Marknad", href: "/marknad", icon: TrendingUp, route: true },
    { name: "Portfolio", href: "/portfolio", icon: PieChart, route: true },
    { name: "Handel", href: "/crypto/btc", icon: BarChart3, route: true },
    { name: "Meme Zone", href: "/meme", icon: Zap, route: true },
    { name: "Community", href: "#community", icon: Users, route: false }
  ];

  const handleNavigation = (item: { name: string; href: string; route: boolean }) => {
    if (item.route) {
      navigate(item.href);
    } else {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(item.href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      } else {
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
    setIsOpen(false);
  };

  // Check if we're on trading pages (no ticker on trading pages)
  const isTradingPage = location.pathname.startsWith('/crypto/');
  const isMemeZone = location.pathname.startsWith('/meme');
  const shouldShowTicker = !isTradingPage;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl" 
          : "bg-background/90 backdrop-blur-md"
      }`}
    >
      {/* Main Header */}
      <div className="px-0">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer ml-2"
          >
            <img 
              src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
              alt="Crypto Network Sweden"
              className={`${isMobile ? 'h-10 w-10 object-contain' : 'h-12 w-auto'} drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]`}
            />
            {!isMobile && (
              <div>
                <h1 className="font-crypto text-lg font-bold">
                  <span className="text-brand-turquoise">CRY</span>
                  <span className="text-brand-white">PTO</span>
                  <span> </span>
                  <span className="text-brand-white">NET</span>
                  <span className="text-brand-turquoise">WORK</span>
                </h1>
                <p className="font-crypto text-xs text-muted-foreground">
                  SWEDEN
                </p>
              </div>
            )}
          </button>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden lg:flex items-center space-x-8">
              {mainNavItems.map((item) => {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-crypto font-bold tracking-wider uppercase text-sm"
                  >
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* CTA Buttons & Hamburger Menu for Desktop */}
          {!isMobile && (
            <div className="flex items-center gap-4 shrink-0 mr-2">
              <ConnectWalletButton />
              {/* Desktop Hamburger Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/40 hover:bg-primary/10">
                    <Menu size={20} className="text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-96 bg-background/98 backdrop-blur-xl border-l border-border z-[60]"
                >
                  <div className="flex items-center justify-between mb-8">
                    <button 
                      onClick={() => {navigate('/'); setIsOpen(false);}}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <img 
                        src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
                        alt="Crypto Network Sweden"
                        className="h-8 w-auto"
                      />
                      <div>
                        <h1 className="font-crypto text-sm font-bold">
                          <span className="text-brand-turquoise">CRY</span>
                          <span className="text-brand-white">PTO</span>
                          <span> </span>
                          <span className="text-brand-white">NET</span>
                          <span className="text-brand-turquoise">WORK</span>
                        </h1>
                        <p className="font-crypto text-xs text-muted-foreground">
                          SWEDEN
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Wallet Connect Section */}
                  {!showWalletConnect ? (
                    <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                      <div className="font-crypto text-xs text-muted-foreground mb-3 uppercase tracking-wider">Plånbok</div>
                      <Button 
                        onClick={() => setShowWalletConnect(true)}
                        className="w-full justify-center bg-gradient-primary hover:opacity-90"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <MobileWalletConnect onBack={() => setShowWalletConnect(false)} />
                    </div>
                  )}

                  {/* Complete Navigation Menu */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-crypto text-xs text-muted-foreground mb-4 uppercase tracking-wider">Huvudsidor</h3>
                      <nav className="space-y-2">
                        {allPages.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = location.pathname === item.href || 
                            (item.href.startsWith('/crypto') && location.pathname.startsWith('/crypto'));
                          
                          return (
                            <button
                              key={item.name}
                              onClick={() => handleNavigation(item)}
                              className={`flex items-center justify-between w-full p-4 rounded-xl transition-all duration-200 group ${
                                isActive 
                                  ? 'bg-primary/10 border border-primary/20 text-primary' 
                                  : 'hover:bg-muted/50 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg transition-colors ${
                                  isActive 
                                    ? 'bg-primary/20 text-primary' 
                                    : 'bg-muted/30 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                }`}>
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                  <div className="font-crypto font-bold tracking-wider uppercase text-sm">
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-display">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                              {item.route && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                              )}
                            </button>
                          );
                        })}
                      </nav>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
      
      {/* Crypto Ticker - Integrated into header */}
      {shouldShowTicker && (
        <div className="border-t border-border/30">
          {isMemeZone ? (
            <MemeLiveTicker />
          ) : (
            <CryptoPriceTicker />
          )}
        </div>
      )}
    </header>
  );
};

export default Header;