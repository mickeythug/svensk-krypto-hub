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
      const { data, error } = await supabase.functions.invoke('pump-trade', {
        body: params,
      });
      if (error) throw error;
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
    } catch (e: any) {
      toast({ title: 'Trade misslyckades', description: String(e?.message || e), variant: 'destructive' });
      return { status: 500, result: null };
    } finally {
      setLoading(false);
    }
  };

  return { loading, trade } as const;
}
