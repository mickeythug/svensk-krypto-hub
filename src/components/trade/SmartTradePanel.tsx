import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction } from '@solana/web3.js';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useSplTokenBalance } from '@/hooks/useSplTokenBalance';
import { SOL_MINT, SOL_TOKENS, USDT_BY_CHAIN, NATIVE_TOKEN_PSEUDO } from '@/lib/tokenMaps';
import { supabase } from '@/integrations/supabase/client';
import { useAccount, useChainId } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, base, optimism } from 'viem/chains';
import { parseUnits } from 'viem';

const CHAIN_BY_ID: Record<number, any> = { 1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 8453: base, 10: optimism };

export default function SmartTradePanel({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  const [side, setSide] = useState<'buy'|'sell'>('buy');
  const [orderType, setOrderType] = useState<'market'|'limit'>('market');
  const [amountInput, setAmountInput] = useState('');
  const [slippage, setSlippage] = useState(50); // bps
  const defaultChainMode = symbol.toUpperCase() === 'BONK' ? 'SOL' : 'EVM';
  const [chainMode, setChainMode] = useState<'SOL'|'EVM'>(defaultChainMode as any);

  // Solana
  const { publicKey, signAndSendTransaction } = useWallet();
  const solAddress = publicKey?.toBase58();
  const { balance: solBalance } = useSolBalance();
  const solTokenInfo = SOL_TOKENS[symbol.toUpperCase()];
  const { amount: tokenBal } = useSplTokenBalance(solTokenInfo?.mint || SOL_MINT);

  // EVM
  const { address: evmAddress } = useAccount();
  const chainId = useChainId();
  const evmChainId = chainId || 1;

  const available = useMemo(() => {
    if (chainMode === 'SOL') {
      return side === 'buy' ? (solBalance || 0) : (tokenBal || 0);
    }
    // For EVM, assume USDT balance for buy and token balance for sell (not implemented token-specific here)
    return 0; // Placeholder; expanded in next iteration
  }, [chainMode, side, solBalance, tokenBal]);

  const setPercent = (pct: number) => {
    const amt = available * pct;
    setAmountInput(amt.toString());
  };

  async function executeSolanaMarket() {
    try {
      if (!solAddress || !signAndSendTransaction) throw new Error('Solana wallet saknas');
      const inputMint = side === 'buy' ? SOL_MINT : (solTokenInfo?.mint || SOL_MINT);
      const outputMint = side === 'buy' ? (solTokenInfo?.mint || SOL_MINT) : SOL_MINT;
      if (!inputMint || !outputMint) throw new Error('Okänd token');

      const decimals = side === 'buy' ? 9 : (solTokenInfo?.decimals || 9);
      const amountBase = Math.floor(parseFloat(amountInput) * Math.pow(10, decimals));
      if (!Number.isFinite(amountBase) || amountBase <= 0) throw new Error('Ogiltigt belopp');

      const { data, error } = await supabase.functions.invoke('jupiter-swap', {
        body: { userPublicKey: solAddress, inputMint, outputMint, amount: String(amountBase), slippageBps: slippage },
      });
      if (error) throw error;
      const swapTxB64 = (data as any)?.swapTransaction as string;
      if (!swapTxB64) throw new Error('Saknar swapTransaction');

      const txBytes = Uint8Array.from(atob(swapTxB64), (c) => c.charCodeAt(0));
      const tx = Transaction.from(txBytes);
      const conn = new Connection('https://api.mainnet-beta.solana.com');
      const sig = await signAndSendTransaction(tx, { minContextSlot: 0 });
      toast({ title: 'Order skickad', description: `Tx: ${JSON.stringify(sig)}` });
      setAmountInput('');
    } catch (e: any) {
      toast({ title: 'Solana fel', description: String(e.message || e), variant: 'destructive' });
    }
  }

  async function executeEvmMarket() {
    try {
      if (!evmAddress) throw new Error('EVM wallet saknas');
      const usdt = USDT_BY_CHAIN[evmChainId];
      if (!usdt) throw new Error('USDT saknas för vald kedja');
      // Buy ETH with USDT as baseline
      const toToken = NATIVE_TOKEN_PSEUDO[evmChainId];
      const fromToken = usdt;
      const amountWei = parseUnits(amountInput || '0', 6); // USDT 6 decimals
      if (amountWei <= 0n) throw new Error('Ogiltigt belopp');

      const { data, error } = await supabase.functions.invoke('evm-swap', {
        body: { chainId: evmChainId, fromToken, toToken, amount: amountWei.toString(), fromAddress: evmAddress, slippage: slippage / 100 },
      });
      if (error) throw error;

      // Return tx data for user wallet to send
      // In a full implementation we would use wagmi to sendTransaction with data.tx.to / data.tx.data / value
      toast({ title: '1inch order skapad', description: 'Tx-data mottagen. Sänds via wallet i nästa steg.' });
    } catch (e: any) {
      toast({ title: 'EVM fel', description: String(e.message || e), variant: 'destructive' });
    }
  }

  const onSubmit = async () => {
    if (orderType !== 'market') {
      toast({ title: 'Limit-order', description: 'Limit-orders aktiveras i nästa steg.', variant: 'destructive' });
      return;
    }
    if (chainMode === 'SOL') return executeSolanaMarket();
    return executeEvmMarket();
  };

  return (
    <div className="h-full bg-card/60 backdrop-blur-sm border-border/30 shadow-lg">
      <div className="p-3 border-b border-border/30 bg-background/40">
        <div className="flex gap-1">
          <Button variant={side === 'buy' ? 'default' : 'outline'} size="sm" onClick={() => setSide('buy')} className={`flex-1 ${side==='buy'?'bg-success text-white':''}`}>Buy</Button>
          <Button variant={side === 'sell' ? 'default' : 'outline'} size="sm" onClick={() => setSide('sell')} className={`flex-1 ${side==='sell'?'bg-destructive text-white':''}`}>Sell</Button>
        </div>
      </div>
      <div className="p-4 space-y-4 bg-background/20">
        <Tabs value={orderType} onValueChange={(v)=>setOrderType(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block font-semibold">Belopp ({chainMode==='SOL' ? (side==='buy'?'SOL':symbol) : 'USDT'})</label>
          <Input type="number" value={amountInput} onChange={(e)=>setAmountInput(e.target.value)} placeholder="0.0" className="h-10 text-sm font-mono" />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[0.25,0.5,0.75,1].map(p => (
            <Button key={p} variant="outline" size="sm" className="h-6 text-xs" onClick={()=>setPercent(p)}>{Math.round(p*100)}%</Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between"><span>Tillgängligt:</span><span className="font-mono">{available?.toFixed(6)}</span></div>
          <div className="flex justify-between"><span>Ordervärde:</span><span className="font-mono">{amountInput ? `$${(parseFloat(amountInput)*(chainMode==='SOL' && side==='sell'? parseFloat(currentPrice.toString()): 1)).toFixed(2)}`: '$0.00'}</span></div>
        </div>

        <div className="flex gap-2 text-xs">
          <Button variant={chainMode==='SOL'?'default':'outline'} size="sm" onClick={()=>setChainMode('SOL')} className="flex-1">Solana</Button>
          <Button variant={chainMode==='EVM'?'default':'outline'} size="sm" onClick={()=>setChainMode('EVM')} className="flex-1">EVM</Button>
        </div>

        <Button onClick={onSubmit} className={`w-full ${side==='buy'?'bg-success':'bg-destructive'} text-white`}>
          <Wallet className="h-4 w-4 mr-2" /> {side==='buy'?'Buy':'Sell'} {symbol}
        </Button>
      </div>
    </div>
  );
}
