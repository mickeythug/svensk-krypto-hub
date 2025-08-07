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
      <HeroSection />
      <CryptoPriceTicker />
      <SocialMediaSection />
      <MarketOverview />
      <MemeTokenSection />
      <NewsSection />
      <CommunitySection />
      <FooterSection />
    </div>
  );
};

export default Index;