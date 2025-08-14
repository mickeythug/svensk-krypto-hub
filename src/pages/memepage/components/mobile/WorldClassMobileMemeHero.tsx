import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import { Flame, Crown, Sparkles, TrendingUp, Star, Bell, Search, Plus, Zap, Rocket } from 'lucide-react';
import heroImage from '@/assets/meme-hero.jpg';
import MobileMemeSearch from './MobileMemeSearch';
import ModernWeb3AdsCarousel from '@/components/ModernWeb3AdsCarousel';
const FloatingIcon = ({
  icon: Icon,
  delay = 0,
  className = ""
}) => <div className={`absolute ${className} animate-float`} style={{
  animationDelay: `${delay}s`
}}>
    <Icon className="w-6 h-6 text-primary/60" />
  </div>;
const AnimatedNumber = ({
  value,
  duration = 2000
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, {
      threshold: 0.1
    });
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
  return <span ref={ref}>
      {value.includes('.') ? count.toFixed(1) : count.toLocaleString()}
      {value.includes('K') && 'K'}
      {value.includes('M') && 'M'}
      {value.includes('%') && '%'}
      {value.includes('$') && '$'}
    </span>;
};
const WorldClassMobileMemeHero = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    // Trigger entrance animations
    setTimeout(() => setIsLoaded(true), 100);
  }, []);
  return <div className={`relative px-4 pt-8 pb-6 overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
          <Button size="icon" variant="ghost" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mobile-backdrop hover:scale-110 hover:rotate-12 transition-all duration-300" onClick={() => setSearchOpen(true)}>
            <Search className="w-5 h-5 text-white" />
          </Button>
          
          <div className="relative">
            
          </div>
        </div>
      </div>

      {/* Modern Web3 Ads Carousel */}
      <ModernWeb3AdsCarousel />

      {/* Enhanced stats with world-class animations */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[{
        value: "1,247",
        label: "Active Tokens",
        color: "text-white",
        gradient: "from-blue-500 to-cyan-500"
      }, {
        value: "+84%",
        label: "Avg Gain 24h",
        color: "text-green-400",
        gradient: "from-green-500 to-emerald-500"
      }, {
        value: "$2.4M",
        label: "Total Volume",
        color: "text-yellow-400",
        gradient: "from-yellow-500 to-orange-500"
      }].map((stat, index) => <div key={index} className="hover:scale-105 hover:-translate-y-2 transition-all duration-500 ease-out" style={{
        animationDelay: `${index * 200}ms`
      }}>
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10 p-3 text-center mobile-backdrop hover:bg-black/30 hover:border-white/20 transition-all duration-300 group">
               <div className={`text-lg font-bold font-numbers mb-1 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                 <AnimatedNumber value={stat.value} />
               </div>
              <div className="text-white/70 text-xs font-medium text-center">
                {stat.label}
              </div>
              {/* Subtle gradient accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </Card>
          </div>)}
      </div>
    </div>;
};
export default WorldClassMobileMemeHero;