import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';

import btc from '@/assets/crypto-logos/btc.png';
import eth from '@/assets/crypto-logos/eth.png';
import doge from '@/assets/meme-tokens/doge.png';
import shib from '@/assets/crypto-logos/shib.png';
import link from '@/assets/crypto-logos/link.png';
import bnb from '@/assets/crypto-logos/bnb.png';
import sol from '@/assets/crypto-logos/sol.png';
import ada from '@/assets/crypto-logos/ada.png';

const logoMap: Record<string, string> = {
  btc, eth, doge, shib, link, bnb, sol, ada,
};

const TokenChip = ({ symbol, name, price, change24h }: any) => {
  const positive = change24h > 0;
  const logo = logoMap[(symbol || '').toLowerCase()];
  
  return (
    <div className="group flex items-center gap-4 px-6 py-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-sm hover:shadow-glow-rainbow transition-all duration-300 min-w-[280px]">
      {logo ? (
        <div className="relative">
          <OptimizedImage 
            src={logo} 
            alt={`${name} logo`} 
            className="h-12 w-12 rounded-full object-contain animate-float" 
            fallbackSrc="/placeholder.svg" 
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
        </div>
      ) : (
        <div className="h-12 w-12 rounded-full bg-gradient-primary animate-pulse-glow"></div>
      )}
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="font-black text-lg text-foreground">{symbol}</span>
          <Badge 
            variant="outline" 
            className={`${positive ? 'border-success text-success bg-success/10' : 'border-destructive text-destructive bg-destructive/10'} font-bold`}
          >
            {positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {positive ? '+' : ''}{change24h.toFixed(2)}%
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground truncate max-w-[120px]">{name}</span>
          <span className="tabular-nums font-bold text-accent">${price.toFixed(price < 1 ? 6 : 2)}</span>
        </div>
      </div>
    </div>
  );
};

const MemeLiveTicker = () => {
  const { tokens, loading, error } = useMemeTokens('trending', 15);
  const list = useMemo(() => (loading ? Array.from({ length: 15 }).map((_, i) => ({ 
    id: i, symbol: '...', name: 'Laddar', price: 0, change24h: 0 
  })) : tokens), [loading, tokens]);

  if (error) return null;

  return (
    <section className="w-full">
      <Card className="overflow-hidden border-0 border-t-2 border-b-2 border-primary/30 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm shadow-glow-primary rounded-none">
        <div className="relative">
          {/* Rainbow gradient overlay */}
          <div className="absolute inset-0 bg-gradient-rainbow opacity-10 pointer-events-none"></div>
          
          {/* Scrolling content */}
          <div className="flex whitespace-nowrap animate-ticker will-change-transform">
            <div className="flex gap-6 px-6 py-6">
              {list.map((t: any, i: number) => (
                <TokenChip key={`a-${t.id ?? i}`} {...t} />
              ))}
            </div>
            <div className="flex gap-6 px-6 py-6" aria-hidden="true">
              {list.map((t: any, i: number) => (
                <TokenChip key={`b-${t.id ?? i}`} {...t} />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default MemeLiveTicker;