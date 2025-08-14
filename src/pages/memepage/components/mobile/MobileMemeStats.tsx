import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  Activity,
  Zap,
  Crown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const MobileMemeStats = () => {
  const { t } = useLanguage();
  const stats = [
    {
      label: t('memeStats.marketCap'),
      value: '$847.2M',
      change: '+12.4%',
      positive: true,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: t('memeStats.totalVolume'),
      value: '$124.8M',
      change: '+28.7%',
      positive: true,
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: t('memeStats.activeTraders'),
      value: '47.2K',
      change: '+5.3%',
      positive: true,
      icon: Users,
      color: 'from-purple-500 to-violet-600'
    },
    {
      label: t('memeStats.hotTokens'),
      value: '238',
      change: '+15.8%',
      positive: true,
      icon: Zap,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="px-4 py-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {t('memeStats.marketOverview')}
        </h3>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          {t('memeStats.live')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card 
              key={index}
              className="bg-black/20 backdrop-blur-xl border border-white/10 p-4 hover:bg-black/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  stat.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="font-numbers">{stat.change}</span>
                </div>
              </div>
              
              <div>
                <div className="text-xl font-black font-numbers text-white mb-1">{stat.value}</div>
                <div className="text-white/60 text-xs font-medium">{stat.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Market Sentiment */}
      <Card className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-white">{t('memeStats.marketSentiment')}</span>
            </div>
             <div className="text-2xl font-black text-green-400">{t('memeStats.extremelyBullish')}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-numbers text-green-400 mb-1">92%</div>
            <div className="text-xs text-white/70">{t('memeStats.bullBearRatio')}</div>
          </div>
        </div>
        
        {/* Sentiment Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-2">
            <span>{t('memeStats.bear')}</span>
            <span>{t('memeStats.bull')}</span>
          </div>
          <div className="w-full bg-red-900/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: '92%' }}
            ></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MobileMemeStats;