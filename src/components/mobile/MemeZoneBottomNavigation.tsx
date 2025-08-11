import { NavLink, useLocation } from "react-router-dom";
import { 
  Coins, 
  Zap,
  ShoppingCart
} from "lucide-react";

const MemeZoneBottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/meme/create", icon: Coins, label: "Skapa Coin", badge: "New" },
    { path: "/meme", icon: Zap, label: "Meme Zone", badge: null },
    { path: "/meme/buy", icon: ShoppingCart, label: "Köp", badge: "Beta" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-xl border-t border-border/50 z-[100] md:hidden shadow-2xl">
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-3 px-6 rounded-xl transition-all duration-300 min-w-[80px] transform hover:scale-105 ${
                isActive 
                  ? "text-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg scale-105 ring-2 ring-primary/30" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md"
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`h-6 w-6 mb-1 transition-all duration-300 ${
                    isActive ? "text-primary scale-110 drop-shadow-sm" : ""
                  }`} 
                />
                {item.badge && (
                  <div className="absolute -top-2 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full scale-75">
                    {item.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                isActive ? "font-semibold text-primary" : ""
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MemeZoneBottomNavigation;