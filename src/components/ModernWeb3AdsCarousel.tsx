import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/OptimizedImage';
import { 
  Zap, 
  Rocket, 
  TrendingUp, 
  Star, 
  Crown, 
  Sparkles,
  ExternalLink,
  ArrowRight,
  Gift,
  Shield,
  Coins
} from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  icon: any;
  gradient: string;
  bgImage?: string;
  badge?: string;
  badgeColor?: string;
  link?: string;
}

const WEB3_ADS: Ad[] = [
  {
    id: 'defi-staking',
    title: 'STAKE & EARN',
    subtitle: 'DeFi Staking Pool',
    description: 'Få upp till 15% APY på dina crypto holdings',
    cta: 'Börja Staka',
    icon: Coins,
    gradient: 'from-purple-600 via-blue-600 to-cyan-500',
    badge: 'HOT',
    badgeColor: 'bg-red-500',
    link: '#'
  },
  {
    id: 'nft-marketplace',
    title: 'NFT DROPS',
    subtitle: 'Exklusiva Collections',
    description: 'Upptäck nästa stora NFT projekt före alla andra',
    cta: 'Utforska Nu',
    icon: Crown,
    gradient: 'from-pink-600 via-purple-600 to-indigo-600',
    badge: 'LIVE',
    badgeColor: 'bg-green-500',
    link: '#'
  },
  {
    id: 'trading-bot',
    title: 'AI TRADING',
    subtitle: 'Smart Bot Trading',
    description: 'Låt AI:n handla åt dig med 87% framgångsfrekvens',
    cta: 'Testa Gratis',
    icon: Rocket,
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    badge: 'NEW',
    badgeColor: 'bg-blue-500',
    link: '#'
  },
  {
    id: 'yield-farming',
    title: 'YIELD FARMING',
    subtitle: 'Liquidity Mining',
    description: 'Earning rewards på dina LP tokens dagligen',
    cta: 'Börja Farma',
    icon: TrendingUp,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    badge: 'TRENDING',
    badgeColor: 'bg-yellow-500',
    link: '#'
  },
  {
    id: 'security-audit',
    title: 'SMART CONTRACTS',
    subtitle: 'Security Audit',
    description: 'Få dina kontrakt auditerade av experter',
    cta: 'Boka Audit',
    icon: Shield,
    gradient: 'from-slate-600 via-gray-600 to-zinc-600',
    badge: 'VERIFIED',
    badgeColor: 'bg-emerald-500',
    link: '#'
  }
];

const ModernWeb3AdsCarousel = () => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-advance ads every 4 seconds (unless hovered)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentAdIndex((prev) => (prev + 1) % WEB3_ADS.length);
        setIsAnimating(false);
      }, 200);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const currentAd = WEB3_ADS[currentAdIndex];
  const IconComponent = currentAd.icon;

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress indicators */}
      <div className="flex gap-1 mb-3 justify-center">
        {WEB3_ADS.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentAdIndex 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      <Card 
        className={`
          relative overflow-hidden border-none shadow-2xl backdrop-blur-sm
          bg-gradient-to-br ${currentAd.gradient}
          transform transition-all duration-500 ease-out
          hover:scale-[1.02] hover:-translate-y-2
          ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
        `}
        style={{ perspective: '1000px' }}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-full animate-float" />
            <div className="absolute top-8 right-8 w-8 h-8 bg-white/15 rounded-full animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-6 left-8 w-6 h-6 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header with badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse-glow">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg font-sans">
                  {currentAd.title}
                </h3>
                <p className="text-white/80 text-sm font-medium">
                  {currentAd.subtitle}
                </p>
              </div>
            </div>
            
            {currentAd.badge && (
              <Badge 
                className={`
                  ${currentAd.badgeColor} text-white font-bold px-3 py-1 
                  animate-pulse border-0 shadow-lg
                `}
              >
                {currentAd.badge}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-white/90 text-sm mb-6 leading-relaxed font-medium">
            {currentAd.description}
          </p>

          {/* CTA Button */}
          <Button 
            className="
              w-full bg-white/20 backdrop-blur-sm border border-white/30 
              text-white hover:bg-white/30 hover:scale-105 hover:-translate-y-1 
              font-bold rounded-full transition-all duration-300 
              shadow-lg hover:shadow-xl group/btn
            "
            onClick={() => {
              if (currentAd.link) {
                window.open(currentAd.link, '_blank');
              }
            }}
          >
            <span className="mr-2">{currentAd.cta}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Button>

          {/* Bottom decoration */}
          <div className="flex items-center justify-center mt-4 gap-2">
            <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
            <span className="text-white/60 text-xs font-medium">
              Powered by Web3
            </span>
            <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>

      {/* Manual navigation dots (optional) */}
      <div className="flex justify-center gap-2 mt-3">
        {WEB3_ADS.map((_, index) => (
          <button
            key={index}
            className={`
              w-2 h-2 rounded-full transition-all duration-200
              ${index === currentAdIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/40 hover:bg-white/60'
              }
            `}
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => {
                setCurrentAdIndex(index);
                setIsAnimating(false);
              }, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ModernWeb3AdsCarousel;