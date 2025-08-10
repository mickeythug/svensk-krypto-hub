import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import MobileBottomNavigation from "@/components/mobile/MobileBottomNavigation";
import MobileHeader from "@/components/mobile/MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const NotFound = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    document.title = "404 - Sidan hittades inte | Crypto Network Sweden";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileHeader title="404" /> : <Header />}
      
      <main className={`flex items-center justify-center ${isMobile ? 'min-h-[calc(100vh-8rem)] px-4 pt-8' : 'min-h-[calc(100vh-12rem)] pt-20'}`}>
        <Card className={`${isMobile ? 'p-6 w-full max-w-sm' : 'p-12 max-w-lg'} text-center`}>
          <div className="flex justify-center mb-6">
            <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} rounded-full bg-destructive/10 flex items-center justify-center`}>
              <AlertTriangle className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-destructive`} />
            </div>
          </div>
          
          <h1 className={`font-crypto ${isMobile ? 'text-4xl' : 'text-6xl'} font-bold mb-4 text-primary`}>
            404
          </h1>
          
          <h2 className={`font-display ${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>
            Sidan hittades inte
          </h2>
          
          <p className={`text-muted-foreground ${isMobile ? 'text-sm mb-6' : 'mb-8'} leading-relaxed`}>
            Tyvärr kunde vi inte hitta sidan du letade efter. Den kan ha flyttats eller så skrev du fel adress.
          </p>
          
          <Button 
            asChild 
            className={`w-full ${isMobile ? '' : 'max-w-xs'} bg-primary hover:bg-primary/90`}
          >
            <a href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Tillbaka till startsidan
            </a>
          </Button>
        </Card>
      </main>
      
      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};

export default NotFound;
