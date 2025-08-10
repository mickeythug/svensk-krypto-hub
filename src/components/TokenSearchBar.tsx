import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCryptoData } from "@/hooks/useCryptoData";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TokenSearchBarProps {
  currentSymbol?: string;
  placeholder?: string;
  className?: string;
}

const TokenSearchBar: React.FC<TokenSearchBarProps> = ({ 
  currentSymbol, 
  placeholder = "Sök token", 
  className 
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const { cryptoPrices } = useCryptoData();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!cryptoPrices || query.length < 1) {
      console.log('No crypto prices or query too short:', { cryptoPrices: !!cryptoPrices, queryLength: query.length });
      return [];
    }
    
    const searchTerm = query.toLowerCase().replace(/usdt$/i, '');
    
    const filtered = cryptoPrices
      .filter(crypto => 
        crypto.symbol.toLowerCase().includes(searchTerm) ||
        crypto.name.toLowerCase().includes(searchTerm)
      )
      .filter(crypto => crypto.symbol.toLowerCase() !== currentSymbol?.toLowerCase())
      .slice(0, 8); // Limit to 8 results
    
    console.log('Filtered tokens:', filtered.length, 'from query:', searchTerm);
    return filtered;
  }, [cryptoPrices, query, currentSymbol]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if the click is inside the search ref or any dropdown item
      if (searchRef.current && !searchRef.current.contains(target)) {
        // Also check if clicking on a dropdown item (which is rendered in portal)
        const isDropdownClick = target.closest('[data-dropdown-item]');
        if (!isDropdownClick) {
          setIsOpen(false);
        }
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleTokenSelect = (symbol: string) => {
    console.log('Token selected:', symbol); // Debug log
    console.log('Current URL:', window.location.href); // Debug log  
    navigate(`/crypto/${symbol.toLowerCase()}`);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search query changed:', value); // Debug log
    setQuery(value);
    if (value.length > 0) {
      updateDropdownPosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      updateDropdownPosition();
      setIsOpen(true);
    }
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

  // Portal dropdown component
  const DropdownPortal = () => {
    if (!isOpen || filteredTokens.length === 0) return null;

    return createPortal(
      <div 
        className="fixed bg-gradient-to-b from-card to-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25),0_0_60px_-15px_hsl(var(--primary)/0.3)] ring-1 ring-primary/10"
        style={{ 
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 999999
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
          <Zap className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-display font-semibold text-primary">Sökresultat</span>
          <div className="ml-auto text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
            {filteredTokens.length} resultat
          </div>
        </div>
        
        <ScrollArea className="max-h-[320px] scrollbar-modern">
          <div className="p-1">
            {filteredTokens.map((token, index) => {
              const isPositive = token.change24h >= 0;
              return (
                <div
                  key={token.symbol}
                  data-dropdown-item
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTokenSelect(token.symbol);
                  }}
                  className={cn(
                    "group flex items-center justify-between p-4 mx-1 my-1 cursor-pointer rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border",
                    "bg-gradient-to-r from-background/80 to-background/60 hover:from-primary/5 hover:to-primary/10",
                    "border-transparent hover:border-primary/20 hover:bg-primary/5",
                    "backdrop-blur-sm"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {token.image ? (
                      <div className="relative">
                        <img 
                          src={token.image} 
                          alt={token.name}
                          className="w-10 h-10 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200 ring-1 ring-border/50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                        <span className="text-sm font-display font-bold text-primary">
                          {token.symbol.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {token.symbol.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          /USDT
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {token.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-display font-bold text-lg text-foreground">
                      {formatPrice(token.price)}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors",
                      isPositive 
                        ? "text-success bg-success/10 border border-success/20" 
                        : "text-destructive bg-destructive/10 border border-destructive/20"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{isPositive ? '+' : ''}{token.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>,
      document.body
    );
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 transition-colors duration-200">
          <Search className={cn(
            "h-5 w-5 transition-colors duration-200",
            isOpen || query ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
          )} />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className={cn(
            "pl-12 pr-4 py-3 text-base font-medium rounded-2xl transition-all duration-300",
            "bg-gradient-to-r from-background/90 to-background/70 backdrop-blur-xl",
            "border-2 border-border/30 hover:border-primary/30 focus:border-primary/50",
            "shadow-lg hover:shadow-xl focus:shadow-2xl",
            "ring-0 focus:ring-4 focus:ring-primary/10",
            "placeholder:text-muted-foreground placeholder:font-medium",
            isOpen && "border-primary/50 shadow-2xl ring-4 ring-primary/10"
          )}
        />
        <div className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300",
          (isOpen || query) && "opacity-100"
        )} />
      </div>
      <DropdownPortal />
    </div>
  );
};

export default TokenSearchBar;