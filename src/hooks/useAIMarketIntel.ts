import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TAResult = {
  price: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema20: number | null;
  ema50: number | null;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  bbUpper: number | null;
  bbLower: number | null;
  trend: "Bullish" | "Bearish" | "Sideways";
};

export type TechnicalLevel = {
  price: number;
  text: string;
  type?: "breakout" | "breakdown" | "approaching";
};

export type TechnicalLevels = {
  btc: {
    currentPrice: number;
    nextSupport: TechnicalLevel;
    nextResistance: TechnicalLevel;
    criticalLevel: TechnicalLevel;
  };
  eth: {
    currentPrice: number;
    nextSupport: TechnicalLevel;
    nextResistance: TechnicalLevel;
    criticalLevel: TechnicalLevel;
  };
};

export type AIMarketAnalysis = {
  trend: "Bullish" | "Bearish" | "Neutral";
  summary: string;
  positives: string[];
  negatives: string[];
  technicalLevels?: TechnicalLevels;
  ta?: {
    btc: { d1: TAResult; d7: TAResult; m1: TAResult };
    eth: { d1: TAResult; d7: TAResult; m1: TAResult };
  };
  sentiment?: {
    fearGreed: number;
    socialMediaTrend: string;
    institutionalFlow: string;
  };
  generatedAt: string;
  sources?: string[];
};

// fetchAiAnalysis is defined below with refresh flag

export function useAIMarketIntel() {
  return useQuery<AIMarketAnalysis>({
    queryKey: ["ai-market-intel"],
    queryFn: fetchAiAnalysis,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

async function fetchAiAnalysis(): Promise<AIMarketAnalysis> {
  const { data, error } = await supabase.functions.invoke('market-intel-ai', { body: { refresh: true } });
  if (error) throw new Error(`AI analysis failed: ${error.message}`);
  return data;
}