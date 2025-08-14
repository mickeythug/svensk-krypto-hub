import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'sv' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  sv: {
    // Header & Navigation
    'nav.home': 'Hem',
    'nav.market': 'Marknad',
    'nav.portfolio': 'Portfolio',
    'nav.trading': 'Handel',
    'nav.memeZone': 'Meme Zone',
    'nav.createToken': 'Skapa Token',
    'nav.tools': 'Verktyg',
    'nav.news': 'Nyheter',
    'nav.community': 'Community',
    'nav.wallet': 'Plånbok',
    
    // Descriptions
    'desc.home': 'Startsida',
    'desc.market': 'Marknadsöversikt',
    'desc.portfolio': 'Min portfolio & watchlist',
    'desc.trading': 'Trading & analys',
    'desc.memeZone': 'Meme coins & tokens',
    'desc.createToken': 'Skapa din egen token',
    'desc.tools': 'Krypto verktyg',
    'desc.news': 'Senaste nyheterna',
    'desc.community': 'Community & forum',
    
    // Meme Hero
    'meme.hero.title': 'HETASTE TOKENS',
    'meme.hero.subtitle': 'De 20 mest explosiva meme tokens just nu – Live data från marknaden',
    'meme.hero.liveUpdates': 'LIVE UPPDATERINGAR',
    'meme.hero.loading': 'Laddar hetaste tokens...',
    'meme.hero.tryAgain': 'Försök igen',
    'meme.hero.exploreAll': 'UTFORSKA ALLA TOKENS',
    'meme.hero.updates': 'Uppdateras varje minut',
    'meme.hero.hottestTokens': 'hetaste tokens',
    'meme.hero.explosive': 'EXPLOSIV',
    'meme.hero.hot': 'HET',
    'meme.hero.trending': 'TRENDING',
    'meme.hero.tradeNow': 'HANDLA NU',
    'meme.hero.price': 'PRIS',
    'meme.hero.mcap': 'MCAP',
    
    // Common
    'common.loading': 'Laddar...',
    'common.error': 'Fel uppstod',
    'common.retry': 'Försök igen',
    'common.close': 'Stäng',
    'common.open': 'Öppna',
    'common.save': 'Spara',
    'common.cancel': 'Avbryt',
    'common.confirm': 'Bekräfta',
    'common.search': 'Sök',
    'common.filter': 'Filtrera',
    'common.sort': 'Sortera',
    'common.connect': 'Anslut',
    'common.connected': 'Ansluten',
    'common.disconnect': 'Koppla från'
  },
  en: {
    // Header & Navigation
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
    
    // Meme Hero
    'meme.hero.title': 'HOTTEST TOKENS',
    'meme.hero.subtitle': 'The 20 most explosive meme tokens right now – Live market data',
    'meme.hero.liveUpdates': 'LIVE UPDATES',
    'meme.hero.loading': 'Loading hottest tokens...',
    'meme.hero.tryAgain': 'Try Again',
    'meme.hero.exploreAll': 'EXPLORE ALL TOKENS',
    'meme.hero.updates': 'Updates every minute',
    'meme.hero.hottestTokens': 'hottest tokens',
    'meme.hero.explosive': 'EXPLOSIVE',
    'meme.hero.hot': 'HOT',
    'meme.hero.trending': 'TRENDING',
    'meme.hero.tradeNow': 'TRADE NOW',
    'meme.hero.price': 'PRICE',
    'meme.hero.mcap': 'MCAP',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error occurred',
    'common.retry': 'Try again',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.connect': 'Connect',
    'common.connected': 'Connected',
    'common.disconnect': 'Disconnect'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'sv';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value = {
    language,
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