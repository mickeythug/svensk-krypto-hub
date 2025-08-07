import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  TrendingUp, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Newspaper 
} from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Marknadsöversikt", href: "#market", icon: TrendingUp },
    { name: "Community", href: "#community", icon: Users },
    { name: "Utbildning", href: "#education", icon: BookOpen },
    { name: "Nyheter", href: "#news", icon: Newspaper },
    { name: "Kontakt", href: "#contact", icon: MessageCircle },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
              alt="Crypto Network Sweden"
              className="h-10 w-auto drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]"
            />
            <div className="hidden md:block">
              <h1 className="font-crypto text-lg font-bold">
                <span style={{ color: '#12E19F' }}>CRY</span>
                <span className="text-white">PTO</span>
                <span className="text-white"> </span>
                <span className="text-white">NET</span>
                <span style={{ color: '#12E19F' }}>WORK</span>
              </h1>
              <p className="font-crypto text-xs text-muted-foreground">
                SWEDEN
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors font-display font-medium"
                >
                  <IconComponent size={16} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Logga in
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
            >
              Gå med
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/98 backdrop-blur-xl border-l border-border z-[60]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
                    alt="Crypto Network Sweden"
                    className="h-8 w-auto"
                  />
                  <div>
                    <h1 className="font-crypto text-sm font-bold">
                      <span style={{ color: '#12E19F' }}>CRY</span>
                      <span className="text-white">PTO</span>
                      <span className="text-white"> </span>
                      <span className="text-white">NET</span>
                      <span style={{ color: '#12E19F' }}>WORK</span>
                    </h1>
                    <p className="font-crypto text-xs text-muted-foreground">
                      SWEDEN
                    </p>
                  </div>
                </div>
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
                      onClick={() => scrollToSection(item.href)}
                      className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-muted transition-colors font-display"
                    >
                      <IconComponent size={20} className="text-primary" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Logga in
                </Button>
                <Button 
                  className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
                >
                  Gå med i Communityn
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;