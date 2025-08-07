import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TokenSearchBarProps {
  currentSymbol?: string;
  placeholder?: string;
  className?: string;
}

const TokenSearchBar: React.FC<TokenSearchBarProps> = ({ 
  currentSymbol, 
  placeholder = "Sök token (t.ex. SOLUSDT)", 
  className 
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { cryptoPrices } = useCryptoData();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!cryptoPrices || query.length < 1) return [];
    
    const searchTerm = query.toLowerCase().replace(/usdt$/i, '');
    
    return cryptoPrices
      .filter(crypto => 
        crypto.symbol.toLowerCase().includes(searchTerm) ||
        crypto.name.toLowerCase().includes(searchTerm)
      )
      .filter(crypto => crypto.symbol.toLowerCase() !== currentSymbol?.toLowerCase())
      .slice(0, 8); // Limit to 8 results
  }, [cryptoPrices, query, currentSymbol]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTokenSelect = (symbol: string) => {
    navigate(`/crypto/${symbol.toLowerCase()}`);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredTokens.length > 0) {
      handleTokenSelect(filteredTokens[0].symbol);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 bg-secondary/50 border-border/50 hover:bg-secondary/70 focus:bg-background transition-colors"
        />
      </div>

      {isOpen && filteredTokens.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {filteredTokens.map((token) => {
            const isPositive = token.change24h >= 0;
            return (
              <div
                key={token.symbol}
                onClick={() => handleTokenSelect(token.symbol)}
                className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b border-border/30 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  {token.image && (
                    <img 
                      src={token.image} 
                      alt={token.name}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{token.symbol.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground">/USDT</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-sm">{formatPrice(token.price)}</span>
                  <div className={cn(
                    "flex items-center space-x-1 text-xs",
                    isPositive ? "text-success" : "text-destructive"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{isPositive ? '+' : ''}{token.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TokenSearchBar;