import React, { createContext, useContext, ReactNode } from 'react';

export type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple English-only translations for backward compatibility
const englishTranslations: Record<string, string> = {
  // Site metadata
  'site.title': 'Velo - Your Crypto Community | Bitcoin, Ethereum & DeFi',
  'site.description': 'Leading crypto community. Learn about cryptocurrencies, follow the market in real-time and meet new friends with the same passion for Web3. Join today!',
  
  // Navigation
  'nav.home': 'Home',
  'nav.market': 'Market',
  'nav.portfolio': 'Portfolio',
  'nav.trading': 'Trading',
  'nav.memeZone': 'Meme Zone',
  'nav.createToken': 'Create Token',
  'nav.tools': 'Tools',
  'nav.news': 'News',
  'nav.community': 'Community',
  'nav.wallet': 'Wallet',
  'nav.mainPages': 'Main Pages',
  
  // Descriptions
  'desc.home': 'Homepage',
  'desc.market': 'Market overview',
  'desc.portfolio': 'My portfolio & watchlist',
  'desc.trading': 'Trading & analysis',
  'desc.memeZone': 'Meme coins & tokens',
  'desc.createToken': 'Create your own token',
  'desc.tools': 'Crypto tools',
  'desc.news': 'Latest news',
  'desc.community': 'Community & forum',
  
  // Common
  'common.loading': 'Loading...',
  'common.of': 'of',
  'common.and': 'and',
  'common.for': 'for',
  'common.last24h': 'last 24h',
  'common.premium': 'Premium',
  'common.today': 'today',
  'common.members': 'Active Members',
  'common.resources': 'Educational Resources',
  'common.cryptocurrencies': 'Different cryptocurrencies',
  
  // Social Media
  'social.title': 'FOLLOW US EVERYWHERE',
  'social.subtitle': 'We aim to become the largest crypto community in Sweden! Join our social channels where we help each other find opportunities together.',
  'social.communityGoal': 'A community with one goal - to grow and learn within crypto.',
  'social.telegramCall': 'Always reach out on Telegram for questions, learning and free crypto information. We help each other!',
  'social.telegram.description': 'Ask questions, learn, get free crypto information and help. We help each other find opportunities together!',
  'social.tiktok.description': 'Follow our latest crypto tips, analysis and educational content',
  'social.twitter.description': 'Stay updated with the latest news and market analysis',
  'social.followUs': 'Follow us',
  
  // Footer
  'footer.followUs': 'FOLLOW US ON SOCIAL MEDIA',
  'footer.copyright': '© 2024 Velo. All rights reserved.',
  'footer.privacyPolicy': 'Privacy Policy',
  'footer.termsOfService': 'Terms of Service',
  'footer.cookies': 'Cookies',
  'footer.riskWarning': 'Risk Warning:',
  'footer.riskDescription': 'Trading cryptocurrencies involves high risks. Investments can both increase and decrease in value. Never invest more than you can afford to lose. Velo provides only educational content and is not financial advice.',
  
  // Community
  'community.features.telegram.title': 'Telegram Chat',
  'community.features.telegram.description': 'Active daily discussions about crypto',
  'community.features.telegram.count': '5000+ members',
  'community.features.voiceChat.title': 'Voice Chat',
  'community.features.voiceChat.description': 'Weekly voice discussions',
  'community.features.voiceChat.count': 'Every Sunday',
  'community.features.memeScan.title': 'Meme Scanner',
  'community.features.memeScan.description': 'Find the next big meme coin',
  'community.features.memeScan.count': 'Live tracking',
  
  // News
  'news.title': 'CRYPTO NEWS',
  'news.subtitle': 'Stay updated with the latest news from the crypto world',
  'news.trending': 'Trending',
  'news.latest': 'Latest',
  'news.readMore': 'Read More',
  'news.loading': 'Loading news...',
  'news.error': 'Could not load news',
  'news.tryAgain': 'Try again',
  'news.source': 'Source',
  'news.published': 'PUBLISHED',
  'news.readTime': 'min read',
  'news.viewAll': 'View all news',
  
  // Market
  'market.title': 'Market Overview',
  'market.description': 'Real-time overview of the crypto market',
  'market.topCryptocurrencies': 'Top Cryptocurrencies',
  'market.marketAnalysis': 'Market Analysis',
  'market.aiMarketAnalysis': 'AI MARKET ANALYSIS',
  'market.loadingAI': 'Loading AI analysis…',
  'market.liveCryptoData': 'Live crypto data and market analysis',
  'market.currentPrice': 'Current price',
  'market.nextSupport': 'Next support',
  'market.nextResistance': 'Next resistance',
  'market.positiveSignalsAI': 'Positive Signals (AI)',
  'market.noPositiveSignals': 'No strong positive signals right now.',
  'market.toWatchAI': 'To Watch (AI)',
  'market.noRiskFactors': 'No major risk factors identified.',
  'market.technicalLevelsAI': 'Technical Levels (AI-Research with Real-time Data)',
  'market.realtimeAI': 'Real-time AI',
  'market.technicalAnalysisAI': 'Technical Analysis (AI-verified with web search)',
  'market.aiVerified': 'AI-verified',
  'market.detailedAIResearch': 'Detailed AI research',
  'market.lastUpdate': 'Last update',
  'market.sources': 'Sources',
  'market.sentimentAnalysis': 'Sentiment Analysis',
  'market.socialMedia': 'Social Media',
  'market.institutionalFlow': 'Institutional Flow',
  'market.technicalAnalysis': 'Technical Analysis',
  
  // Trading
  'trading.buy': 'Buy',
  'trading.sell': 'Sell',
  'trading.amount': 'Amount',
  'trading.price': 'Price',
  'trading.total': 'Total',
  'trading.market': 'Market',
  'trading.limit': 'Limit',
  'trading.connectWallet': 'Connect wallet to trade',
  'trading.connectWalletToTrade': 'Connect your wallet to start trading',
  
  // Default fallback for any missing keys
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const setLanguage = (lang: Language) => {
    // Only English is supported now
  };

  const t = (key: string): string => {
    return englishTranslations[key] || key;
  };

  const value = {
    language: 'en' as Language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};