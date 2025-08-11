import { NavLink, useLocation } from "react-router-dom";
import { 
  Coins, 
  Zap,
  ShoppingCart
} from "lucide-react";

const MemeZoneBottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/meme/create", icon: Coins, label: "Skapa Coin" },
    { path: "/meme", icon: Zap, label: "Meme Zone" },
    { path: "/meme/buy", icon: ShoppingCart, label: "Köp" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-xl border-t border-border/50 z-[100] md:hidden">
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-3 px-6 rounded-xl transition-all duration-300 min-w-[80px] ${
                isActive 
                  ? "text-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon 
                className={`h-6 w-6 mb-1 transition-all duration-300 ${
                  isActive ? "text-primary scale-110" : ""
                }`} 
              />
              <span className={`text-xs font-medium transition-all duration-300 ${
                isActive ? "font-semibold" : ""
              }`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MemeZoneBottomNavigation;