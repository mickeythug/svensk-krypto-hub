import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, PlusCircle } from 'lucide-react';

const MemePageHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/20 z-50 py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-end items-center gap-4">
          <Button 
            size="sm" 
            className="font-display bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 px-4 py-2"
            onClick={() => {/* TODO: Connect wallet functionality */}}
          >
            <Wallet className="w-4 h-4 mr-2" />
            🔗 Anslut Wallet
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="font-display border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-4 py-2"
            onClick={() => navigate('/meme/create')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            🚀 Skapa Din Coin
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MemePageHeader;