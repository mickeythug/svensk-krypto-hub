import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CryptoPriceTicker from "@/components/CryptoPriceTicker";
import SocialMediaSection from "@/components/SocialMediaSection";
import MarketOverview from "@/components/MarketOverview";
import MemeTokenSection from "@/components/MemeTokenSection";
import NewsSection from "@/components/NewsSection";
import CommunitySection from "@/components/CommunitySection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CryptoPriceTicker />
      <HeroSection />
      <SocialMediaSection />
      <div id="market" className="scroll-mt-20">
        <MarketOverview />
      </div>
      <MemeTokenSection />
      <div id="news" className="scroll-mt-20">
        <NewsSection />
      </div>
      <div id="community" className="scroll-mt-20">
        <CommunitySection />
      </div>
      <FooterSection />
    </div>
  );
};

export default Index;