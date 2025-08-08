import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemeTokens } from '../hooks/useMemeTokens';
import OptimizedImage from '@/components/OptimizedImage';

interface MemeTokenGridProps {
  category: 'trending' | 'under1m' | 'all';
  limit?: number;
}

const MemeTokenGrid: React.FC<MemeTokenGridProps> = ({ category, limit }) => {
  const { tokens, loading, error } = useMemeTokens(category, limit);

  const formatPrice = (price: number): string => {
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  const getTrendColor = (change: number): string => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(limit || 12)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-3/4" />
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
        <div className="text-destructive mb-4">⚠️ Fel vid laddning av tokens</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Försök igen
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tokens.map((token, index) => (
        <motion.div
          key={token.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="group"
        >
          <Card className="h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50">
            <CardContent className="p-6">
              {/* Token Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <OptimizedImage
                    src={token.image}
                    alt={`${token.name} logo`}
                    className="h-12 w-12 rounded-full border-2 border-primary/20"
                    fallbackSrc="/placeholder.svg"
                    placeholder="🪙"
                  />
                  {token.isHot && (
                    <Badge className="absolute -top-1 -right-1 text-xs bg-destructive animate-pulse">
                      🔥
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                    {token.emoji} {token.symbol}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{token.name}</p>
                </div>
              </div>

              {/* Price & Change */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pris</span>
                  <span className="font-bold">{formatPrice(token.price)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h</span>
                  <div className={`flex items-center gap-1 ${getTrendColor(token.change24h)}`}>
                    {getTrendIcon(token.change24h)}
                    <span className="font-semibold">
                      {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                  <span className="font-semibold text-sm">{formatMarketCap(token.marketCap)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{token.holders.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{token.views}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {token.tags.slice(0, 2).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Button */}
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-bold"
                size="sm"
              >
                <Eye className="mr-2 h-4 w-4" />
                Visa Detaljer
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default MemeTokenGrid;