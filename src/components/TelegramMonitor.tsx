import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Users, 
  TrendingUp, 
  Activity, 
  Clock, 
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Zap,
  Star,
  Hash,
  Sparkles,
  Shield,
  Eye,
  Target,
  Filter,
  Layers,
  Radio
} from "lucide-react";

interface TelegramMention {
  id: string;
  channel: string;
  channelLogo?: string;
  message: string;
  tokenSymbol: string;
  tokenAddress: string;
  timestamp: string;
  likes: number;
  replies: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  type: 'mention' | 'pump' | 'dump' | 'analysis';
  verified: boolean;
  followers: number;
}

interface TelegramChannel {
  id: string;
  name: string;
  logo?: string;
  members: number;
  description: string;
  verified: boolean;
  category: 'trading' | 'signals' | 'news' | 'community';
}

const TelegramMonitor = () => {
  const [mentions, setMentions] = useState<TelegramMention[]>([]);
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [activeTab, setActiveTab] = useState("mentions");
  const [filter, setFilter] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    const mockMentions: TelegramMention[] = [
      {
        id: "1",
        channel: "Crypto Cult",
        message: "🚀 $DOGE pump incoming! Major whale accumulation spotted. Token: DGB4...x2mQ",
        tokenSymbol: "DOGE",
        tokenAddress: "DGB4x2mQ...7k5L",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        likes: 234,
        replies: 45,
        sentiment: 'positive',
        type: 'pump',
        verified: true,
        followers: 15420
      },
      {
        id: "2", 
        channel: "Meme Signals",
        message: "⚠️ $PEPE showing bearish divergence on 4H chart. Caution advised. 📉",
        tokenSymbol: "PEPE",
        tokenAddress: "A1B2C3D4...9XYZ",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        likes: 89,
        replies: 23,
        sentiment: 'negative',
        type: 'analysis',
        verified: true,
        followers: 8760
      },
      {
        id: "3",
        channel: "Alpha Hunters",
        message: "New gem found! $BONK contract verified ✅ Liquidity locked 🔒 Team doxxed 👥",
        tokenSymbol: "BONK",
        tokenAddress: "9WzB5k...T4mP",
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        likes: 567,
        replies: 128,
        sentiment: 'positive',
        type: 'mention',
        verified: false,
        followers: 25300
      },
      {
        id: "4",
        channel: "DeFi Raiders",
        message: "🔥 $SHIB breaking resistance! Volume spike detected. Could see 50% move.",
        tokenSymbol: "SHIB",
        tokenAddress: "2H8k...F9dL",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        likes: 445,
        replies: 67,
        sentiment: 'positive',
        type: 'pump',
        verified: true,
        followers: 19850
      }
    ];

    const mockChannels: TelegramChannel[] = [
      {
        id: "1",
        name: "Crypto Cult",
        members: 15420,
        description: "Premium crypto signals and market analysis",
        verified: true,
        category: 'signals'
      },
      {
        id: "2",
        name: "Meme Signals",
        members: 8760,
        description: "Meme coin trading signals and alerts",
        verified: true,
        category: 'trading'
      },
      {
        id: "3",
        name: "Alpha Hunters",
        members: 25300,
        description: "Early gem discovery and analysis",
        verified: false,
        category: 'community'
      }
    ];

    setMentions(mockMentions);
    setChannels(mockChannels);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-warning';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success/20 text-success border-success/30';
      case 'negative':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-warning/20 text-warning border-warning/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pump':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'dump':
        return <ChevronDown className="h-4 w-4 text-destructive" />;
      case 'analysis':
        return <Activity className="h-4 w-4 text-primary" />;
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredMentions = mentions.filter(mention => {
    if (filter === "all") return true;
    if (filter === "positive") return mention.sentiment === 'positive';
    if (filter === "signals") return mention.type === 'pump' || mention.type === 'dump';
    if (filter === "verified") return mention.verified;
    return true;
  });

  return (
    <div className="fixed left-0 top-[120px] h-[calc(100vh-120px)] w-96 z-40">
      {/* Ultra Modern Glass Morphism Sidebar */}
      <GlassCard 
        className="h-full w-full border-0 bg-gradient-to-b from-background/40 via-background/20 to-background/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden"
        glow={true}
      >
        {/* Premium Header with Advanced Gradient */}
        <div className="relative p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            {/* Elite Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl border border-primary/20 shadow-lg">
                  <Radio className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text text-transparent tracking-wide">
                    Telegram Monitor
                  </h2>
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground/80 font-medium">Real-time market intelligence</p>
              </div>
            </div>

            {/* Advanced Filter System */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground/90">Smart Filters</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "All Signals", icon: Hash, color: "bg-gradient-to-r from-primary/20 to-primary/10" },
                  { id: "positive", label: "Bullish", icon: TrendingUp, color: "bg-gradient-to-r from-success/20 to-success/10" },
                  { id: "signals", label: "Hot Signals", icon: Zap, color: "bg-gradient-to-r from-warning/20 to-warning/10" },
                  { id: "verified", label: "Verified", icon: Shield, color: "bg-gradient-to-r from-accent/20 to-accent/10" }
                ].map((filterOption) => (
                  <Button
                    key={filterOption.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilter(filterOption.id)}
                    className={`
                      relative overflow-hidden text-xs font-medium transition-all duration-300 hover:scale-105
                      ${filter === filterOption.id 
                        ? `${filterOption.color} border border-primary/30 text-foreground shadow-lg` 
                        : 'bg-background/20 border border-border/30 text-muted-foreground hover:bg-background/40 hover:text-foreground'
                      }
                    `}
                  >
                    <filterOption.icon className="h-3 w-3 mr-1.5" />
                    {filterOption.label}
                    {filter === filterOption.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent animate-shimmer"></div>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Modern Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Premium Tab Navigation */}
            <div className="px-6 pt-4 pb-2">
              <div className="relative bg-background/30 backdrop-blur-sm rounded-xl p-1 border border-border/50">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setActiveTab("mentions")}
                    className={`
                      relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                      ${activeTab === "mentions" 
                        ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                      }
                    `}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Live Feed</span>
                    {activeTab === "mentions" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-lg animate-pulse"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("channels")}
                    className={`
                      relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                      ${activeTab === "channels" 
                        ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                      }
                    `}
                  >
                    <Users className="h-4 w-4" />
                    <span>Channels</span>
                    {activeTab === "channels" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-lg animate-pulse"></div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Feed Content */}
            <div className={`flex-1 px-6 pb-6 ${activeTab === "mentions" ? "block" : "hidden"}`}>
              <ScrollArea className="h-full custom-scrollbar">
                <div className="space-y-3">
                  {filteredMentions.map((mention, index) => (
                    <div
                      key={mention.id}
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <GlassCard 
                        className="p-4 border border-border/30 bg-gradient-to-br from-background/40 to-background/20 hover:from-background/60 hover:to-background/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                      >
                        <div className="space-y-4">
                          {/* Elite Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-lg">
                                  <img 
                                    src={`/src/assets/crypto-logos/${mention.tokenSymbol.toLowerCase()}.png`}
                                    alt={mention.tokenSymbol}
                                    className="w-8 h-8 transition-transform group-hover:scale-110"
                                    onError={(e) => {
                                      e.currentTarget.src = `/src/assets/crypto-logos/svg/${mention.tokenSymbol.toLowerCase()}.svg`;
                                    }}
                                  />
                                </div>
                                {mention.verified && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                                    <Shield className="h-2 w-2 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-base bg-gradient-to-r from-foreground via-primary/60 to-foreground bg-clip-text text-transparent">
                                    ${mention.tokenSymbol}
                                  </span>
                                  <Badge variant="outline" className={`text-xs ${getSentimentBadge(mention.sentiment)} border-0`}>
                                    {mention.sentiment}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="font-medium">{mention.channel}</span>
                                  <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                                  <span>{formatNumber(mention.followers)} followers</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(mention.type)}
                              <span className="text-xs text-muted-foreground font-medium">
                                {formatTimeAgo(mention.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Enhanced Message Display */}
                          <div className="space-y-3">
                            <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                              {mention.message}
                            </p>
                            <button
                              onClick={() => window.location.href = `/meme/${mention.tokenAddress}`}
                              className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-mono bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 border border-primary/20"
                            >
                              <Target className="h-3 w-3" />
                              {mention.tokenAddress}
                            </button>
                          </div>

                          {/* Premium Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/30">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ChevronUp className="h-3 w-3 text-success" />
                                <span className="font-medium">{formatNumber(mention.likes)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageCircle className="h-3 w-3 text-primary" />
                                <span className="font-medium">{formatNumber(mention.replies)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3 text-accent" />
                                <span className="font-medium">{formatNumber(mention.followers)}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-xs bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 text-primary hover:text-primary transition-all duration-300"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Channels Content */}
            <div className={`flex-1 px-6 pb-6 ${activeTab === "channels" ? "block" : "hidden"}`}>
              <ScrollArea className="h-full custom-scrollbar">
                <div className="space-y-3">
                  {channels.map((channel, index) => (
                    <div
                      key={channel.id}
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <GlassCard 
                        className="p-4 border border-border/30 bg-gradient-to-br from-background/40 to-background/20 hover:from-background/60 hover:to-background/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                      >
                        <div className="space-y-4">
                          {/* Channel Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-lg">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                {channel.verified && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                                    <Star className="h-2 w-2 text-primary-foreground fill-current" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-base bg-gradient-to-r from-foreground via-primary/60 to-foreground bg-clip-text text-transparent">
                                    {channel.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span className="font-medium">{formatNumber(channel.members)} members</span>
                                  <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                                  <Badge variant="secondary" className="text-xs bg-primary/10 border-primary/30 text-primary">
                                    {channel.category}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          
                          {/* Channel Description */}
                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                            {channel.description}
                          </p>
                          
                          {/* Premium Actions */}
                          <div className="flex gap-2 pt-2 border-t border-border/30">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 text-primary hover:text-primary transition-all duration-300"
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Join Channel
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="px-3 bg-background/20 hover:bg-background/40 border border-border/30"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
          
          {/* Premium Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm border-t border-border/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-muted-foreground font-medium">Live Monitoring Active</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Layers className="h-3 w-3" />
                <span className="font-mono">{filteredMentions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TelegramMonitor;