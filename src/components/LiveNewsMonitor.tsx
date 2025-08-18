import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      case 'high': return 'text-red-600 border-red-600';
      case 'medium': return 'text-yellow-600 border-yellow-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-background/98 border-r border-border/80 backdrop-blur-md z-20 shadow-2xl">
      <div className="h-full flex flex-col font-jetbrains">
        {/* Header */}
        <div className="p-6 border-b border-border/80 bg-secondary/20">
          <div className="mb-4">
            <h3 className="font-bold text-xl text-foreground tracking-wide">LIVE NEWS MONITOR</h3>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="font-semibold">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div className="text-sm font-bold">
              100+ SOURCES
            </div>
          </div>
        </div>

        {/* News Feed */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {liveNews.map((item, index) => (
              <Card 
                key={item.id} 
                className={`p-4 border-l-4 transition-all duration-300 hover:bg-secondary/30 cursor-pointer font-mono
                  ${item.priority === 'high' ? 'border-l-red-500 bg-red-50/10' : 
                    item.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50/10' : 
                    'border-l-gray-400 bg-gray-50/10'}
                  ${index < 3 ? 'animate-fade-in' : ''}
                `}
                onClick={() => item.url && window.open(item.url, '_blank')}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`text-sm px-3 py-1 font-bold border-2 ${getPriorityColor(item.priority)}`}
                    >
                      {item.category.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-muted-foreground font-bold">
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-base leading-relaxed font-medium text-foreground">
                    {item.text}
                  </p>
                  
                  <div className="text-sm text-primary font-bold pt-2 border-t border-border/50">
                    {item.source}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 bg-secondary/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground font-bold">
            <span>AUTO-REFRESH: 30 SECONDS</span>
            <Badge variant="outline" className="text-sm font-bold border-2 border-green-500 text-green-600">
              LIVE
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveNewsMonitor;