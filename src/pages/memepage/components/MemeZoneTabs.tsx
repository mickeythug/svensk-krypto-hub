import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import OptimizedImage from '@/components/OptimizedImage';
import { useMemeTokens } from '../hooks/useMemeTokens';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

function formatPrice(n: number) {
  if (!isFinite(n)) return '—';
  if (n === 0) return '$0.0000';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(6)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function formatCompact(n: number) {
  if (!isFinite(n) || n <= 0) return '—';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}

const Grid: React.FC<{ category: 'newest' | 'trending' | 'potential' }> = ({ category }) => {
  const navigate = useNavigate();
  const { tokens, loading, error } = useMemeTokens(category, 50);

  if (loading && tokens.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4 bg-card/60">
            <Skeleton className="w-full h-28 rounded-md mb-3" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }
  if (error) return <p className="text-destructive text-sm">{error}</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {tokens.map((t) => (
        <Card 
          key={t.id} 
          className="p-4 bg-card/60 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate(`/meme/token/${t.symbol.toLowerCase()}?address=${encodeURIComponent(t.id)}`)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-border/50">
              <OptimizedImage src={t.image || '/placeholder.svg'} alt={`${t.name} logo`} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{t.symbol}</div>
              <div className="text-muted-foreground text-xs truncate">{t.name}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Pris</div>
              <div className="font-medium">{formatPrice(t.price)}</div>
            </div>
            <div className={`text-right font-medium ${t.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(2)}%
              <div className="text-xs text-muted-foreground">24h</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">MCap</div>
              <div className="font-medium">{formatCompact(t.marketCap)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Vol 24h</div>
              <div className="font-medium">{formatCompact(t.volume24h)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Holders</div>
              <div className="font-medium">{formatCompact(t.holders)}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const MemeZoneTabs: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <section className={`${isMobile ? 'py-8 px-3' : 'py-16 px-4'} bg-meme-grid-bg/50`}>
      <div className="container mx-auto">
        <h2 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'} font-bold text-center ${isMobile ? 'mb-6' : 'mb-10'} bg-gradient-neon bg-clip-text text-transparent`}>
          Utforska Meme Tokens
        </h2>
        <Tabs defaultValue="trending" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="newest">Nyast</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="potential">Potential</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="newest" forceMount><Grid category="newest" /></TabsContent>
          <TabsContent value="trending" forceMount><Grid category="trending" /></TabsContent>
          <TabsContent value="potential" forceMount><Grid category="potential" /></TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default MemeZoneTabs;
