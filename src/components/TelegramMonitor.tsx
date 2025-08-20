import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Radio,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface TelegramMention {
  id: string;
  channel: string;
  tokenSymbol: string;
  tokenAddress: string;
  timestamp: string;
}

const TelegramMonitor = () => {
  const [mentions, setMentions] = useState<TelegramMention[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Force component refresh - timestamp: 2025-08-20T13:19

  // Mock data for demonstration
  useEffect(() => {
    const mockMentions: TelegramMention[] = [
      {
        id: "1",
        channel: "CryptoSignals212",
        tokenSymbol: "DOGE",
        tokenAddress: "DGB4x2mQ...7k5L",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: "2", 
        channel: "MemeAlpha88",
        tokenSymbol: "PEPE",
        tokenAddress: "A1B2C3D4...9XYZ",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        channel: "DeFiGems555",
        tokenSymbol: "BONK",
        tokenAddress: "9WzB5k...T4mP",
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        channel: "TokenHunters99",
        tokenSymbol: "SHIB",
        tokenAddress: "2H8k...F9dL",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      }
    ];

    setMentions(mockMentions);
  }, []);

  return (
    <div 
      className={`fixed left-0 top-[120px] h-[calc(100vh-120px)] z-40 transition-all duration-500 ease-in-out ${
        isCollapsed ? 'w-12' : 'w-96'
      }`}
    >
      {/* Modern Toggle Button - Updated */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute ${isCollapsed ? 'left-3' : 'right-3'} top-3 z-50 w-10 h-10 p-0 rounded-full bg-primary/30 hover:bg-primary/50 border-2 border-primary/40 shadow-lg transition-all duration-300 hover:scale-110`}
        variant="ghost"
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-primary-foreground" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-primary-foreground" />
        )}
      </Button>

      <GlassCard 
        className={`h-full w-full border-0 bg-gradient-to-b from-background/40 via-background/20 to-background/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        glow={true}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl border border-primary/20 shadow-lg">
                  <Radio className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground tracking-wide">
                    Telegram Monitor
                  </h2>
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with Enhanced Scrollbar */}
        <div className="flex-1 relative overflow-hidden px-6 pb-6 pt-4">
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              {mentions.map((mention, index) => (
                <div
                  key={mention.id}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <GlassCard 
                    className="p-4 border border-border/30 bg-gradient-to-br from-background/40 to-background/20 hover:from-background/60 hover:to-background/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                        <img 
                          src={`/src/assets/crypto-logos/${mention.tokenSymbol.toLowerCase()}.png`}
                          alt={mention.tokenSymbol}
                          className="w-6 h-6"
                          onError={(e) => {
                            e.currentTarget.src = `/src/assets/crypto-logos/svg/${mention.tokenSymbol.toLowerCase()}.svg`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-foreground">
                            ${mention.tokenSymbol}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Mention in {mention.channel}
                        </div>
                        <button
                          onClick={() => window.location.href = `/meme/${mention.tokenAddress}`}
                          className="text-xs text-primary hover:text-primary/80 font-mono bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-all duration-300"
                        >
                          {mention.tokenAddress}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </GlassCard>

      {/* Collapsed State Indicator */}
      {isCollapsed && (
        <div className="mt-2 flex flex-col items-center space-y-2">
          <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
            <Radio className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div className="w-1 h-8 bg-primary/30 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default TelegramMonitor;