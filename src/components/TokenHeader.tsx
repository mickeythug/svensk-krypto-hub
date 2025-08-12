import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

interface TokenHeaderProps {
  token: {
    image?: string;
    name: string;
    symbol: string;
    price: number;
    change24h: number;
  };
}

export const TokenHeader = ({ token }: TokenHeaderProps) => {
  const isPositive = token.change24h > 0;
  
  const formatPrice = (price: number): string => {
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="flex items-center gap-6 mb-6 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {token.image ? (
            <OptimizedImage 
              src={token.image} 
              alt={token.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {token.symbol.charAt(0)}
            </span>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {token.symbol}
          </h1>
          <p className="text-lg text-muted-foreground">
            {token.name}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="text-right">
          <div className="text-3xl font-bold text-foreground">
            {formatPrice(token.price)}
          </div>
          <Badge 
            variant={isPositive ? "default" : "destructive"} 
            className={`${isPositive ? 'bg-success text-success-foreground' : ''} font-semibold text-sm px-3 py-1`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};