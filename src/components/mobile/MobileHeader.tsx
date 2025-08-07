import { Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileHeaderProps {
  title: string;
  showNotifications?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

const MobileHeader = ({ 
  title, 
  showNotifications = true, 
  showMenu = false,
  onMenuClick 
}: MobileHeaderProps) => {
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/50 z-40 md:hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative"
            >
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;