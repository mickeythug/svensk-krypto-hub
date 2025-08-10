import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useSplTokenBalance } from '@/hooks/useSplTokenBalance';
import { SOL_MINT, SOL_TOKENS, USDT_BY_CHAIN, NATIVE_TOKEN_PSEUDO } from '@/lib/tokenMaps';
import { supabase } from '@/integrations/supabase/client';
import { useAccount, useChainId, useSendTransaction } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, base, optimism } from 'viem/chains';
import { parseUnits, type Address, createPublicClient, http } from 'viem';
import { useCryptoData } from '@/hooks/useCryptoData';
import { useErc20Balance } from '@/hooks/useErc20Balance';

const CHAIN_BY_ID: Record<number, any> = { 1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 8453: base, 10: optimism };

export default function SmartTradePanel({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  const [side, setSide] = useState<'buy'|'sell'>('buy');
  const [orderType, setOrderType] = useState<'market'|'limit'>('market');
  const [amountInput, setAmountInput] = useState('');
  const [slippage, setSlippage] = useState(50); // bps
  const defaultChainMode = symbol.toUpperCase() === 'BONK' ? 'SOL' : 'EVM';
  const [chainMode, setChainMode] = useState<'SOL'|'EVM'>(defaultChainMode as any);

  // Solana
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const solAddress = publicKey?.toBase58();
  const isSolConnected = !!solAddress;
  const { balance: solBalance } = useSolBalance();
  const solTokenInfo = SOL_TOKENS[symbol.toUpperCase()];
  const { amount: tokenBal } = useSplTokenBalance(solTokenInfo?.mint || SOL_MINT);

  // EVM
  const { address: evmAddress } = useAccount();
  const chainId = useChainId();
  const evmChainId = chainId || 1;
  const { cryptoPrices } = useCryptoData();
  const solRow = useMemo(() => cryptoPrices?.find?.((c: any) => c.symbol?.toUpperCase() === 'SOL'), [cryptoPrices]);
  const solUsd = solRow?.price ? Number(solRow.price) : 0;
  const { amount: usdtBal } = useErc20Balance(CHAIN_BY_ID[evmChainId], USDT_BY_CHAIN[evmChainId] as Address, evmAddress as Address);
  const { sendTransactionAsync } = useSendTransaction();

  const available = useMemo(() => {
    if (chainMode === 'SOL') {
      return side === 'buy' ? (solBalance || 0) : (tokenBal || 0);
    }
    // EVM: USDT for buys (sell flow TBD)
    return side === 'buy' ? (usdtBal || 0) : 0;
  }, [chainMode, side, solBalance, tokenBal, usdtBal]);

  const setPercent = (pct: number) => {
    const amt = available * pct;
    setAmountInput(amt.toString());
  };

  async function executeSolanaMarket() {
    try {
      if (!solAddress) throw new Error('Solana wallet saknas');
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
      const sig = await sendTransaction(tx, connection);
      toast({ title: 'Order skickad', description: `Tx: ${sig}` });
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
      const toToken = NATIVE_TOKEN_PSEUDO[evmChainId];
      const fromToken = usdt;
      const amountWei = parseUnits(amountInput || '0', 6);
      if (amountWei <= 0n) throw new Error('Ogiltigt belopp');

      const response = await supabase.functions.invoke('evm-swap', {
        body: { chainId: evmChainId, fromToken, toToken, amount: amountWei.toString(), fromAddress: evmAddress, slippage: slippage / 100 },
      });
      if (response.error) throw response.error;
      const data: any = response.data;
      if (!data || !data.tx) throw new Error('Ogiltig 1inch-respons');

      const hash = await sendTransactionAsync({
        to: data.tx.to as Address,
        data: data.tx.data as `0x${string}`,
        value: BigInt(data.tx.value || 0),
      } as any);
      toast({ title: 'Order skickad', description: `Tx: ${hash}` });
      setAmountInput('');
    } catch (e: any) {
      const msg = String(e.message || e);
      toast({ title: 'EVM fel', description: msg, variant: 'destructive' });
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
          <Input type="number" value={amountInput} onChange={(e)=>setAmountInput(e.target.value)} placeholder="0.0" className="h-10 text-sm font-mono" min="0" step="any" />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[0.25,0.5,0.75,1].map(p => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={()=>setPercent(p)}
              disabled={available <= 0 || (chainMode==='SOL' && !isSolConnected)}
            >
              {Math.round(p*100)}%
            </Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Tillgängligt:</span>
            <span className="font-mono">
              {chainMode==='SOL' && side==='buy'
                ? `${available?.toFixed(6)} SOL${solUsd ? ` (≈ $${(available*solUsd).toFixed(2)})` : ''}`
                : available?.toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ordervärde:</span>
            <span className="font-mono">
              {amountInput ? `$${(parseFloat(amountInput) * (chainMode==='SOL' ? (side==='buy' ? solUsd : currentPrice) : 1)).toFixed(2)}` : '$0.00'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          <Button variant={chainMode==='SOL'?'default':'outline'} size="sm" onClick={()=>setChainMode('SOL')} className="flex-1">Solana</Button>
          <Button variant={chainMode==='EVM'?'default':'outline'} size="sm" onClick={()=>setChainMode('EVM')} className="flex-1">EVM</Button>
        </div>

        <Button onClick={onSubmit} className={`w-full ${side==='buy'?'bg-success':'bg-destructive'} text-white`} disabled={(chainMode==='SOL' && !isSolConnected) || !amountInput || parseFloat(amountInput) <= 0 || available <= 0}>
          <Wallet className="h-4 w-4 mr-2" /> {side==='buy'?'Buy':'Sell'} {symbol}
        </Button>
      </div>
    </div>
  );
}
