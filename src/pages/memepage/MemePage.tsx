import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MemeTokenGrid from './components/MemeTokenGrid';
import TrendingMemeTokens from './components/TrendingMemeTokens';
import MemeFunStats from './components/MemeFunStats';
import MemeHeader from './components/MemeHeader';

interface MemePage {}

const MemePage: React.FC<MemePage> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-pink-900/20">
      <Helmet>
        <title>Meme Tokens - Crypto Network Sweden</title>
        <meta name="description" content="Upptäck de hetaste meme tokens! Trending meme kryptovalutor, top tokens under 1M market cap, och mer. Gå med i meme token revolutionen!" />
        <meta name="keywords" content="meme tokens, meme coins, crypto memes, trending tokens, small cap crypto, dogecoin, shiba inu" />
        <meta property="og:title" content="Meme Tokens - Upptäck De Hetaste Meme Kryptovalutorna" />
        <meta property="og:description" content="Utforska världen av meme tokens! Trending meme kryptovalutor, små market cap gems, och community-drivna tokens." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://cryptonetwork.se/meme" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <MemeHeader />
        
        {/* Fun Stats Section */}
        <section className="mb-12">
          <MemeFunStats />
        </section>

        {/* Trending Meme Tokens */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-8 w-8 text-primary animate-pulse" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                🔥 Trending Meme Tokens
              </h2>
            </div>
            <TrendingMemeTokens />
          </motion.div>
        </section>

        {/* Top 10 Under 1M Market Cap */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-8 w-8 text-warning animate-bounce" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
                💎 Top Gems Under 1M Market Cap
              </h2>
            </div>
            <MemeTokenGrid category="under1m" />
          </motion.div>
        </section>

        {/* All Meme Tokens Grid */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-8 w-8 text-accent animate-spin" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
                🚀 All Meme Tokens
              </h2>
            </div>
            <MemeTokenGrid category="all" />
          </motion.div>
        </section>

        {/* Warning Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <Card className="p-6 border-warning/50 bg-gradient-to-r from-warning/10 to-orange-500/10">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-warning mt-1 animate-pulse" />
              <div>
                <h3 className="font-bold text-warning mb-2">⚠️ Meme Token Varning</h3>
                <p className="text-sm text-muted-foreground">
                  Meme tokens är extremt volatila och riskfyllda investeringar. Invester endast vad du har råd att förlora. 
                  Gör alltid egen research (DYOR) innan du investerar i meme tokens. Denna sida är endast för utbildning och underhållning.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MemePage;