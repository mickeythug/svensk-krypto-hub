import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Eye, BookOpen, Calendar, Tag, Share2, Bookmark, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import CryptoPriceTicker from '@/components/CryptoPriceTicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
    
    if (diffInHours < 1) return "Just nu";
    if (diffInHours < 24) return `${diffInHours}h sedan`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CryptoPriceTicker />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Navigation */}
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/nyheter')}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka till nyheter
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span>{article.category}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{article.title.substring(0, 50)}...</span>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge className={`${getSentimentBadge(article.sentiment)} text-sm px-3 py-1`}>
                {article.sentiment === 'positive' ? '📈 Positiv' : 
                 article.sentiment === 'negative' ? '📉 Negativ' : '➡️ Neutral'}
              </Badge>
              <Badge className={`${getImpactBadge(article.impact)} text-sm px-3 py-1`}>
                {article.impact === 'high' ? '🔥 Hög påverkan' : 
                 article.impact === 'medium' ? '⚡ Medium påverkan' : '💭 Låg påverkan'}
              </Badge>
              {article.trending && (
                <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-sm px-3 py-1">
                  🔥 Trending
                </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                {article.category}
              </Badge>
            </div>

            <h1 className="font-crypto text-4xl font-bold text-primary mb-6 leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {article.summary}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
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
                <span>{article.readTime} min läsning</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{article.views.toLocaleString()} visningar</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Dela
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Spara
              </Button>
            </div>

            <Separator />
          </div>

          {/* Article Content */}
          <Card className="p-8 mb-8">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Card>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Taggar</h3>
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
            Källa: {article.source}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticleDetailPage;