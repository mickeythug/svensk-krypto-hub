import HeroSection from "@/components/HeroSection";
import SocialMediaSection from "@/components/SocialMediaSection";
import MarketOverview from "@/components/MarketOverview";
import MemeTokenSection from "@/pages/memepage/components/MemeTokenSection";
import NewsSection from "@/components/NewsSection";
import CommunitySection from "@/components/CommunitySection";
import FooterSection from "@/components/FooterSection";
import LazySection from "@/components/LazySection";
import { useEffect } from "react";

const Index = () => {
  // SEO optimization
  useEffect(() => {
    document.title = 'Velo - Your Crypto Community | Bitcoin, Ethereum & DeFi';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Leading crypto community. Learn about cryptocurrencies, follow the market in real-time and meet new friends with the same passion for Web3. Join today!');
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://velo.se/');
    }
  }, []);

  return (
    <>
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
    </>
  );
};

export default Index;