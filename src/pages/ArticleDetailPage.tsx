import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ArrowLeft, Clock, User, Eye, BookOpen, Calendar, Tag, Share2, Bookmark, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import MobileBottomNavigation from '@/components/mobile/MobileBottomNavigation';
import MobileHeader from '@/components/mobile/MobileHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  publishedAt: string;
  author: string;
  readTime: number;
  views: number;
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  trending: boolean;
  source: string;
}

const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  // Mock article data - in real app this would come from API
  const article: Article = {
    id: id || '1',
    title: "Bitcoin når nya rekordnivåer över $116,000 - Institutionella investerare driver prisökningen",
    content: `
      <h2>Bitcoin når historiska höjder</h2>
      
      <p>I en historisk utveckling har Bitcoin brutit genom $116,000-barriären för första gången, vilket markerar en milstolpe som få analytiker förväntade sig så tidigt i året. Kryptovalutans meteoritiska resa fortsätter att överraska både investerare och skeptiker.</p>

      <h3>Institutionella inflöden driver trenden</h3>
      
      <p>Den primära drivkraften bakom denna prisexplosion kommer från en aldrig tidigare skådad våg av institutionella investeringar. ETF-inflöden har nått rekordnivåer med över 2,5 miljarder dollar i nettoflöden under den senaste veckan.</p>

      <blockquote>"Vi ser en fundamental förändring i hur institutioner ser på Bitcoin. Det är inte längre en spekulativ tillgång utan en etablerad del av portföljstrategin," säger Michael Saylor, MicroStrategy's VD.</blockquote>

      <h3>Teknisk analys visar fortsatt uppgång</h3>
      
      <p>Tekniska indikatorer pekar på fortsatt styrka i Bitcoins prisrörelse. RSI-nivåerna visar fortfarande utrymme för ytterligare uppgång, medan handelsvolymerna förblir höga - en indikation på stark marknadskonviction.</p>

      <ul>
        <li>24-timmars handelsvolym: $45,8 miljarder</li>
        <li>Marknadsdominans: 58,3%</li>
        <li>Fear & Greed Index: 76 (Extrem girighet)</li>
      </ul>

      <h3>Vad händer härnäst?</h3>
      
      <p>Analytiker är delade om Bitcoins nästa steg. Optimister pekar på $150,000 som nästa stora motstånd, medan försiktiga röster varnar för en potentiell korrigering efter denna snabba uppgång.</p>

      <p>Oavsett kortsiktiga fluktuationer verkar den långsiktiga trenden för Bitcoin förbli stark, driven av ökande adoption och institutionell acceptans.</p>
    `,
    summary: "Bitcoin når nya all-time highs över $116,000 efter rekordinflöden från institutionella investerare via ETF:er.",
    category: "Bitcoin",
    publishedAt: "2024-01-08T10:30:00Z",
    author: "Marcus Andersson",
    readTime: 5,
    views: 15420,
    tags: ["Bitcoin", "ETF", "Institutionella investerare", "Prisanalys"],
    sentiment: "positive",
    impact: "high",
    trending: true,
    source: "CryptoNews Sverige"
  };

  // SEO and meta setup
  useEffect(() => {
    document.title = `${article.title} | Velo`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', article.summary);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://velo.se/artikel/${id}`);
    }

    // Add article structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.summary,
      "author": {
        "@type": "Person",
        "name": article.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Velo",
        "logo": "https://velo.se/lovable-uploads/5412c453-68a5-4997-a15b-d265d679d956.png"
      },
      "datePublished": article.publishedAt,
      "articleSection": article.category,
      "keywords": article.tags.join(", ")
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [article, id]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success/20 text-success border-success/30';
      case 'negative': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-warning/20 text-warning border-warning/30';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('news.justNow');
    if (diffInHours < 24) return `${diffInHours}${t('news.hoursAgo')}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}${t('news.daysAgo')}`;
    return date.toLocaleDateString('sv-SE');
  };

  // Sanitize content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(article.content, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'blockquote', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }, [article.content]);

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileHeader title="Artikel" /> : <Header />}
      {/* Removed duplicate ticker - main header already includes CryptoPriceTicker */}
      
      <main className={`${isMobile ? 'pt-4 pb-20' : 'pt-8 pb-16'}`}>
        <div className={`container mx-auto ${isMobile ? 'px-3 max-w-full' : 'px-4 max-w-4xl'}`}>
          {/* Navigation */}
          <div className={`${isMobile ? 'mb-4' : 'mb-8'} flex items-center gap-2 text-sm text-muted-foreground`}>
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"}
              onClick={() => navigate('/nyheter')}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isMobile ? t('news.back') : t('news.backToNews')}
            </Button>
            {!isMobile && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>{article.category}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{article.title.substring(0, 50)}...</span>
              </>
            )}
          </div>

          {/* Article Header */}
          <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
            <div className={`flex items-center gap-2 flex-wrap ${isMobile ? 'mb-3' : 'mb-4'}`}>
               <Badge className={`${getSentimentBadge(article.sentiment)} text-sm px-3 py-1`}>
                 {article.sentiment === 'positive' ? t('news.positiveLabel') : 
                  article.sentiment === 'negative' ? t('news.negativeLabel') : t('news.neutralLabel')}
               </Badge>
               <Badge className={`${getImpactBadge(article.impact)} text-sm px-3 py-1`}>
                 {article.impact === 'high' ? t('news.highImpact') : 
                  article.impact === 'medium' ? t('news.mediumImpact') : t('news.lowImpact')}
               </Badge>
              {article.trending && (
                 <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-sm px-3 py-1">
                   {t('news.trending')}
                 </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                {article.category}
              </Badge>
            </div>

            <h1 className={`font-crypto ${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-primary ${isMobile ? 'mb-3' : 'mb-6'} leading-tight`}>
              {article.title}
            </h1>

            <p className={`${isMobile ? 'text-base' : 'text-xl'} text-muted-foreground ${isMobile ? 'mb-4' : 'mb-6'} leading-relaxed`}>
              {article.summary}
            </p>

            {/* Article Meta */}
            <div className={`flex flex-wrap items-center ${isMobile ? 'gap-3' : 'gap-6'} text-sm text-muted-foreground ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">{article.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{article.readTime} {t('news.readingTime')}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{article.views.toLocaleString()} {t('news.views')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-8'}`}>
              <Button variant="outline" size="sm" className={isMobile ? 'flex-1' : ''}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('news.share')}
              </Button>
              <Button variant="outline" size="sm" className={isMobile ? 'flex-1' : ''}>
                <Bookmark className="h-4 w-4 mr-2" />
                {t('news.save')}
              </Button>
            </div>

            <Separator />
          </div>

          {/* Article Content */}
          <Card className={`${isMobile ? 'p-4 mb-6' : 'p-8 mb-8'}`}>
            <div 
              className={`prose ${isMobile ? 'prose-sm' : 'prose-lg'} max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground`}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </Card>

          {/* Tags */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h3 className={`font-semibold ${isMobile ? 'text-base mb-3' : 'text-lg mb-4'}`}>{t('news.tags')}</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm hover:bg-primary/20 transition-colors cursor-pointer">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Source */}
          <div className="text-sm text-muted-foreground">
            {t('news.sourceLabel')}: {article.source}
          </div>
        </div>
      </main>
      
      {isMobile && <MobileBottomNavigation />}
    </div>
  );
};

export default ArticleDetailPage;