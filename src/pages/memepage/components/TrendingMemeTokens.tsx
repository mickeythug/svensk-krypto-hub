import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Flame, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';

const TrendingMemeTokens = () => {
  const { tokens, loading, error } = useMemeTokens('trending', 8);

  const formatPrice = (price: number): string => {
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const getTrendColor = (change: number): string => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (change: number, index: number) => {
    if (index < 3) return <Flame className="h-4 w-4 text-destructive animate-pulse" />;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getRankBadge = (index: number) => {
    const badges = ['🥇', '🥈', '🥉'];
    if (index < 3) return badges[index];
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-destructive mb-4">⚠️ Kunde inte ladda trending tokens</div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tokens.map((token, index) => (
        <motion.div
          key={token.id}
          whileHover={{ scale: 1.03 }}
        >
          <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${
            index < 3 
              ? 'bg-gradient-to-br from-warning/20 to-destructive/20 border-warning/50' 
              : 'bg-gradient-to-br from-card to-card/50'
          }`}>
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 z-10">
              <Badge className={`font-bold ${
                index < 3 
                  ? 'bg-gradient-to-r from-warning to-destructive text-white' 
                  : 'bg-primary/20 text-primary'
              }`}>
                {getRankBadge(index)}
              </Badge>
            </div>

            {/* Hot Badge for top 3 */}
            {index < 3 && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-destructive animate-pulse">
                  🔥 HOT
                </Badge>
              </div>
            )}

            <CardContent className="p-4 pt-12">
              <div className="flex items-center gap-3 mb-3">
                <OptimizedImage
                  src={token.image}
                  alt={`${token.name} logo`}
                  className="h-12 w-12 rounded-full border-2 border-primary/20"
                  fallbackSrc="/placeholder.svg"
                  placeholder="🪙"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">
                    {token.emoji} {token.symbol}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{token.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pris</span>
                  <span className="font-bold font-numbers tabular-nums">{formatPrice(token.price)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h</span>
                  <div className={`flex items-center gap-1 ${getTrendColor(token.change24h)}`}>
                    {getTrendIcon(token.change24h, index)}
                     <span className="font-semibold font-numbers tabular-nums">
                       {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                     </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Volym 24h</span>
                   <span className="font-semibold font-numbers text-sm">
                     ${(token.volume24h / 1e6).toFixed(2)}M
                   </span>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <Zap className={`h-3 w-3 ${index < 3 ? 'text-warning animate-pulse' : 'text-primary'}`} />
                  <span className="text-muted-foreground">
                    {index < 3 ? 'SUPER HOT!' : 'Trending'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TrendingMemeTokens;