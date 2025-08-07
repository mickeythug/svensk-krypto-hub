import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import SocialMediaSection from "@/components/SocialMediaSection";
import MarketOverview from "@/components/MarketOverview";
import MemeTokenSection from "@/components/MemeTokenSection";
import NewsSection from "@/components/NewsSection";
import CommunitySection from "@/components/CommunitySection";
import FooterSection from "@/components/FooterSection";
import LazySection from "@/components/LazySection";
import { useEffect } from "react";

const Index = () => {
  // SEO optimization
  useEffect(() => {
    document.title = "Crypto Network Sweden - Din Krypto Community | Bitcoin, Ethereum & DeFi";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Sveriges ledande krypto community. Lär dig om kryptovalutor, följ marknaden i realtid och träff nya vänner med samma passion för Web3. Gå med idag!'
      );
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://cryptonetworksweden.se/');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CryptoPriceTicker />
      <HeroSection />
      
      <LazySection>
        <SocialMediaSection />
      </LazySection>
      
      <div id="market" className="scroll-mt-20">
        <LazySection>
          <MarketOverview />
        </LazySection>
      </div>
      
      <LazySection>
        <MemeTokenSection />
      </LazySection>
      
      <div id="news" className="scroll-mt-20">
        <LazySection>
          <NewsSection />
        </LazySection>
      </div>
      
      <div id="community" className="scroll-mt-20">
        <LazySection>
          <CommunitySection />
        </LazySection>
      </div>
      
      <LazySection>
        <FooterSection />
      </LazySection>
    </div>
  );
};

export default Index;