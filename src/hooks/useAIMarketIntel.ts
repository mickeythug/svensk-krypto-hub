import { useQuery } from "@tanstack/react-query";

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

export type AIMarketAnalysis = {
  trend: "Bullish" | "Bearish" | "Neutral";
  summary: string;
  positives: string[];
  negatives: string[];
  ta?: {
    btc: { d1: TAResult; h4: TAResult; h1: TAResult };
    eth: { d1: TAResult; h4: TAResult; h1: TAResult };
  };
  generatedAt: string;
  sources?: string[];
};

const PROJECT_REF = "jcllcrvomxdrhtkqpcbr"; // Supabase project ref used elsewhere in app

async function fetchAiAnalysis(): Promise<AIMarketAnalysis> {
  const url = `https://${PROJECT_REF}.supabase.co/functions/v1/market-intel-ai`;
  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`AI analysis failed: ${res.status}`);
  return res.json();
}

export function useAIMarketIntel() {
  return useQuery<AIMarketAnalysis>({
    queryKey: ["ai-market-intel"],
    queryFn: fetchAiAnalysis,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
