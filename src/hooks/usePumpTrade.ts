import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PumpTradeParams = {
  action: 'buy' | 'sell';
  mint: string;
  amount: number | string;
  denominatedInSol: 'true' | 'false';
  slippage: number;
  priorityFee: number;
  pool?: 'pump' | 'raydium' | 'pump-amm' | 'launchlab' | 'raydium-cpmm' | 'bonk' | 'auto';
  skipPreflight?: 'true' | 'false';
  jitoOnly?: 'true' | 'false';
};

export function usePumpTrade() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const trade = async (params: PumpTradeParams) => {
    setLoading(true);
    try {
      // Prefer secure edge function (uses encrypted API key when user is authenticated)
      const { data, error } = await supabase.functions.invoke('pump-trade', {
        body: params,
      });
      if (!error && data) {
        const status = (data as any)?.status;
        const result = (data as any)?.result;
        if (status === 200 && result?.signature) {
          toast({ title: 'Trade skickad', description: `Tx: ${result.signature.slice(0, 8)}...` });
        } else if (result?.txSig) {
          toast({ title: 'Trade skickad', description: `Tx: ${String(result.txSig).slice(0, 8)}...` });
        } else {
          toast({ title: 'Svar mottaget', description: JSON.stringify(result).slice(0, 140) });
        }
        return { status, result };
      }
      throw error || new Error('Edge function failed');
    } catch (_) {
      // Fallback: direct PumpPortal call using locally stored API key
      try {
        const apiKey = localStorage.getItem('pump_api_key');
        if (!apiKey) throw new Error('Ingen API‑nyckel tillgänglig. Skapa plånbok först.');
        const res = await fetch(`https://pumpportal.fun/api/trade?api-key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const json = await res.json().catch(async () => ({ raw: await res.text() }));
        if (res.ok) {
          const sig = json?.signature || json?.txSig || '';
          toast({ title: 'Trade skickad', description: sig ? `Tx: ${String(sig).slice(0, 8)}...` : 'Order skickad' });
        } else {
          toast({ title: 'Trade misslyckades', description: JSON.stringify(json).slice(0, 160), variant: 'destructive' });
        }
        return { status: res.status, result: json };
      } catch (e: any) {
        toast({ title: 'Trade misslyckades', description: String(e?.message || e), variant: 'destructive' });
        return { status: 500, result: null };
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, trade } as const;
}
