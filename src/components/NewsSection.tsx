import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Newspaper, Clock, ArrowRight, Bookmark, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "@/styles/utilities.css";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsSection = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  type NewsItem = {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    publishedAt: string;
    time: string;
    readTime: number;
    imageUrl?: string | null;
    trending: boolean;
    url: string;
    source?: string;
  };

  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalize = (s: string = "") => s.toLowerCase();
  const hasAny = (s: string, patterns: RegExp[]) => patterns.some((re) => re.test(s));
  const classifyCategory = (title: string, summary: string, tags: string[] = []) => {
    const t = normalize(title);
    const d = normalize(summary);
    const tagStr = normalize(tags.join(" "));
    const text = `${t} ${d} ${tagStr}`;

    const reBTC = [/\bbitcoin\b/i, /\bbtc\b/i, /\bxbt\b/i, /\blightning\b/i, /\bhalving\b/i];
    const reETH = [/\bethereum\b/i, /\beth\b/i, /\beth2\b/i, /\berc-?20\b/i, /\bevm\b/i, /\bvitalik\b/i];
    const reMEME = [/\bmeme\b/i, /\bdoge\b/i, /\bdogecoin\b/i, /\bshib\b/i, /\bshiba\b/i, /\bpepe\b/i, /\bbonk\b/i, /\bwen\b/i, /\bfloki\b/i, /\bcat\b/i, /\bfrog\b/i];
    const rePOL = [/\bsec\b/i, /\bregul\w*/i, /\bpolicy\b/i, /\bladstift\w*/i, /\blag\b/i, /\bmi\s?ca\b/i, /\beu\b/i, /\bsanction\w*/i, /\bskatt\w*/i, /\btax\b/i, /\bparliament\b/i, /\bregering\b/i];

    if (hasAny(text, reBTC)) return "Bitcoin";
    if (hasAny(text, reETH)) return "Ethereum";
    if (hasAny(text, reMEME)) return "Meme Tokens";
    if (hasAny(text, rePOL)) return "Politik";
    return "Allmänt";
  };

  const isTrending = (title: string, summary: string, publishedAt: string, source?: string) => {
    const now = Date.now();
    const ts = new Date(publishedAt).getTime();
    const minutes = Math.max(0, Math.floor((now - ts) / 60000));

    const t = normalize(title);
    const d = normalize(summary);
    const text = `${t} ${d}`;

    const reHot = [/breaking/i, /urgent/i, /just in/i, /flash/i, /rally/i, /plunge/i, /surge/i, /crash/i, /hack/i, /exploit/i, /etf/i, /lawsuit/i, /approved/i, /denied/i, /listing/i, /delist/i, /halving/i];

    const recencyBoost = minutes <= 90; // last 90 minutes
    const hotWords = hasAny(text, reHot);
    const trusted = /cryptopanic|coindesk|cointelegraph|reuters|bloomberg/i.test(source || "");

    return recencyBoost || (hotWords && trusted);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return t('news.justNow');
    if (diffInMinutes < 60) return `${diffInMinutes} ${t('news.minutesAgo')}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}${t('news.hoursAgo')}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}${t('news.daysAgo')}`;
    return date.toLocaleDateString('sv-SE');
  };

  const getSnippet = (text: string, maxChars = 160) => {
    if (!text) return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxChars) return clean;
    // try to end at a sentence boundary within maxChars
    const slice = clean.slice(0, maxChars);
    const lastDot = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
    const end = lastDot > 60 ? lastDot + 1 : maxChars; // avoid too-short snippets
    return slice.slice(0, end).trim() + '…';
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const projectRef = "jcllcrvomxdrhtkqpcbr";
        const url = `https://${projectRef}.supabase.co/functions/v1/news-aggregator?lang=sv&limit=50`;
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        const json = await res.json();
        const items = (json.articles ?? []) as any[];
        const mapped: NewsItem[] = items.map((a) => {
          const title = a.title || '';
          const desc = a.description || '';
          const publishedAt = a.publishedAt || new Date().toISOString();
          return {
            id: a.id || a.url,
            title,
            excerpt: desc,
            category: classifyCategory(title, desc, Array.isArray(a.tickers) ? a.tickers : []),
            publishedAt,
            time: formatTimeAgo(publishedAt),
            readTime: Math.max(1, Math.round(desc.split(' ').length / 200)),
            imageUrl: a.imageUrl || null,
            trending: isTrending(title, desc, publishedAt, a.source),
            url: a.url,
            source: a.source || ''
          } as NewsItem;
        });
        if (!active) return;
        mapped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setNews(mapped);
      } catch (e) {
        console.error('Failed to load news for home section', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 3 * 60 * 1000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const featured = useMemo(() => news.slice(0, 2), [news]);
  const trendingList = useMemo(() => news.slice(2, 8), [news]);


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Institutionellt": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "DeFi": "bg-purple-500/20 text-purple-400 border-purple-500/30", 
      "Reglering": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Adoption": "bg-green-500/20 text-green-400 border-green-500/30",
      "NFT": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Bitcoin": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Ethereum": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Meme Tokens": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Politik": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Allmänt": "bg-muted/20 text-muted-foreground border-muted/30",
    };
    return colors[category] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  return (
    <section className={`${isMobile ? 'py-8' : 'py-20'} bg-background`}>
      <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-4'}`}>
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-16'}`}>
          <h2 className={`font-orbitron ${isMobile ? 'text-xl' : 'text-4xl md:text-5xl'} font-bold ${isMobile ? 'mb-3' : 'mb-6'} tracking-wider`}>
            <span className="text-white">CRY</span><span className="text-[#12E19F]">PTO</span><span className="text-white"> NE</span><span className="text-[#12E19F]">TWO</span><span className="text-white">RK </span><span className="text-[#12E19F]">NYH</span><span className="text-white">ETE</span><span className="text-[#12E19F]">R</span>
          </h2>
          <p className={`font-display ${isMobile ? 'text-sm px-2' : 'text-xl'} text-muted-foreground max-w-3xl mx-auto`}>
            {t('news.page.description')}
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-3 gap-8'}`}>
          {/* Featured News */}
          <div className={`${isMobile ? '' : 'lg:col-span-2'}`}>
            <div className={`grid ${isMobile ? 'gap-4' : 'gap-6'}`}>
              {featured.map((article) => (
                <Card key={article.id} className="overflow-hidden border-border bg-card/80 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 group">
                  <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'}`}>
                    <div 
                      className={`${isMobile ? 'h-32' : 'h-48 md:h-auto'} bg-cover bg-center relative`}
                      style={{ backgroundImage: `url(${article.imageUrl || '/placeholder.svg'})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
                      {article.trending && (
                         <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                           {t('news.categories.trending')}
                         </Badge>
                      )}
                    </div>
                    
                    <div className={`${isMobile ? 'p-4' : 'p-6'} flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="outline" className={getCategoryColor(article.category)}>
                            {article.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground space-x-1">
                            <Clock size={12} />
                            <span>{article.time}</span>
                            <span>•</span>
                            <span>{article.readTime} {t('news.minRead')}</span>
                          </div>
                        </div>
                        
                        <h3 className={`font-display font-bold ${isMobile ? 'text-base mb-2' : 'text-lg mb-3'} group-hover:text-primary transition-colors line-clamp-2`} title={article.title}>
                          {article.title}
                        </h3>
                        <p className={`text-muted-foreground ${isMobile ? 'text-xs mb-3' : 'text-sm leading-relaxed mb-4'} line-clamp-2`}>
                          {getSnippet(article.excerpt, isMobile ? 80 : 140)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                              {t('news.readMoreLink')} <ArrowRight size={14} className="ml-1" />
                            </Button>
                          </a>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Bookmark size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Stories */}
            <Card className="p-6 border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Newspaper className="h-5 w-5 text-primary" />
                <h3 className="font-crypto font-bold text-primary">{t('news.categories.trending').toUpperCase()} {t('common.today')}</h3>
              </div>
              
              <div className="space-y-4">
                {trendingList.map((article, index) => (
                  <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer" aria-label={`${t('news.readMoreLink')}: ${article.title}`}>
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="text-primary font-crypto text-xs mt-1">
                        {index + 3}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className={`${getCategoryColor(article.category)} text-xs mb-1`}>
                          {article.category}
                        </Badge>
                        <h4 className="font-display font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2" title={article.title}>
                          {article.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground space-x-1">
                          <Clock size={10} />
                          <span>{article.time}</span>
                          <span>•</span>
                          <span>{article.readTime} min</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-6 border-border bg-gradient-primary text-primary-foreground">
              <h3 className="font-crypto font-bold text-lg mb-3">
                {t('news.dailyReport')}
              </h3>
              <p className="text-sm mb-4 opacity-90">
                {t('news.dailyReportDescription')}
              </p>
              <a 
                href="https://t.me/cryptonetworksweden" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  {t('community.joinTelegram')}
                </Button>
              </a>
            </Card>

            {/* Market Alert */}
            <Card className="p-6 border-border bg-card/80 backdrop-blur-sm">
              <h3 className="font-crypto font-bold text-primary mb-3">
                {t('market.alert')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-success/10">
                  <span className="text-sm">Bitcoin +5.2%</span>
                  <Badge className="bg-success text-success-foreground text-xs">Bullish</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-destructive/10">
                  <span className="text-sm">Altcoin Index -2.1%</span>
                  <Badge variant="destructive" className="text-xs">Bearish</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;