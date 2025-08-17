import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TelegramUpdate {
  id: string;
  token: string;
  group: string;
  followers: number;
  address: string;
  timestamp: Date;
  type: 'mention' | 'pump' | 'volume' | 'listing';
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

const TelegramMonitor: React.FC = () => {
  const [updates, setUpdates] = useState<TelegramUpdate[]>([]);

  // Mock real-time data simulation
  useEffect(() => {
    const mockUpdates: TelegramUpdate[] = [
      {
        id: '1',
        token: 'PUMPLESS',
        group: 'jscult',
        followers: 34000,
        address: '7TffjPhjJHMoqdtoA4CWoRyNxwJsYJe1ndGURAVgpump',
        timestamp: new Date(),
        type: 'mention',
        sentiment: 'bullish'
      },
      {
        id: '2',
        token: 'DOGEKING',
        group: 'cryptodegen',
        followers: 87000,
        address: '5KLmN9sYvRp8HNwQ2aX3vBmS6TgR8fDhJ2eP1wKv7xZc',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        type: 'pump',
        sentiment: 'bullish'
      },
      {
        id: '3',
        token: 'SHIBAMAX',
        group: 'moonshots',
        followers: 156000,
        address: '9FnQ7xR3mKpL5sWvA2bE8dG1cY4hN6jT7iU0oP2aS5rX',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'volume',
        sentiment: 'neutral'
      }
    ];

    setUpdates(mockUpdates);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newUpdate: TelegramUpdate = {
        id: Date.now().toString(),
        token: ['PEPEMOON', 'DOGEROCKET', 'SHIBANATOR', 'CATCOIN', 'FROGGY'][Math.floor(Math.random() * 5)],
        group: ['cryptoelite', 'memearmy', 'pumpclub', 'moongang', 'degenbase'][Math.floor(Math.random() * 5)],
        followers: Math.floor(Math.random() * 200000) + 10000,
        address: Array.from({length: 44}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join(''),
        timestamp: new Date(),
        type: ['mention', 'pump', 'volume', 'listing'][Math.floor(Math.random() * 4)] as any,
        sentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as any
      };

      setUpdates(prev => [newUpdate, ...prev.slice(0, 9)]); // Keep only 10 latest
    }, 8000 + Math.random() * 12000); // Random interval 8-20 seconds

    return () => clearInterval(interval);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mention': return <Activity className="w-4 h-4" />;
      case 'pump': return <TrendingUp className="w-4 h-4" />;
      case 'volume': return <DollarSign className="w-4 h-4" />;
      case 'listing': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-success border-success/20 bg-success/10';
      case 'bearish': return 'text-destructive border-destructive/20 bg-destructive/10';
      default: return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="w-80 h-full bg-card/50 backdrop-blur-md border-r border-border/20 overflow-hidden">
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
          <h3 className="font-semibold text-foreground text-lg">Telegram Monitor</h3>
        </div>
        <p className="text-muted-foreground text-sm">Real-time mentions & activity</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-modern p-4 space-y-3">
        <AnimatePresence>
          {updates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut"
              }}
            >
              <Card className="p-3 border border-border/20 bg-card/70 hover:bg-card/90 transition-all duration-300 hover:border-primary/30 hover:shadow-glow-primary/20">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSentimentColor(update.sentiment)}`}>
                    {getTypeIcon(update.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                        ${update.token}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {update.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2">
                      mentioned in <span className="font-semibold text-primary">{update.group}</span> group
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{(update.followers / 1000).toFixed(0)}k followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(update.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 rounded-md p-2 border border-border/10">
                      <p className="text-xs font-mono text-muted-foreground">
                        {truncateAddress(update.address)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {updates.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Waiting for updates...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramMonitor;