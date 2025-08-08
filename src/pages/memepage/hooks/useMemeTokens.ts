import { useState, useEffect } from 'react';

export interface MemeToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  views: string;
  emoji: string;
  tags: string[];
  isHot: boolean;
  description: string;
}

// Mock data för demonstration
const generateMockTokens = (category: string): MemeToken[] => {
  const baseTokens: Partial<MemeToken>[] = [
    {
      symbol: 'PEPE',
      name: 'Pepe',
      emoji: '🐸',
      tags: ['Meme', 'Community', 'Viral'],
      description: 'The most memeable memecoin in existence'
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      emoji: '🐕',
      tags: ['OG', 'Elon', 'Classic'],
      description: 'The original meme coin'
    },
    {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      emoji: '🐶',
      tags: ['DeFi', 'NFT', 'Ecosystem'],
      description: 'The Dogecoin killer'
    },
    {
      symbol: 'FLOKI',
      name: 'Floki',
      emoji: '🐕‍🦺',
      tags: ['Gaming', 'Metaverse', 'Utility'],
      description: 'Named after Elon Musks dog'
    },
    {
      symbol: 'BABYDOGE',
      name: 'Baby Doge Coin',
      emoji: '🐕‍🦺',
      tags: ['Charity', 'Community', 'Deflationary'],
      description: 'Son of Doge'
    },
    {
      symbol: 'WOJAK',
      name: 'Wojak',
      emoji: '😭',
      tags: ['Feels', 'Meme', 'Culture'],
      description: 'Feel good meme coin'
    },
    {
      symbol: 'PEPECOIN',
      name: 'Pepecoin',
      emoji: '🐸',
      tags: ['Alternative', 'Meme', 'New'],
      description: 'Another Pepe variant'
    },
    {
      symbol: 'MONKE',
      name: 'MonkeyBucks',
      emoji: '🐵',
      tags: ['Ape', 'Gaming', 'Fun'],
      description: 'Ape together strong'
    },
    {
      symbol: 'MOON',
      name: 'MoonCoin',
      emoji: '🌙',
      tags: ['Space', 'To the moon', 'Rocket'],
      description: 'Going to the moon'
    },
    {
      symbol: 'DIAMOND',
      name: 'DiamondHands',
      emoji: '💎',
      tags: ['Diamond hands', 'HODL', 'Strong'],
      description: 'Diamond hands only'
    },
    {
      symbol: 'ROCKET',
      name: 'RocketDoge',
      emoji: '🚀',
      tags: ['Space', 'Fast', 'Moon'],
      description: 'Fastest rocket to the moon'
    },
    {
      symbol: 'FIRE',
      name: 'FireToken',
      emoji: '🔥',
      tags: ['Burn', 'Deflationary', 'Hot'],
      description: 'Burning supply daily'
    }
  ];

  return baseTokens.map((token, index) => {
    const isUnder1M = category === 'under1m';
    const isTrending = category === 'trending';
    
    return {
      id: `${token.symbol}-${index}`,
      symbol: token.symbol!,
      name: token.name!,
      emoji: token.emoji!,
      tags: token.tags!,
      description: token.description!,
      image: `/api/placeholder/64/64`, // Placeholder for token images
      price: isUnder1M 
        ? Math.random() * 0.001
        : Math.random() * 10,
      change24h: (Math.random() - 0.3) * 200, // Volatile changes
      volume24h: Math.random() * 50000000,
      marketCap: isUnder1M 
        ? Math.random() * 1000000
        : Math.random() * 1000000000,
      holders: Math.floor(Math.random() * 100000) + 1000,
      views: `${Math.floor(Math.random() * 500) + 100}K`,
      isHot: isTrending && index < 5 || Math.random() > 0.7
    };
  }).sort((a, b) => {
    if (category === 'trending') return b.change24h - a.change24h;
    if (category === 'under1m') return a.marketCap - b.marketCap;
    return b.marketCap - a.marketCap;
  });
};

export const useMemeTokens = (category: 'trending' | 'under1m' | 'all', limit?: number) => {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTokens = generateMockTokens(category);
        const limitedTokens = limit ? mockTokens.slice(0, limit) : mockTokens;
        
        setTokens(limitedTokens);
      } catch (err) {
        setError('Failed to fetch meme tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [category, limit]);

  return { tokens, loading, error };
};