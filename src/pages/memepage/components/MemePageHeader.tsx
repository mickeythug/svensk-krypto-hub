import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, PlusCircle, ArrowLeft } from 'lucide-react';

const MemePageHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/20 z-50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center gap-6">
          <Button 
            size="lg" 
            variant="ghost"
            className="font-crypto text-base font-bold tracking-wider text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 px-6 py-3 h-12 uppercase"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            TILLBAKA
          </Button>
          <div className="flex items-center gap-6">
          <Button 
            size="lg" 
            className="font-crypto text-base font-bold tracking-wider bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 px-8 py-3 h-12 text-primary-foreground border-0 uppercase"
            onClick={() => {/* TODO: Connect wallet functionality */}}
          >
            <Wallet className="w-5 h-5 mr-3" />
            ANSLUT WALLET
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="font-crypto text-base font-bold tracking-wider border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-8 py-3 h-12 uppercase hover:shadow-glow-primary"
            onClick={() => navigate('/meme/create')}
          >
            <PlusCircle className="w-5 h-5 mr-3" />
            SKAPA DIN COIN
          </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MemePageHeader;