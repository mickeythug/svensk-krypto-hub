import { motion } from 'framer-motion';
import { TrendingUp, Zap, DollarSign, Users, Rocket, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MemeFunStats = () => {
  const stats = [
    {
      icon: Rocket,
      title: 'Total Meme Tokens',
      value: '2,847',
      change: '+247 denna vecka',
      emoji: '🚀',
      gradient: 'from-primary to-blue-500',
      bgGradient: 'from-primary/20 to-blue-500/20'
    },
    {
      icon: DollarSign,
      title: 'Total Market Cap',
      value: '$45.2B',
      change: '+12.5% denna månad',
      emoji: '💰',
      gradient: 'from-success to-emerald-500',
      bgGradient: 'from-success/20 to-emerald-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Genomsnittlig Volatilitet',
      value: '±247%',
      change: 'Per dag i snitt',
      emoji: '📈',
      gradient: 'from-warning to-orange-500',
      bgGradient: 'from-warning/20 to-orange-500/20'
    },
    {
      icon: Users,
      title: 'Aktiva Meme Holders',
      value: '12.8M',
      change: '+890K denna vecka',
      emoji: '👥',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Zap,
      title: 'Dagens Beste Gainer',
      value: '+1,247%',
      change: 'PEPE 2.0 🐸',
      emoji: '⚡',
      gradient: 'from-destructive to-red-500',
      bgGradient: 'from-destructive/20 to-red-500/20'
    },
    {
      icon: Star,
      title: 'Nya Tokens Idag',
      value: '156',
      change: 'Lanserade senaste 24h',
      emoji: '✨',
      gradient: 'from-accent to-cyan-500',
      bgGradient: 'from-accent/20 to-cyan-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${stat.bgGradient} border-border/50 hover:border-primary/30`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[url('/api/placeholder/100/100')] bg-repeat opacity-10" />
              </div>

              {/* Floating Emoji */}
              <div className="absolute top-4 right-4 text-3xl opacity-20 animate-bounce">
                {stat.emoji}
              </div>

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white shadow-lg`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                      {stat.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    {stat.change}
                  </div>
                </div>

                {/* Fun indicator bar */}
                <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 40 + 60}%` }}
                    transition={{ duration: 2, delay: index * 0.2 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MemeFunStats;