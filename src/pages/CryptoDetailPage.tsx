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
import Header from "@/components/Header";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import { useCryptoData } from "@/hooks/useCryptoData";

const CryptoDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { cryptoPrices, isLoading } = useCryptoData();
  const crypto = cryptoPrices?.find(c => c.symbol.toLowerCase() === symbol?.toLowerCase());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoPriceTicker />
        {!isMobile && <Header />}
        <div className="container mx-auto px-4 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Token ej hittad</h1>
            <p className="text-muted-foreground mb-4">
              Denna kryptovaluta finns inte tillgänglig.
            </p>
            <Button onClick={() => navigate('/marknad')}>
              Tillbaka till Marknadsöversikt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <CryptoPriceTicker />
        <MobileHeader 
          title={`${crypto.symbol.toUpperCase()}/USDT`}
          showNotifications={true}
        />
        <MobileTradingView
          symbol={crypto.symbol.toUpperCase()}
          currentPrice={crypto.price}
          priceChange24h={crypto.change24h}
          tokenName={crypto.name}
          crypto={crypto}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CryptoPriceTicker />
      <Header />
      <DesktopTradingInterface
        symbol={crypto.symbol.toUpperCase()}
        currentPrice={crypto.price}
        priceChange24h={crypto.change24h}
        tokenName={crypto.name}
        crypto={crypto}
      />
    </div>
  );

};

export default CryptoDetailPage;