import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Star, Zap, Activity } from "lucide-react";
import { useCryptoData } from '@/hooks/useCryptoData';
import { motion, AnimatePresence } from 'framer-motion';
interface TradingTokenSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
const TradingTokenSidebar: React.FC<TradingTokenSidebarProps> = ({
  collapsed,
  onToggle
}) => {
  const navigate = useNavigate();
  const {
    symbol: currentSymbol
  } = useParams();
  const {
    cryptoPrices,
    isLoading
  } = useCryptoData();
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  // Filter and search tokens - now showing ALL tokens
  const filteredTokens = useMemo(() => {
    if (!cryptoPrices) return [];
    let filtered = cryptoPrices;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = cryptoPrices.filter(token => token.symbol.toLowerCase().includes(query) || token.name.toLowerCase().includes(query));
    }
    return filtered;
  }, [cryptoPrices, searchQuery]);
  const handleTokenSelect = useCallback((symbol: string) => {
    navigate(`/crypto/${symbol.toLowerCase()}`);
  }, [navigate]);
  const toggleWatchlist = useCallback((symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  }, []);
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };
  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };
  if (collapsed) {
    return <motion.div 
      className="w-14 bg-gradient-to-b from-card to-muted border-r border-primary/20 backdrop-blur-xl flex flex-col shadow-glow-primary/10" 
      initial={{ opacity: 0, x: -50 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
        <div className="p-3 border-b border-primary/20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle} 
            className="w-full h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-3 p-2 pt-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-warning/30 to-warning/10 flex items-center justify-center border border-warning/20 shadow-lg shadow-warning/10">
            <Zap className="h-4 w-4 text-warning" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-success/30 to-success/10 flex items-center justify-center border border-success/20 shadow-lg shadow-success/10">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
        </div>
      </motion.div>;
  }
  return <motion.div 
    className="w-80 bg-gradient-to-b from-card/95 to-muted/95 border-r border-primary/20 backdrop-blur-xl flex flex-col shadow-2xl shadow-primary/5" 
    initial={{ opacity: 0, x: -50 }} 
    animate={{ opacity: 1, x: 0 }} 
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
      {/* Header */}
      <div className="p-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-ping opacity-30"></div>
            </div>
            <h2 className="text-xl font-bold text-foreground font-orbitron tracking-wide bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              MARKETS
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle} 
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          <Input 
            placeholder="Search tokens..." 
            value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus:bg-muted/70 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 rounded-xl transition-all duration-300" 
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>

      {/* Token List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2">
            <AnimatePresence mode="wait">
              {isLoading ? <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} className="space-y-2">
                  {Array.from({
                length: 8
              }).map((_, i) => <div key={i} className="h-16 bg-gray-800/30 rounded-lg animate-pulse" />)}
                </motion.div> : <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -20
            }} transition={{
              duration: 0.2
            }} className="space-y-1">
                  {filteredTokens.map((token, index) => {
                const isActive = currentSymbol?.toLowerCase() === token.symbol.toLowerCase();
                const isWatchlisted = watchlist.has(token.symbol);
                return <motion.div key={token.symbol} initial={{
                  opacity: 0,
                  x: -20
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  delay: index * 0.02
                }}>
                        <Card className={`p-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group rounded-xl border ${isActive ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/40 shadow-xl shadow-primary/20' : 'bg-gradient-to-r from-muted/30 to-muted/10 border-muted-foreground/20 hover:from-muted/50 hover:to-muted/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'}`} onClick={() => handleTokenSelect(token.symbol)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Token Logo */}
                              <div className="relative">
                                {token.image ? (
                                  <div className="relative">
                                    <img 
                                      src={token.image} 
                                      alt={`${token.name} logo`} 
                                      className="h-10 w-10 rounded-xl ring-2 ring-primary/20 shadow-lg" 
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-transparent to-primary/10"></div>
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
                                    <span className="text-xs font-bold text-white">
                                      {token.symbol.slice(0, 2)}
                                    </span>
                                  </div>
                                )}
                                {token.rank && token.rank <= 10 && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-warning to-warning/70 rounded-full flex items-center justify-center border border-warning/50 shadow-lg shadow-warning/30">
                                    <Star className="h-2 w-2 text-white fill-current" />
                                  </div>
                                )}
                              </div>

                              {/* Token Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground text-sm truncate font-mono tracking-wide">
                                    {token.symbol}
                                  </span>
                                  {isWatchlisted && (
                                    <Star className="h-3 w-3 text-warning fill-current drop-shadow-sm shadow-warning/50" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate font-inter">
                                  {token.name}
                                </div>
                              </div>
                            </div>

                            {/* Price & Change */}
                            <div className="text-right">
                              <div className="font-mono text-sm text-foreground font-semibold tracking-tight">
                                ${formatPrice(token.price)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-sm font-medium font-inter flex items-center gap-1 ${token.change24h >= 0 ? 'text-success drop-shadow-sm shadow-success/30' : 'text-destructive drop-shadow-sm shadow-destructive/30'}`}>
                                  {token.change24h >= 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {formatChange(token.change24h)}
                                </span>
                              </div>
                            </div>

                            {/* Watchlist Button */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={e => toggleWatchlist(token.symbol, e)} 
                              className={`ml-2 h-8 w-8 p-0 rounded-lg transition-all duration-300 ${isWatchlisted ? 'opacity-100 bg-warning/10 hover:bg-warning/20' : 'opacity-0 group-hover:opacity-100 hover:bg-muted/30'}`}
                            >
                              <Star className={`h-3 w-3 transition-all duration-300 ${isWatchlisted ? 'fill-warning text-warning drop-shadow-sm shadow-warning/50' : 'text-muted-foreground hover:text-warning'}`} />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>;
              })}
                </motion.div>}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Token Count Footer */}
      <div className="p-4 border-t border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="text-xs text-muted-foreground font-mono text-center">
          {filteredTokens.length} tokens {searchQuery && `(filtered from ${cryptoPrices?.length || 0})`}
        </div>
      </div>
    </motion.div>;
};
export default TradingTokenSidebar;