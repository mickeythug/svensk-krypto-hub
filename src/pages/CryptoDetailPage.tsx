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
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaTokenInfo } from '@/hooks/useSolanaTokenInfo';

const CryptoDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { cryptoPrices, isLoading, error } = useCryptoData();
  const crypto = cryptoPrices?.find(c => c.symbol.toLowerCase() === symbol?.toLowerCase());
  const { connected: solConnected } = useWallet();
  const symUpper = (crypto?.symbol || symbol || '').toUpperCase();
  const coinGeckoId = (crypto?.coinGeckoId || (crypto as any)?.coin_gecko_id || (crypto as any)?.data?.id) as string | undefined;
  const { isSolToken } = useSolanaTokenInfo(symUpper, coinGeckoId);

  // Add SEO meta tags dynamically
  useEffect(() => {
    if (crypto) {
      document.title = `${crypto.name} (${crypto.symbol.toUpperCase()}) Pris | Crypto Network Sweden`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `Följ ${crypto.name} (${crypto.symbol.toUpperCase()}) prisutveckling i realtid. Aktuell kurs: ${crypto.price.toLocaleString('sv-SE')} SEK. Handla ${crypto.symbol.toUpperCase()} säkert på Crypto Network Sweden.`
        );
      }

      // Add canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://cryptonetworksweden.se/crypto/${symbol?.toLowerCase()}`);
      }
    }
  }, [crypto, symbol]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CryptoPriceTicker />
        <div className={`container mx-auto px-4 ${isMobile ? 'pt-4' : 'pt-20'}`}>
          <LoadingSpinner size="lg" text={`Laddar ${symbol?.toUpperCase() || 'kryptovaluta'} data...`} className="py-20" />
        </div>
      </div>
    );
  }

  if (error && !crypto) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CryptoPriceTicker />
        <div className={`container mx-auto px-4 ${isMobile ? 'pt-4' : 'pt-20'}`}>
          <Card className="p-8 text-center border-destructive/20">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="font-crypto text-2xl font-bold mb-4 text-destructive">
              Kunde inte ladda kryptodata
            </h2>
            <p className="text-muted-foreground mb-6">
              Ett fel inträffade när vi försökte hämta aktuell marknadsdata. 
              Kontrollera din internetanslutning och försök igen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Försök igen
              </Button>
              <Button variant="outline" onClick={() => navigate('/marknad')}>
                Gå till marknadsöversikt
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CryptoPriceTicker />
        <div className="container mx-auto px-4 pt-20">
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
      </div>
    );
  }

  // Mobile specific layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16"> {/* Add top padding to clear the fixed header */}
          <CryptoPriceTicker />
          <div className="px-0 pt-1">
            <Button variant="secondary" size="sm" onClick={() => navigate('/marknad')} className="rounded-full shadow-sm font-semibold gap-2 ml-2">
              <ArrowLeft className="h-4 w-4" />
              Till marknaden
            </Button>
          </div>
        </div>
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
    <div className="min-h-screen bg-background overflow-y-auto">
      <Header />
      <div className="pt-16"> {/* Add top padding to clear the fixed header */}
        <CryptoPriceTicker />
        <div className="px-0 pt-1">
          <Button variant="secondary" size="sm" onClick={() => navigate('/marknad')} className="rounded-full shadow-sm font-semibold gap-2 ml-2">
            <ArrowLeft className="h-4 w-4" />
            Till marknaden
          </Button>
        </div>
      </div>
      {solConnected && !isSolToken && (
        <div className="container mx-auto px-4 mt-3">
          <Card className="bg-card border border-amber-500/30 p-4 rounded-lg">
            <div className="text-sm">
              Denna token stöds inte av Solana‑kedjan. Du är ansluten med Solana‑wallet. Växla till EVM för att handla denna token.
            </div>
          </Card>
        </div>
      )}
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