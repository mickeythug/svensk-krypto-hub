import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import {
  Flame,
  Crown,
  Sparkles,
  TrendingUp,
  Star,
  Bell,
  Search,
  Plus,
  Zap,
  Rocket
} from 'lucide-react';
import heroImage from '@/assets/meme-hero.jpg';
import MobileMemeSearch from './MobileMemeSearch';

const FloatingIcon = ({ icon: Icon, delay = 0, className = "" }) => (
  <div 
    className={`absolute ${className} animate-float`}
    style={{ animationDelay: `${delay}s` }}
  >
    <Icon className="w-6 h-6 text-primary/60" />
  </div>
);

const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const end = parseInt(value.replace(/[^\d]/g, ''));
      const timer = setInterval(() => {
        start += end / (duration / 16);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isVisible, value, duration]);

  return (
    <span ref={ref}>
      {value.includes('.') ? count.toFixed(1) : count.toLocaleString()}
      {value.includes('K') && 'K'}
      {value.includes('M') && 'M'}
      {value.includes('%') && '%'}
      {value.includes('$') && '$'}
    </span>
  );
};

const WorldClassMobileMemeHero = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className={`relative px-4 pt-8 pb-6 overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <MobileMemeSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      {/* Floating background elements */}
      <FloatingIcon icon={Sparkles} delay={0} className="top-4 left-8" />
      <FloatingIcon icon={Star} delay={1} className="top-16 right-12" />
      <FloatingIcon icon={Zap} delay={2} className="bottom-24 left-16" />
      <FloatingIcon icon={Rocket} delay={1.5} className="bottom-16 right-8" />

      {/* Header with premium styling */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="hover:scale-105 transition-transform duration-300 no-fancy-effects">
          <h1 className="text-2xl font-bold text-white mb-1 font-sans text-clean">
            Meme Zone
          </h1>
          <p className="text-white/70 text-sm font-medium text-clean">Upptäck hetaste tokens</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            size="icon" 
            variant="ghost" 
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mobile-backdrop hover:scale-110 hover:rotate-12 transition-all duration-300"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5 text-white" />
          </Button>
          
          <div className="relative">
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mobile-backdrop hover:scale-110 transition-all duration-300"
            >
              <Bell className="w-5 h-5 text-white" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">{notificationCount}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Hero Card with advanced styling */}
      <div 
        className="group hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 ease-out"
        style={{ perspective: '1000px' }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-600/90 via-red-600/90 to-pink-600/90 border-none shadow-2xl backdrop-blur-sm mobile-backdrop group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500">
          {/* Dynamic background with enhanced effects */}
          <div className="absolute inset-0 opacity-30 group-hover:scale-110 transition-transform duration-1000">
            <OptimizedImage
              src={heroImage}
              alt="Meme Hero Background"
              className="w-full h-full object-cover"
              fallbackSrc="/placeholder.svg"
            />
          </div>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-casino-rainbow opacity-20 animate-shimmer" />
          
          {/* Content with premium styling */}
          <div className="relative z-10 p-6">
            {/* Premium badges with enhanced animations */}
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mobile-backdrop hover:scale-110 hover:rotate-3 transition-all duration-300">
                <Flame className="w-3 h-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
              
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:scale-110 hover:-rotate-3 transition-all duration-300">
                <Crown className="w-3 h-3 mr-1 animate-bounce" />
                Premium
              </Badge>
            </div>
            
            {/* Main content with world-class typography */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3 group no-fancy-effects">
                <h2 className="text-2xl font-bold text-white transition-all duration-300 text-clean">
                  HETASTE TOKENS
                </h2>
              </div>
              
              <p className="text-white/90 text-sm mb-6 max-w-xs mx-auto leading-relaxed font-medium text-clean text-container">
                Upptäck de mest explosiva meme tokens med live-data och realtidsuppdateringar
              </p>
              
              {/* Premium CTA Buttons with enhanced effects */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105 hover:-translate-y-1 font-semibold rounded-full mobile-backdrop transition-all duration-300 shadow-lg hover:shadow-xl">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Utforska
                </Button>
                
                <Button className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 hover:-translate-y-1 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Skapa Token
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced stats with world-class animations */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { value: "1,247", label: "Active Tokens", color: "text-white", gradient: "from-blue-500 to-cyan-500" },
          { value: "+84%", label: "Avg Gain 24h", color: "text-green-400", gradient: "from-green-500 to-emerald-500" },
          { value: "$2.4M", label: "Total Volume", color: "text-yellow-400", gradient: "from-yellow-500 to-orange-500" }
        ].map((stat, index) => (
          <div
            key={index}
            className="hover:scale-105 hover:-translate-y-2 transition-all duration-500 ease-out"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-3 text-center mobile-backdrop hover:bg-black/30 hover:border-white/20 transition-all duration-300 group">
              <div className={`text-lg font-bold mb-1 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <AnimatedNumber value={stat.value} />
              </div>
              <div className="text-white/70 text-xs font-medium text-center">
                {stat.label}
              </div>
              {/* Subtle gradient accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldClassMobileMemeHero;