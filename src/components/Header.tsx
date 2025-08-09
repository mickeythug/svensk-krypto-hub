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
  BarChart3
} from "lucide-react";
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';


const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  const navItems = [
    { name: "Marknad", href: "/marknad", icon: TrendingUp, route: true },
    { name: "Verktyg", href: "/verktyg", icon: Settings, route: true },
    { name: "Handel", href: "/crypto/btc", icon: BarChart3, route: true },
    { name: "Nyheter", href: "/nyheter", icon: Newspaper, route: true },
    { name: "Meme Zone", href: "/meme", icon: Users, route: true },
    { name: "Community", href: "#community", icon: Users, route: false }
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl" 
          : "bg-background/90 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`${isMobile ? 'h-12' : 'h-14'} flex items-center justify-between`}>
          {/* Logo */}
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
              alt="Crypto Network Sweden"
              className={`${isMobile ? 'h-10 w-10 object-contain' : 'h-12 w-auto'} drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]`}
            />
            {!isMobile && (
              <div>
                <h1 className="font-crypto text-lg font-bold text-foreground">
                  CRYPTO NETWORK
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
              {navItems.map((item) => {
                const IconComponent = item.icon;
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

          {/* CTA Buttons */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-4 shrink-0">
              <ConnectWalletButton />
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className={`${isMobile ? 'block' : 'lg:hidden'}`}>
              <Button variant="ghost" size="sm">
                <Menu size={isMobile ? 18 : 20} />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className={`${isMobile ? 'w-full' : 'w-80'} bg-background/98 backdrop-blur-xl border-l border-border z-[60]`}
            >
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <img 
                    src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
                    alt="Crypto Network Sweden"
                    className="h-8 w-auto"
                  />
                  <div>
                    <h1 className="font-crypto text-sm font-bold text-foreground">
                      CRYPTO NETWORK
                    </h1>
                    <p className="font-crypto text-xs text-muted-foreground">
                      SWEDEN
                    </p>
                  </div>
                </button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              <nav className="space-y-4">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item)}
                      className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-muted transition-colors font-crypto font-bold tracking-wider uppercase"
                    >
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;