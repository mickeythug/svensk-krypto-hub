// Supabase Edge Function: meme-catalog
// Enhanced catalog using direct DexScreener API endpoints for hot tokens
// Returns normalized MemeToken[] compatible with frontend and supports up to 50 items per page.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MemeToken {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  views: string;
  emoji?: string;
  tags: string[];
  isHot: boolean;
  description?: string;
  trendingScore?: number;
}

type Category =
  | 'trending'
  | 'gainers'
  | 'marketcap_high'
  | 'marketcap_low'
  | 'liquidity_high'
  | 'liquidity_low'
  | 'txns'
  | 'volume'
  | 'newest'
  | 'boosted';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

function getAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );
}

// Direct DexScreener API fetch with proper endpoints
async function fetchDexScreenerTokens(sort: string, order: 'asc' | 'desc' = 'desc', limit = 50) {
  try {
    let url: string;
    
    // Use correct DexScreener API endpoints based on documentation
    switch (sort) {
      case 'trendingScore':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=trendingScore&limit=${limit}`;
        break;
      case 'priceChange':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=priceChange&limit=${limit}`;
        break;
      case 'priceChange5m':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=priceChange5m&limit=${limit}`;
        break;
      case 'priceChange1h':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=priceChange1h&limit=${limit}`;
        break;
      case 'priceChange6h':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=priceChange6h&limit=${limit}`;
        break;
      case 'volume':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=volume&limit=${limit}`;
        break;
      case 'marketCap':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=${order}&sort=marketCap&limit=${limit}`;
        break;
      case 'liquidity':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=${order}&sort=liquidity&limit=${limit}`;
        break;
      case 'createdAt':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=createdAt&limit=${limit}`;
        break;
      case 'txns':
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=txns&limit=${limit}`;
        break;
      case 'boosted':
        url = `https://api.dexscreener.com/token-boosts/latest/v1/solana`;
        break;
      default:
        // Default to trending
        url = `https://api.dexscreener.com/token-profiles/latest/v1/latest?chainIds=solana&order=desc&sort=trendingScore&limit=${limit}`;
    }

    console.log(`[meme-catalog] Fetching from DexScreener: ${url.substring(0, 100)}...`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoNetworkSweden/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`DexScreener HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[meme-catalog] DexScreener response:`, { 
      type: Array.isArray(data) ? 'array' : typeof data,
      count: Array.isArray(data) ? data.length : 'unknown'
    });
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`[meme-catalog] DexScreener API error:`, error);
    return [];
  }
}

// Transform DexScreener data to MemeToken format
function transformToMemeToken(profile: any, index: number, category: string): MemeToken | null {
  try {
    const tokenAddress = profile.tokenAddress || profile.address || profile.baseToken?.address;
    if (!tokenAddress) return null;

    return {
      id: tokenAddress,
      symbol: (profile.symbol || profile.baseToken?.symbol || 'TOKEN').toString().slice(0, 12).toUpperCase(),
      name: profile.name || profile.baseToken?.name || profile.symbol || 'Token',
      image: profile.imageUrl || profile.logoUrl || profile.logo || profile.baseToken?.logo || '/placeholder.svg',
      description: profile.description || '',
      price: parseFloat(profile.price || profile.priceUsd || '0'),
      change24h: parseFloat(profile.priceChange24h || profile.change24h || profile.priceChange?.h24 || '0'),
      volume24h: parseFloat(profile.volume24h || profile.volume?.h24 || '0'),
      marketCap: parseFloat(profile.marketCap || profile.fdv || '0'),
      holders: parseInt(profile.holders || '0'),
      views: profile.views?.toString() || '—',
      tags: [category],
      isHot: category === 'trending' && index < 15,
      trendingScore: parseFloat(profile.trendingScore || '0')
    };
  } catch (error) {
    console.error(`[meme-catalog] Error transforming token:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json().catch(() => ({}));
    const category = String(payload.category ?? 'trending') as Category;
    const page = Math.max(1, Number(payload.page ?? 1));
    const rawSize = Number(payload.pageSize ?? 50);
    const pageSize = Math.min(50, Math.max(1, isNaN(rawSize) ? 50 : rawSize));

    console.log(`[meme-catalog] Request: category=${category}, page=${page}, pageSize=${pageSize}`);

    // Determine DexScreener API parameters based on category
    let apiSort = 'trendingScore';
    let apiOrder: 'asc' | 'desc' = 'desc';
    
    switch (category) {
      case 'trending':
        apiSort = 'trendingScore';
        break;
      case 'gainers':
        apiSort = 'priceChange';
        break;
      case 'volume':
        apiSort = 'volume';
        break;
      case 'marketcap_high':
        apiSort = 'marketCap';
        apiOrder = 'desc';
        break;
      case 'marketcap_low':
        apiSort = 'marketCap';
        apiOrder = 'asc';
        break;
      case 'liquidity_high':
        apiSort = 'liquidity';
        apiOrder = 'desc';
        break;
      case 'liquidity_low':
        apiSort = 'liquidity';
        apiOrder = 'asc';
        break;
      case 'newest':
        apiSort = 'createdAt';
        break;
      case 'txns':
        apiSort = 'txns';
        break;
      case 'boosted':
        apiSort = 'boosted';
        break;
      default:
        apiSort = 'trendingScore';
    }

    console.log(`[meme-catalog] Using API sort=${apiSort}, order=${apiOrder}`);
    
    // Fetch data from DexScreener API
    const profiles = await fetchDexScreenerTokens(apiSort, apiOrder, 200);
    
    if (!profiles.length) {
      console.log(`[meme-catalog] No profiles returned from DexScreener`);
      return json({ items: [], page, pageSize, total: 0 });
    }

    console.log(`[meme-catalog] Received ${profiles.length} profiles from DexScreener`);

    // Transform and paginate
    const allTokens: MemeToken[] = [];
    
    for (let i = 0; i < profiles.length; i++) {
      const token = transformToMemeToken(profiles[i], i, category);
      if (token) {
        allTokens.push(token);
      }
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTokens = allTokens.slice(startIndex, endIndex);

    console.log(`[meme-catalog] Processed ${allTokens.length} tokens, returning ${paginatedTokens.length} for page ${page}`);

    return json({
      items: paginatedTokens,
      page,
      pageSize,
      total: allTokens.length
    });

  } catch (error) {
    console.error('[meme-catalog] Error:', error);
    // Return soft error to avoid breaking frontend
    return json({ 
      items: [], 
      page: 1, 
      pageSize: 50, 
      total: 0, 
      error: error?.message || 'Unknown error' 
    }, 200);
  }
});