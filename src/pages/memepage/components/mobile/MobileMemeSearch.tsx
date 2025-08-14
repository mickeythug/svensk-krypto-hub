import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import OptimizedImage from '@/components/OptimizedImage';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  Star,
  Filter,
  Zap
} from 'lucide-react';

interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  isHot: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMemeSearch: React.FC<Props> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'DOGE', 'SHIB', 'PEPE', 'BONK', 'WIF'
  ]);
  const [isSearching, setIsSearching] = useState(false);

  const trendingTokens = [
    { symbol: 'BONK', name: 'Bonk', change: '+284%' },
    { symbol: 'WIF', name: 'dogwifhat', change: '+156%' },
    { symbol: 'PEPE', name: 'Pepe', change: '+89%' },
    { symbol: 'POPCAT', name: 'Popcat', change: '+67%' },
    { symbol: 'MEW', name: 'cat in a dogs world', change: '+45%' }
  ];

  useEffect(() => {
    if (query.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        // Mock search results
        setResults([
          {
            id: '1',
            symbol: 'DOGE',
            name: 'Dogecoin',
            image: '/crypto-logos/doge.png',
            price: 0.08234,
            change24h: 12.4,
            isHot: true
          },
          {
            id: '2',
            symbol: 'SHIB',
            name: 'Shiba Inu',
            image: '/crypto-logos/shib.png',
            price: 0.000012,
            change24h: -5.2,
            isHot: false
          }
        ]);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-16 border-b border-white/10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tokens..."
            className="pl-10 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-full focus:bg-white/15 transition-all duration-300"
            autoFocus
          />
          {query && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white/80 hover:text-white font-semibold"
        >
          Avbryt
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {query.length === 0 ? (
          <div className="space-y-6">
            {/* Recent Searches */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-white/60" />
                <h3 className="text-white font-semibold">Recent searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer transition-all duration-300"
                    onClick={() => setQuery(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-white font-semibold">Trending nu</h3>
              </div>
              <div className="space-y-3">
                {trendingTokens.map((token, index) => (
                  <Card
                    key={index}
                    className="bg-white/5 border-white/10 p-3 cursor-pointer hover:bg-white/10 transition-all duration-300"
                    onClick={() => setQuery(token.symbol)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{token.symbol}</span>
                          {index < 3 && (
                            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1">
                              <Zap className="w-3 h-3 mr-1" />
                              HOT
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">{token.name}</p>
                      </div>
                      <div className="text-green-400 font-bold">{token.change}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-white font-semibold mb-4">Search results for "{query}"</h3>
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="bg-white/5 border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                        <OptimizedImage
                          src={result.image}
                          alt={result.name}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder.svg"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{result.symbol}</span>
                          {result.isHot && (
                            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1">
                              HOT
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">{result.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${result.price.toFixed(6)}</div>
                        <div className={`text-sm font-semibold ${
                          result.change24h > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.change24h > 0 ? '+' : ''}{result.change24h.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">Inga resultat för "{query}"</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default MobileMemeSearch;