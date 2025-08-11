import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  TrendingUp, 
  Newspaper, 
  Wallet, 
  Zap, 
  Users, 
  Settings, 
  Home, 
  BarChart3,
  PieChart,
  Star,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import CryptoPriceTicker from '@/components/CryptoPriceTicker';
import MemeLiveTicker from '@/pages/memepage/components/MemeLiveTicker';
import MobileWalletConnect from './MobileWalletConnect';

interface MobileHeaderProps {
  title: string;
  showMenu?: boolean;
}

const MobileHeader = ({ 
  title, 
  showMenu = true
}: MobileHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  
  // Hide menu on trading pages
  const isTradingPage = location.pathname.startsWith('/crypto/');
  const isMemeZone = location.pathname.startsWith('/meme');
  const shouldShowMenu = showMenu && !isTradingPage;
  const shouldShowTicker = !isTradingPage;

  const navItems = [
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
  
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/50 z-[100] md:hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
              alt="Crypto Network Sweden"
              className="h-8 w-8 object-contain drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]"
            />
            <div className="text-left">
              <h1 className="font-crypto text-sm font-bold leading-none">
                <span className="text-brand-turquoise">CRY</span>
                <span className="text-brand-white">PTO</span>
                <span className="text-brand-white">NET</span>
                <span className="text-brand-turquoise">WORK</span>
              </h1>
              <p className="font-crypto text-xs text-muted-foreground leading-none mt-0.5">
                SWEDEN
              </p>
            </div>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-full bg-background/98 backdrop-blur-xl border-l border-border z-[60] flex flex-col"
              >
                <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <button 
                    onClick={() => {
                      navigate('/');
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <img 
                      src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
                      alt="Crypto Network Sweden"
                      className="h-8 w-auto"
                    />
                    <div>
                      <h1 className="font-crypto text-sm font-bold text-foreground">
                        <span className="text-brand-turquoise">CRY</span>
                        <span className="text-brand-white">PTO</span>
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

                <nav className="space-y-2 pb-6">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.href || 
                      (item.href.startsWith('/crypto') && location.pathname.startsWith('/crypto'));
                    
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          if (item.route) {
                            navigate(item.href);
                          }
                          setIsOpen(false);
                        }}
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
              </SheetContent>
            </Sheet>
        </div>
      </div>
      
      {/* Crypto Ticker - Integrated into mobile header */}
      {shouldShowTicker && (
        <div className="border-t border-border/30">
          {isMemeZone ? (
            <MemeLiveTicker />
          ) : (
            <CryptoPriceTicker />
          )}
        </div>
      )}
    </div>
  );
};

export default MobileHeader;