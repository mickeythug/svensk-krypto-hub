import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  TrendingUp, 
  Newspaper, 
  Wallet, 
  Settings 
} from "lucide-react";

const MobileBottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Hem" },
    { path: "/marknad", icon: TrendingUp, label: "Marknad" },
    { path: "/nyheter", icon: Newspaper, label: "Nyheter" },
    { path: "/portfolio", icon: Wallet, label: "Portfölj" },
    { path: "/verktyg", icon: Settings, label: "Verktyg" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 z-50 md:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon 
                className={`h-5 w-5 mb-1 ${isActive ? "text-primary" : ""}`} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;