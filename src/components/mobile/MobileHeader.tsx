import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, Newspaper, Wallet, Zap, Users, Settings, Home, BarChart3, PieChart, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import CryptoPriceTicker from '@/components/CryptoPriceTicker';
import MemeLiveTicker from '@/pages/memepage/components/MemeLiveTicker';
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
  const { t } = useLanguage();

  // Hide menu on trading pages
  const isTradingPage = location.pathname.startsWith('/crypto/');
  const isMemeZone = location.pathname.startsWith('/meme');
  const shouldShowMenu = showMenu && !isTradingPage;
  const shouldShowTicker = !isTradingPage;
  const navItems = [{
    name: t('nav.home'),
    href: "/",
    icon: Home,
    route: true,
    description: t('desc.home')
  }, {
    name: t('nav.market'),
    href: "/marknad",
    icon: TrendingUp,
    route: true,
    description: t('desc.market')
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
    name: t('nav.tools'),
    href: "/verktyg",
    icon: Settings,
    route: true,
    description: t('desc.tools')
  }, {
    name: t('nav.news'),
    href: "/nyheter",
    icon: Newspaper,
    route: true,
    description: t('desc.news')
  }, {
    name: t('nav.community'),
    href: "/community",
    icon: Users,
    route: true,
    description: t('desc.community')
  }];
  return <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/50 z-[110] md:hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <img src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png" alt="Crypto Network Sweden" className="h-8 w-8 object-contain drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]" />
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
              <SheetContent side="right" className="w-full bg-background/98 backdrop-blur-xl border-l border-border z-[120] flex flex-col">
                <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => {
                  navigate('/');
                  setIsOpen(false);
                }} className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <img src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png" alt="Crypto Network Sweden" className="h-8 w-auto" />
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

                {/* Language Switcher */}
                <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                  <LanguageSwitcher />
                </div>

                {/* Wallet Connect Section */}
                <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="font-crypto text-xs text-muted-foreground mb-3 uppercase tracking-wider">{t('nav.wallet')}</div>
                  <ConnectWalletButton />
                </div>
                <nav className="space-y-2 pb-6">
                  {navItems.map(item => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.href || item.href.startsWith('/crypto') && location.pathname.startsWith('/crypto');
                  return <button key={item.name} onClick={() => {
                    if (item.route) {
                      navigate(item.href);
                    }
                    setIsOpen(false);
                  }} className={`flex items-center justify-between w-full p-4 rounded-xl transition-all duration-200 group ${isActive ? 'bg-primary/10 border border-primary/20 text-primary' : 'hover:bg-muted/50 border border-transparent'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted/30 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-crypto font-bold tracking-wider uppercase text-sm">
                              {item.name}
                            </div>
                            
                          </div>
                        </div>
                        {item.route}
                      </button>;
                })}
                </nav>
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
      
      {/* Ticker - show CryptoPriceTicker on non-meme pages, MemeLiveTicker on meme pages */}
      {shouldShowTicker && (
        <div className="border-t border-border/30">
          {isMemeZone ? <MemeLiveTicker /> : <CryptoPriceTicker />}
        </div>
      )}
    </div>;
};
export default MobileHeader;