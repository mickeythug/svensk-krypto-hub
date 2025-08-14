import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens, type MemeCategory } from '../../hooks/useMemeTokens';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Crown,
  Flame,
  Target,
  Star,
  Zap,
  Eye,
  Heart
} from 'lucide-react';

interface Props {
  category: MemeCategory;
}

function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(n);
}

function formatPercentage(n: number) {
  if (!isFinite(n)) return '0%';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}k%`;
  if (abs >= 100) return `${n.toFixed(0)}%`;
  if (abs >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
}

const TokenCard = ({ token, index, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 1000) + 100);
  const positive = token.change24h > 0;
  const isTop3 = index < 3;
  const isTop1 = index === 0;

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.03,
      y: -10,
      rotateX: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const glowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 40px rgba(59, 130, 246, 0.6)",
        "0 0 20px rgba(59, 130, 246, 0.3)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <Card
        className={`group relative overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 cursor-pointer mobile-backdrop ${
          isTop1 ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20' :
          isTop3 ? 'border-orange-400/50 bg-gradient-to-r from-orange-900/20 to-red-900/20' :
          'hover:border-white/20'
        }`}
        onClick={onClick}
      >
        <motion.div 
          className="p-4"
          style={{ perspective: 1000 }}
        >
          <div className="flex items-start gap-4">
            {/* Enhanced Rank & Image */}
            <div className="relative">
              <AnimatePresence>
                {isTop3 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="absolute -top-2 -left-2 z-10"
                  >
                    <Badge className={`text-xs px-2 py-1 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                      'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
                    }`}>
                      <motion.div
                        animate={index === 0 ? {
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.2, 1]
                        } : {}}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {index === 0 && <Crown className="w-3 h-3 mr-1" />}
                        #{index + 1}
                      </motion.div>
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <OptimizedImage
                  src={token.image || '/placeholder.svg'}
                  alt={`${token.name} logo`}
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder.svg"
                />
              </motion.div>
            </div>

            {/* Enhanced Token Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <motion.div 
                  className="min-w-0 flex-1"
                  whileHover={{ x: 5 }}
                >
                  <motion.h3 
                    className="font-black text-lg text-white truncate"
                    whileHover={{ 
                      textShadow: "0 0 10px rgba(255,255,255,0.8)"
                    }}
                  >
                    {token.symbol}
                  </motion.h3>
                  <p className="text-white/60 text-sm truncate">{token.name}</p>
                </motion.div>
                
                {/* Enhanced Price Change */}
                <motion.div 
                  className={`flex items-center gap-1 text-sm font-bold ${
                    positive ? 'text-green-400' : 'text-red-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    animate={positive ? {
                      y: [-2, 2, -2],
                      rotate: [0, 5, -5, 0]
                    } : {
                      y: [2, -2, 2],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {positive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </motion.div>
                  {positive ? '+' : ''}{formatPercentage(token.change24h)}
                </motion.div>
              </div>

              {/* Enhanced Stats with hover effects */}
              <motion.div 
                className="grid grid-cols-3 gap-3 mb-3"
                variants={{
                  hover: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {[
                  { icon: DollarSign, label: "Price", value: formatPrice(token.price) },
                  { icon: BarChart3, label: "MCap", value: formatCompact(token.marketCap) },
                  { icon: Users, label: "Vol 24h", value: formatCompact(token.volume24h) }
                ].map((stat, statIndex) => (
                  <motion.div
                    key={statIndex}
                    className="bg-white/5 rounded-lg p-2 border border-white/10"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      transition: { duration: 0.2 }
                    }}
                    variants={{
                      hover: {
                        y: -3,
                        transition: { duration: 0.2 }
                      }
                    }}
                  >
                    <div className="text-white/60 text-xs mb-1 flex items-center gap-1">
                      <stat.icon className="w-3 h-3" />
                      {stat.label}
                    </div>
                    <motion.div 
                      className="text-white font-bold text-sm"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.value}
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Premium Action Button with enhanced effects */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="sm"
                  className={`w-full bg-gradient-to-r from-primary/80 to-primary text-black font-bold rounded-lg transition-all duration-300 mobile-backdrop ${
                    isTop1 ? 'animate-pulse' : ''
                  }`}
                >
                  <Target className="w-4 h-4 mr-2" />
                  HANDLA NU
                </Button>
              </motion.div>

              {/* Social engagement indicators */}
              <motion.div 
                className="flex items-center justify-between mt-2 text-white/50 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="flex items-center gap-1 cursor-pointer"
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                >
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </motion.div>
                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                </motion.div>
                
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{viewCount}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Hot Badge */}
          <AnimatePresence>
            {isTop3 && (
              <motion.div
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -45 }}
                className="absolute top-2 right-2"
              >
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {isTop1 ? '🔥 HOT' : '⭐ TOP'}
                  </motion.div>
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          variants={isTop1 ? glowVariants : {}}
          animate={isTop1 ? "animate" : ""}
        />
      </Card>
    </motion.div>
  );
};

const PremiumMobileMemeTokenGrid: React.FC<Props> = ({ category }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { tokens, loading, error, hasMore } = useMemeTokens(category, 20, page);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setPage(1);
    controls.start("visible");
  }, [category, controls]);

  const loadMore = async () => {
    if (hasMore && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(p => p + 1);
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  if (loading && tokens.length === 0) {
    return (
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10 p-4 animate-pulse mobile-backdrop">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20 bg-white/10" />
                    <Skeleton className="h-4 w-16 bg-white/10" />
                  </div>
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-white/10" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Försök igen
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {tokens.map((token, index) => (
          <TokenCard
            key={token.id}
            token={token}
            index={index}
            onClick={() => navigate(`/meme/token/${token.symbol.toLowerCase()}?address=${encodeURIComponent(token.id)}`)}
          />
        ))}
      </AnimatePresence>

      {/* Enhanced Load More Button */}
      <AnimatePresence>
        {hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={loadMore}
                disabled={loading || isLoadingMore}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-semibold py-4 mobile-backdrop"
              >
                {isLoadingMore ? (
                  <motion.div 
                    className="flex items-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <motion.div 
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Laddar fler...
                  </motion.div>
                ) : (
                  'Ladda fler tokens'
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PremiumMobileMemeTokenGrid;