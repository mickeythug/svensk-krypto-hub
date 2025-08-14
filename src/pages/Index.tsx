import HeroSection from "@/components/HeroSection";
import SocialMediaSection from "@/components/SocialMediaSection";
import MarketOverview from "@/components/MarketOverview";
import MemeTokenSection from "@/pages/memepage/components/MemeTokenSection";
import NewsSection from "@/components/NewsSection";
import CommunitySection from "@/components/CommunitySection";
import FooterSection from "@/components/FooterSection";
import LazySection from "@/components/LazySection";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  // SEO optimization
  useEffect(() => {
    document.title = t('site.title');
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('site.description'));
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://cryptonetworksweden.se/');
    }
  }, [t]);

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