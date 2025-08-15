import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Share2, Bookmark, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/OptimizedImage';

interface ProfessionalTokenHeaderProps {
  token: {
    symbol: string;
    name: string;
    image?: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
  };
}

export const ProfessionalTokenHeader: React.FC<ProfessionalTokenHeaderProps> = ({ token }) => {
  const formatPrice = (price: number): string => {
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const isPositive = token.change24h > 0;

  return (
    <Card className="border-0 bg-gradient-subtle backdrop-blur-sm">
      <div className="p-8 bg-gray-900/95 rounded-lg">
        <div className="flex items-start justify-between">
          {/* Token Info Section */}
          <div className="flex items-center gap-6">
            {/* Token Logo */}
            <motion.div 
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-gray-700 p-3 shadow-xl">
                {token.image ? (
                  <OptimizedImage
                    src={token.image}
                    alt={token.name}
                    className="w-full h-full object-cover rounded-xl"
                    fallbackSrc="/placeholder.svg"
                    placeholder={token.symbol.slice(0, 2)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-300">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Token Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {token.name}
                </h1>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                  {token.symbol}
                </Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Current Price</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatPrice(token.price)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">24h Change</p>
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span
                      className={`text-lg font-bold font-mono ${
                        isPositive ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
            >
              <Star className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Market Stats Row */}
        <div className="mt-8 grid grid-cols-4 gap-8">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Market Cap</p>
            <p className="text-xl font-bold text-foreground font-mono">
              {formatLargeNumber(token.marketCap)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">24h Volume</p>
            <p className="text-xl font-bold text-foreground font-mono">
              {formatLargeNumber(token.volume24h)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">All-Time High</p>
            <p className="text-xl font-bold text-foreground font-mono">
              {formatPrice(token.price * 1.85)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">All-Time Low</p>
            <p className="text-xl font-bold text-foreground font-mono">
              {formatPrice(token.price * 0.12)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};