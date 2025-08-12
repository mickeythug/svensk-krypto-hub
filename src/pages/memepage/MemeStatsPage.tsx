import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, DollarSign, Clock, Zap, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MemeZoneBottomNavigation from '@/components/mobile/MemeZoneBottomNavigation';

const MemeStatsPage = () => {
  const [stats, setStats] = useState({
    totalMarketCap: '$2.4B',
    activeTokens: '2,847',
    dailyVolume: '$125M',
    topGainer: 'BONK',
    topGainerChange: '+245%'
  });
  
  const isMobile = useIsMobile();

  const topPerformers = [
    { symbol: 'BONK', name: 'Bonk Inu', change: '+245%', volume: '$45M', rank: 1 },
    { symbol: 'DOGE', name: 'Dogecoin', change: '+156%', volume: '$892M', rank: 2 },
    { symbol: 'SHIB', name: 'Shiba Inu', change: '+89%', volume: '$234M', rank: 3 },
    { symbol: 'PEPE', name: 'Pepe Coin', change: '+67%', volume: '$156M', rank: 4 },
    { symbol: 'FLOKI', name: 'Floki Inu', change: '+45%', volume: '$89M', rank: 5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 font-inter">
      <main className={`${isMobile ? 'pb-24 px-4 pt-12' : 'px-8 pt-12'} space-y-6`}>
        {/* Internal Page Header - Extra margin to prevent overlap */}
        <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-4 shadow-lg mt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Meme Zone Statistik
              </h1>
              <p className="text-sm text-muted-foreground">Live marknadsdata och trender</p>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-500">Live</span>
            </div>
          </div>
        </div>
        {/* Market Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalMarketCap}</p>
              <p className="text-sm text-muted-foreground">Market Cap</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.activeTokens}</p>
              <p className="text-sm text-muted-foreground">Active Tokens</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.dailyVolume}</p>
              <p className="text-sm text-muted-foreground">24h Volume</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.topGainerChange}</p>
              <p className="text-sm text-muted-foreground">Top Gainer</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Performers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((token, index) => (
              <div key={token.symbol} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                    #{token.rank}
                  </div>
                  <div>
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">{token.name}</p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="text-right">
                  <Badge className="bg-green-500/20 text-green-400 mb-1">
                    {token.change}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{token.volume}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Sentiment */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Marknadssentiment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Bullish Sentiment</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fear & Greed Index</span>
                <span className="text-sm text-muted-foreground">65 (Greed)</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Social Activity</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </main>

      {isMobile && <MemeZoneBottomNavigation />}
    </div>
  );
};

export default MemeStatsPage;