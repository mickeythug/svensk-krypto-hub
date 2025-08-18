import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Hash
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
    <div className="fixed left-0 top-0 h-full w-96 bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl z-[60]">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Telegram Monitor</h2>
              <p className="text-sm text-muted-foreground">Live token mentions</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all", label: "All", icon: Hash },
              { id: "positive", label: "Bullish", icon: TrendingUp },
              { id: "signals", label: "Signals", icon: Zap },
              { id: "verified", label: "Verified", icon: Star }
            ].map((filterOption) => (
              <Button
                key={filterOption.id}
                variant={filter === filterOption.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.id)}
                className="text-xs"
              >
                <filterOption.icon className="h-3 w-3 mr-1" />
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4 grid w-auto grid-cols-2">
              <TabsTrigger value="mentions" className="text-sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Mentions
              </TabsTrigger>
              <TabsTrigger value="channels" className="text-sm">
                <Users className="h-4 w-4 mr-2" />
                Channels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mentions" className="flex-1 px-6 pb-6 mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {filteredMentions.map((mention) => (
                    <Card key={mention.id} className="p-4 hover:bg-accent/50 transition-colors border-border/50">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/50 flex items-center justify-center">
                              <img 
                                src={`/src/assets/crypto-logos/${mention.tokenSymbol.toLowerCase()}.png`}
                                alt={mention.tokenSymbol}
                                className="w-8 h-8"
                                onError={(e) => {
                                  e.currentTarget.src = `/src/assets/crypto-logos/svg/${mention.tokenSymbol.toLowerCase()}.svg`;
                                }}
                              />
                            </div>
                            <div>
                              <div className="text-xl font-bold text-foreground mb-1">
                                MENTIONED IN {mention.channel.toUpperCase()}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg text-foreground">${mention.tokenSymbol}</span>
                                {mention.verified && (
                                  <Star className="h-4 w-4 text-primary fill-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(mention.type)}
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(mention.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Token Info */}
                        <div className="space-y-2">
                          <div className="text-lg font-bold text-foreground">
                            {mention.tokenSymbol}
                          </div>
                          <button
                            onClick={() => window.location.href = `/meme/${mention.tokenAddress}`}
                            className="text-sm text-primary hover:text-primary/80 font-mono bg-accent/50 px-3 py-1 rounded-md hover:bg-accent transition-colors cursor-pointer"
                          >
                            {mention.tokenAddress}
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ChevronUp className="h-3 w-3" />
                              {mention.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {mention.replies}
                            </span>
                          </div>
                          <Badge variant="outline" className={`text-xs ${getSentimentBadge(mention.sentiment)}`}>
                            {mention.sentiment}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="channels" className="flex-1 px-6 pb-6 mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <Card key={channel.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{channel.name}</span>
                                {channel.verified && (
                                  <Star className="h-3 w-3 text-primary fill-primary" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatNumber(channel.members)} members
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {channel.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                        
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View Channel
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TelegramMonitor;