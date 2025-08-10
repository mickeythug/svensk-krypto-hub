import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  DollarSign,
  BarChart3,
  Volume2,
  Coins,
  Calendar,
  Globe,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Menu,
  Search,
  Bell,
  Star
} from "lucide-react";
import TradingPanel from "@/components/TradingPanel";
import DesktopTradingInterface from "@/components/DesktopTradingInterface";
import MobileTradingPanel from "@/components/MobileTradingPanel";
import MobileChart from "@/components/MobileChart";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileTradingView from "@/components/mobile/MobileTradingView";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useWallet } from '@solana/wallet-adapter-react';

const CryptoDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { cryptoPrices, isLoading, error } = useCryptoData();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFullChart, setShowFullChart] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const { publicKey } = useWallet();

  const crypto = cryptoPrices?.find(c => 
    c.symbol.toLowerCase() === symbol?.toLowerCase()
  );

  const shouldShowMobileView = isMobile;

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(handleRefresh, 30000); // Refresh every 30 seconds
    return () => clearInterval(refreshInterval);
  }, [handleRefresh]);

  // SEO and Meta Tags
  useEffect(() => {
    if (crypto) {
      document.title = `${crypto.name} (${crypto.symbol.toUpperCase()}) Pris - Live Trading | Crypto Network Sweden`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `Live ${crypto.name} (${crypto.symbol.toUpperCase()}) pris: $${crypto.price.toFixed(6)}. Trading, charts och analys för ${crypto.name}. ${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}% senaste 24h.`
        );
      }
    }
  }, [crypto]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <LoadingSpinner size="lg" text={`Laddar ${symbol?.toUpperCase() || 'kryptovaluta'} data...`} className="py-20" />
      </div>
    );
  }

  if (error && !crypto) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <Card className="p-8 text-center border-destructive/20">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="font-crypto text-2xl font-bold mb-4 text-destructive">Fel vid laddning</h1>
          <p className="text-muted-foreground mb-6">
            Det gick inte att ladda kryptodata. Kontrollera din internetanslutning och försök igen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Försök igen
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Tillbaka till startsidan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <Card className="p-8 text-center">
          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-crypto text-2xl font-bold mb-4">Token ej hittad</h1>
          <p className="text-muted-foreground mb-6">
            Kryptovalutan "{symbol?.toUpperCase()}" finns inte tillgänglig eller har tagits bort från vårt system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/marknad')} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Sök andra tokens
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Tillbaka till startsidan
            </Button>
          </div>
          
          {/* Suggested alternatives */}
          <div className="mt-8 text-left">
            <h3 className="font-semibold mb-4">Populära alternativ:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['BTC', 'ETH', 'BNB', 'SOL'].map((altSymbol) => (
                <Button
                  key={altSymbol}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/crypto/${altSymbol.toLowerCase()}`)}
                  className="text-xs"
                >
                  {altSymbol}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (shouldShowMobileView) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <MobileTradingView 
          symbol={symbol!.toUpperCase()} 
          currentPrice={crypto.price}
          priceChange24h={crypto.change24h}
          tokenName={crypto.name}
          crypto={crypto}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="container mx-auto px-4 pt-4">
      <DesktopTradingInterface 
        symbol={symbol!.toUpperCase()} 
        currentPrice={crypto.price}
        priceChange24h={crypto.change24h}
        tokenName={crypto.name}
        crypto={crypto}
      />
    </div>
  );
};

export default CryptoDetailPage;