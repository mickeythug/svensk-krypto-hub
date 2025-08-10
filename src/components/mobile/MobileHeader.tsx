import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, Newspaper, Wallet, Zap, Users } from "lucide-react";
import { useState } from "react";

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
  
  // Hide menu on trading pages
  const isTradingPage = location.pathname.startsWith('/crypto/');
  const shouldShowMenu = showMenu && !isTradingPage;

  const navItems = [
    { path: "/", icon: TrendingUp, label: "Hem" },
    { path: "/marknad", icon: TrendingUp, label: "Marknad" },
    { path: "/meme", icon: Zap, label: "Meme Zone" },
    { path: "/crypto/btc", icon: Wallet, label: "Handel" },
    { path: "/nyheter", icon: Newspaper, label: "Nyheter" }
  ];
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/50 z-40 md:hidden">
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
          {shouldShowMenu && (
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
                className="w-full bg-background/98 backdrop-blur-xl border-l border-border z-[60]"
              >
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

                <nav className="space-y-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-muted transition-colors font-crypto font-bold tracking-wider uppercase"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;