import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Zap, 
  ExternalLink, 
  Activity,
  TrendingUp,
  Clock,
  Globe
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LiveNewsItem {
  id: string;
  text: string;
  source: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  category: 'btc' | 'eth' | 'market' | 'defi' | 'nft' | 'general';
  url?: string;
}

const LiveNewsMonitor = () => {
  const { t } = useLanguage();
  const [liveNews, setLiveNews] = useState<LiveNewsItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Mock live news data - in production this would connect to telegram feeds
  const generateMockNews = (): LiveNewsItem[] => [
    {
      id: '1',
      text: '⚡️NEW: BlackRock\'s Larry Fink appointed as the interim co-chair of the World Economic Forum.',
      source: '@CoinTelegraph',
      timestamp: new Date().toISOString(),
      priority: 'high',
      category: 'market',
      url: 'https://cointelegraph.com/'
    },
    {
      id: '2',
      text: 'JUST IN: Spot Bitcoin and Ethereum ETFs record $40 billion in volume, their biggest week ever, Bloomberg reports.',
      source: '@WatcherGuru',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      priority: 'high',
      category: 'btc'
    },
    {
      id: '3',
      text: '🚨 BREAKING: Major whale moves 15,000 BTC to unknown wallet address',
      source: '@WhaleAlert',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      priority: 'medium',
      category: 'btc'
    },
    {
      id: '4',
      text: '📈 Ethereum network activity surges 45% as DeFi protocols see renewed interest',
      source: '@DeFiPulse',
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      priority: 'medium',
      category: 'eth'
    },
    {
      id: '5',
      text: '🔥 Solana TVL reaches new all-time high of $8.2B amid growing ecosystem adoption',
      source: '@SolanaFloor',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      priority: 'medium',
      category: 'defi'
    }
  ];

  useEffect(() => {
    // Initialize with mock data
    setLiveNews(generateMockNews());

    // Simulate live updates every 30 seconds
    const interval = setInterval(() => {
      const newItem: LiveNewsItem = {
        id: Date.now().toString(),
        text: getRandomNewsText(),
        source: getRandomSource(),
        timestamp: new Date().toISOString(),
        priority: Math.random() > 0.7 ? 'high' : 'medium',
        category: getRandomCategory()
      };

      setLiveNews(prev => [newItem, ...prev.slice(0, 49)]); // Keep last 50 items
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRandomNewsText = () => {
    const newsTexts = [
      '📊 Trading volume spikes across major exchanges',
      '🏦 Major bank announces crypto custody services',
      '⚡️ Lightning Network reaches new payment milestone',
      '🌐 Layer 2 solutions see massive adoption surge',
      '💰 Institutional buying pressure continues to grow',
      '🔍 On-chain metrics show bullish divergence',
      '📈 Options market shows increased call buying',
      '🎯 Technical analysis points to potential breakout'
    ];
    return newsTexts[Math.floor(Math.random() * newsTexts.length)];
  };

  const getRandomSource = () => {
    const sources = ['@CryptoQuant', '@Glassnode', '@IntoTheBlock', '@Messari', '@DeFiLlama', '@CoinMetrics'];
    return sources[Math.floor(Math.random() * sources.length)];
  };

  const getRandomCategory = (): LiveNewsItem['category'] => {
    const categories: LiveNewsItem['category'][] = ['btc', 'eth', 'market', 'defi', 'general'];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = Math.floor((now - time) / 60000); // minutes
    
    if (diff < 1) return t('news.justNow');
    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getPriorityColor = (priority: LiveNewsItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-destructive border-destructive/30';
      case 'medium': return 'text-warning border-warning/30';
      default: return 'text-muted-foreground border-muted/30';
    }
  };

  const getCategoryIcon = (category: LiveNewsItem['category']) => {
    switch (category) {
      case 'btc': return '₿';
      case 'eth': return 'Ξ';
      case 'market': return '📊';
      case 'defi': return '🏦';
      case 'nft': return '🎨';
      default: return '📰';
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-background/95 border-r border-border/50 backdrop-blur-sm z-10">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-ping" />
            </div>
            <h3 className="font-semibold text-primary">Live News Monitor</h3>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>100+ Sources</span>
            </div>
          </div>
        </div>

        {/* News Feed */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {liveNews.map((item, index) => (
              <Card 
                key={item.id} 
                className={`p-3 border-l-4 transition-all duration-300 hover:bg-secondary/50 cursor-pointer
                  ${item.priority === 'high' ? 'border-l-destructive bg-destructive/5' : 
                    item.priority === 'medium' ? 'border-l-warning bg-warning/5' : 
                    'border-l-muted bg-secondary/20'}
                  ${index < 3 ? 'animate-fade-in' : ''}
                `}
                onClick={() => item.url && window.open(item.url, '_blank')}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1.5 py-0.5 ${getPriorityColor(item.priority)}`}
                  >
                    {getCategoryIcon(item.category)}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed mb-2 text-foreground">
                  {item.text}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">
                    {item.source}
                  </span>
                  {item.url && (
                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 bg-secondary/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Auto-refresh: 30s</span>
            </div>
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveNewsMonitor;