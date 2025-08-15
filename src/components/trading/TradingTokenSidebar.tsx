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
const TOKENS_PER_PAGE = 15;
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
  const [currentPage, setCurrentPage] = useState(0);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  // Filter and search tokens
  const filteredTokens = useMemo(() => {
    if (!cryptoPrices) return [];
    let filtered = cryptoPrices;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = cryptoPrices.filter(token => token.symbol.toLowerCase().includes(query) || token.name.toLowerCase().includes(query));
    }
    return filtered;
  }, [cryptoPrices, searchQuery]);

  // Paginated tokens
  const paginatedTokens = useMemo(() => {
    const startIndex = currentPage * TOKENS_PER_PAGE;
    return filteredTokens.slice(startIndex, startIndex + TOKENS_PER_PAGE);
  }, [filteredTokens, currentPage]);
  const totalPages = Math.ceil(filteredTokens.length / TOKENS_PER_PAGE);
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
    return <motion.div className="w-14 bg-gray-900/95 border-r border-gray-800/50 backdrop-blur-sm flex flex-col" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.2
    }}>
        <div className="p-3 border-b border-gray-800/50">
          <Button variant="ghost" size="sm" onClick={onToggle} className="w-full h-8 text-gray-400 hover:text-white hover:bg-gray-800/50">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-2 p-2 pt-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-orange-400" />
          </div>
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
        </div>
      </motion.div>;
  }
  return <motion.div className="w-80 bg-gray-900/95 border-r border-gray-800/50 backdrop-blur-sm flex flex-col" initial={{
    opacity: 0,
    x: -50
  }} animate={{
    opacity: 1,
    x: 0
  }} transition={{
    duration: 0.3,
    ease: "easeOut"
  }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-white font-mono">Markets</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="text-gray-400 hover:text-white hover:bg-gray-800/50">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search tokens..." value={searchQuery} onChange={e => {
          setSearchQuery(e.target.value);
          setCurrentPage(0); // Reset to first page on search
        }} className="pl-10 h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:bg-gray-800/70 focus:border-primary/50" />
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
                  {paginatedTokens.map((token, index) => {
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
                        <Card className={`p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] group ${isActive ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50'}`} onClick={() => handleTokenSelect(token.symbol)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Token Logo */}
                              <div className="relative">
                                {token.image ? <img src={token.image} alt={`${token.name} logo`} className="h-10 w-10 rounded-full ring-1 ring-gray-700/50" /> : <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary">
                                      {token.symbol.slice(0, 2)}
                                    </span>
                                  </div>}
                                {token.rank && token.rank <= 10}
                              </div>

                              {/* Token Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm truncate">
                                    {token.symbol}
                                  </span>
                                  {isWatchlisted && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {token.name}
                                </div>
                              </div>
                            </div>

                            {/* Price & Change */}
                            <div className="text-right">
                              <div className="font-mono text-sm text-white font-medium">
                                ${formatPrice(token.price)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-xs font-medium flex items-center gap-1 ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                  {formatChange(token.change24h)}
                                </span>
                              </div>
                            </div>

                            {/* Watchlist Button */}
                            <Button variant="ghost" size="sm" onClick={e => toggleWatchlist(token.symbol, e)} className={`ml-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${isWatchlisted ? 'opacity-100' : ''}`}>
                              <Star className={`h-3 w-3 ${isWatchlisted ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
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

      {/* Pagination */}
      {totalPages > 1 && <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="h-8 w-8 p-0 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 disabled:opacity-30">
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({
              length: Math.min(totalPages, 5)
            }).map((_, i) => {
              const pageIndex = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              if (pageIndex >= totalPages) return null;
              return <Button key={pageIndex} variant={pageIndex === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(pageIndex)} className="h-8 w-8 p-0 text-xs bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50">
                      {pageIndex + 1}
                    </Button>;
            })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="h-8 w-8 p-0 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 disabled:opacity-30">
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>}
    </motion.div>;
};
export default TradingTokenSidebar;