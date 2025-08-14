import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, TrendingUp, Plus, Wallet, User, Search, Star, BarChart3 } from 'lucide-react';
const MobileMemeNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('meme');
  const navItems = [{
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
    badge: null
  }, {
    id: 'meme',
    label: 'Meme Zone',
    icon: TrendingUp,
    path: '/meme',
    badge: 'HOT'
  }, {
    id: 'create',
    label: 'Create',
    icon: Plus,
    path: '/meme/create',
    badge: null
  }, {
    id: 'portfolio',
    label: 'Portfolio',
    icon: Wallet,
    path: '/portfolio',
    badge: null
  }, {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
    badge: null
  }];
  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    navigate(item.path);
  };
  return <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10">
      {/* iOS-style home indicator */}
      <div className="flex justify-center pt-2">
        <div className="w-32 h-1 bg-white/30 rounded-full"></div>
      </div>
      
      <div className="px-4 pb-6 pt-3">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || item.id === 'meme' && location.pathname.startsWith('/meme');
          return <Button key={item.id} variant="ghost" onClick={() => handleNavClick(item)} className={`flex flex-col items-center gap-1 p-3 h-auto relative transition-all duration-300 ${isActive ? 'text-primary bg-primary/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                {/* Icon container with active indicator */}
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isActive ? 'bg-primary/20 scale-110' : ''}`}>
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-primary' : ''}`} />
                  
                  {/* Active indicator dot */}
                  {isActive && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-semibold transition-all duration-300 ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
                
                {/* Badge */}
                {item.badge}
              </Button>;
        })}
        </div>
      </div>
    </div>;
};
export default MobileMemeNavigation;