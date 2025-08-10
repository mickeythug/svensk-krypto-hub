import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useSplTokenBalance } from '@/hooks/useSplTokenBalance';
import { SOL_MINT, SOL_TOKENS, USDT_BY_CHAIN, NATIVE_TOKEN_PSEUDO } from '@/lib/tokenMaps';
import { ERC20_ABI } from '@/lib/erc20';
import { supabase } from '@/integrations/supabase/client';
import { useAccount, useSendTransaction } from 'wagmi';
import { mainnet } from 'viem/chains';
import { parseUnits, type Address, createPublicClient, http } from 'viem';
import { useCryptoData } from '@/hooks/useCryptoData';
import { useErc20Balance } from '@/hooks/useErc20Balance';
import { recordTrade } from '@/lib/tradeHistory';
import ConnectWalletButton from '@/components/web3/ConnectWalletButton';

const CHAIN_BY_ID: Record<number, any> = { 1: mainnet };

async function invokeWithRetry<T = any>(name: string, body: any, retries = 1): Promise<{ data: T | null; error: any | null }> {
  let lastErr: any = null;
  for (let i = 0; i <= retries; i++) {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (!error) return { data: data as any, error: null };
    lastErr = error;
    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
  }
  return { data: null, error: lastErr };
}


function parseFunctionError(e: any): string {
  try {
    if (!e) return 'Okänt fel';
    // Supabase Edge Function error shape
    const ctxResp = (e as any)?.context?.response;
    if (ctxResp && typeof ctxResp.json === 'function') {
      // Note: response might be a Response object from fetch
      // We cannot await here synchronously; fall through to message
    }
    const msg = (e as any)?.message || (e as any)?.error || String(e);
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  } catch {
    return 'Okänt fel';
  }
}

export default function SmartTradePanel({ symbol, currentPrice }: { symbol: string; currentPrice: number }) {
  const [side, setSide] = useState<'buy'|'sell'>('buy');
  const [orderType, setOrderType] = useState<'market'|'limit'>('market');
  const [amountInput, setAmountInput] = useState('');
  const [slippage, setSlippage] = useState(50); // bps
  const [submitting, setSubmitting] = useState(false);
  const symbolUpper = symbol.toUpperCase();
  const isSolToken = useMemo(() => Boolean(SOL_TOKENS[symbolUpper]) && symbolUpper !== 'SOL', [symbolUpper]);
  const defaultChainMode = isSolToken ? 'SOL' : 'EVM';
  const [chainMode, setChainMode] = useState<'SOL'|'EVM'>(defaultChainMode as any);

  // Solana
  const { publicKey, connected: solConnected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const solAddress = publicKey?.toBase58();
  const isSolConnected = !!solConnected;
  const { balance: solBalance } = useSolBalance();
  const solTokenInfo = SOL_TOKENS[symbol.toUpperCase()];
  const { amount: tokenBal } = useSplTokenBalance(solTokenInfo?.mint || SOL_MINT);

  // EVM
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const evmConnected = isEvmConnected;
  const evmChainId = 1;
  const { cryptoPrices } = useCryptoData();
  const solRow = useMemo(() => cryptoPrices?.find?.((c: any) => c.symbol?.toUpperCase() === 'SOL'), [cryptoPrices]);
  const solUsd = solRow?.price ? Number(solRow.price) : 0;
  const { amount: usdtBal } = useErc20Balance(CHAIN_BY_ID[evmChainId], USDT_BY_CHAIN[evmChainId] as Address, evmAddress as Address);
  const { sendTransactionAsync } = useSendTransaction();

  // Auto-detect chain mode from connected wallets
  useEffect(() => {
    if (isSolConnected) {
      setChainMode('SOL');
    } else if (evmConnected) {
      setChainMode('EVM');
    } else {
      setChainMode(isSolToken ? 'SOL' : 'EVM');
    }
  }, [isSolConnected, evmConnected, isSolToken]);

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

  const amountStep = useMemo(() => {
    try {
      if (chainMode === 'SOL') {
        const d = side === 'buy' ? 9 : (solTokenInfo?.decimals ?? 9);
        return Number((1 / Math.pow(10, Math.min(9, Math.max(0, d)))).toFixed(Math.min(9, Math.max(0, d))));
      }
      // EVM USDT har 6 decimals
      return 0.000001;
    } catch {
      return 0.000001;
    }
  }, [chainMode, side, solTokenInfo]);

  async function executeSolanaMarket() {
    try {
      setSubmitting(true);
      if (!solAddress) throw new Error('Solana wallet saknas');
      if (!isSolToken) throw new Error('Denna token är inte tillgänglig på Solana. Välj EVM eller en Solana-token (t.ex. BONK/USDC).');
      const inputMint = side === 'buy' ? SOL_MINT : (solTokenInfo?.mint || SOL_MINT);
      const outputMint = side === 'buy' ? (solTokenInfo?.mint || SOL_MINT) : SOL_MINT;
      if (!inputMint || !outputMint) throw new Error('Okänd token');

      const decimals = side === 'buy' ? 9 : (solTokenInfo?.decimals || 9);
      const amountBase = Math.floor(parseFloat(amountInput) * Math.pow(10, decimals));
      if (!Number.isFinite(amountBase) || amountBase <= 0) throw new Error('Ogiltigt belopp');
      if (amountBase < 1000) throw new Error('Beloppet är för litet för Jupiter');

      const { data, error } = await invokeWithRetry<any>('jupiter-swap', {
        userPublicKey: solAddress, inputMint, outputMint, amount: String(amountBase), slippageBps: slippage,
      }, 1);
      if (error) {
        let detailsText = '';
        try {
          const ctxResp = (error as any)?.context?.response;
          if (ctxResp && typeof ctxResp.json === 'function') {
            const j = await ctxResp.json();
            detailsText = j?.error ? `${j.error}${j?.details ? `: ${typeof j.details === 'string' ? j.details : JSON.stringify(j.details)}` : ''}` : '';
          }
        } catch {}
        throw new Error(detailsText || (error as any)?.message || 'Okänt fel från jupiter-swap');
      }
      const swapTxB64 = (data as any)?.swapTransaction as string;
      if (!swapTxB64) throw new Error('Saknar swapTransaction');

      const txBytes = Uint8Array.from(atob(swapTxB64), (c) => c.charCodeAt(0));
      const vtx = VersionedTransaction.deserialize(txBytes);
      const sig = await sendTransaction(vtx, connection);
      const explorer = `https://solscan.io/tx/${sig}`;
      recordTrade(solAddress || 'sol', {
        chain: 'SOL',
        symbol: symbolUpper,
        side,
        amount: parseFloat(amountInput || '0'),
        amountUsd: parseFloat(amountInput || '0') * (side === 'buy' ? solUsd : currentPrice),
        txHash: sig,
        address: solAddress,
      });
      toast({ title: 'Order skickad', description: (<a href={explorer} target="_blank" rel="noreferrer" className="underline">Visa på Solscan</a>) });
      setAmountInput('');
    } catch (e: any) {
      const msg = parseFunctionError(e);
      toast({ title: 'Solana fel', description: msg, variant: 'destructive' });
      setSubmitting(false);
    }
  }

  async function executeEvmMarket() {
    try {
      setSubmitting(true);
      if (!evmAddress) throw new Error('EVM wallet saknas');
      const client = createPublicClient({ chain: CHAIN_BY_ID[evmChainId], transport: http() });

      const usdt = USDT_BY_CHAIN[evmChainId] as Address;
      if (!usdt) throw new Error('USDT saknas för vald kedja');

      const native = NATIVE_TOKEN_PSEUDO[evmChainId] as Address;
      const isBuy = side === 'buy';
      const fromToken = (isBuy ? usdt : native) as Address;
      const toToken = (isBuy ? native : usdt) as Address;
      const decimals = isBuy ? 6 : 18;
      const amountWei = parseUnits(amountInput || '0', decimals);
      if (amountWei <= 0n) throw new Error('Ogiltigt belopp');
      if (isBuy && parseFloat(amountInput) < 0.1) throw new Error('Minsta belopp 0.1 USDT');

      // Approve if buying with USDT (ERC20)
      if (isBuy) {
        const spenderRes = await invokeWithRetry<any>('evm-approve', { chainId: evmChainId, tokenAddress: fromToken, action: 'spender' }, 1);
        if (spenderRes.error) throw spenderRes.error;
        const spender = (spenderRes.data as any)?.address || (spenderRes.data as any)?.spender;
        if (!spender) throw new Error('Kunde inte hämta spender');

        const allowance = (await client.readContract({
          address: fromToken,
          abi: ERC20_ABI as any,
          functionName: 'allowance',
          args: [evmAddress as Address, spender as Address],
        })) as unknown as bigint;

        if (allowance < amountWei) {
          const approveTxRes = await invokeWithRetry<any>('evm-approve', { chainId: evmChainId, tokenAddress: fromToken, amount: amountWei.toString(), action: 'tx' }, 1);
          if (approveTxRes.error) throw approveTxRes.error;
          const approveTx: any = approveTxRes.data?.tx;
          if (!approveTx?.to || !approveTx?.data) throw new Error('Ogiltig approve-tx');
          const approveHash = await sendTransactionAsync({
            to: approveTx.to as Address,
            data: approveTx.data as `0x${string}`,
            value: BigInt(approveTx.value || 0),
          } as any);
          await client.waitForTransactionReceipt({ hash: approveHash as any });
        }
      }

      // Build swap
      const swapRes = await invokeWithRetry<any>('evm-swap', { chainId: evmChainId, fromToken, toToken, amount: amountWei.toString(), fromAddress: evmAddress, slippage: slippage / 100 }, 1);
      if (swapRes.error) throw swapRes.error;
      const swapData: any = swapRes.data;
      if (!swapData || !swapData.tx) throw new Error('Ogiltig 1inch-respons');

      const hash = await sendTransactionAsync({
        to: swapData.tx.to as Address,
        data: swapData.tx.data as `0x${string}`,
        value: BigInt(swapData.tx.value || 0),
      } as any);
      const explorer = `https://etherscan.io/tx/${hash}`;
      recordTrade(evmAddress || 'evm', {
        chain: 'EVM',
        symbol: symbolUpper,
        side,
        amount: parseFloat(amountInput || '0'),
        amountUsd: parseFloat(amountInput || '0'),
        txHash: String(hash),
        address: evmAddress,
      });
      toast({ title: 'Order skickad', description: (<a href={explorer} target="_blank" rel="noreferrer" className="underline">Visa på Etherscan</a>) });
      setAmountInput('');
    } catch (e: any) {
      const msg = parseFunctionError(e);
      toast({ title: 'EVM fel', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  const onSubmit = async () => {
    if (submitting) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast({ title: 'Offline', description: 'Ingen nätverksanslutning. Försök igen när du är online.', variant: 'destructive' });
      return;
    }
    const amt = parseFloat(amountInput || '0');
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ title: 'Ogiltigt belopp', description: 'Ange ett giltigt belopp > 0.', variant: 'destructive' });
      return;
    }
    if (amt > available) {
      toast({ title: 'Belopp för stort', description: 'Beloppet överstiger tillgängligt saldo.', variant: 'destructive' });
      return;
    }
    if (orderType !== 'market') {
      toast({ title: 'Limit-order', description: 'Limit-orders aktiveras i nästa steg.', variant: 'destructive' });
      return;
    }
    if (chainMode === 'SOL') {
      if (!isSolToken) {
        toast({ title: 'Inte tillgänglig på Solana', description: 'Välj en Solana‑token (t.ex. BONK) eller byt till EVM.', variant: 'destructive' });
        return;
      }
      if (!isSolConnected) {
        toast({ title: 'Wallet krävs', description: 'Anslut en Solana‑wallet.', variant: 'destructive' });
        return;
      }
      return executeSolanaMarket();
    }
    if (!evmConnected) {
      toast({ title: 'Wallet krävs', description: 'Anslut en EVM‑wallet.', variant: 'destructive' });
      return;
    }
    return executeEvmMarket();
  };

  if (!isSolConnected && !evmConnected) {
    return null;
  }

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
          <label className="text-xs text-muted-foreground mb-2 block font-semibold">Belopp ({chainMode==='SOL' ? (side==='buy'?'SOL':symbol) : chainMode==='EVM' ? 'USDT' : ''})</label>
          <Input type="number" value={amountInput} onChange={(e)=>setAmountInput(e.target.value.replace(/[^0-9.]/g,'').replace(/(\..*)\./g,'$1'))} placeholder="0.0" className="h-10 text-sm font-mono" min="0" step={amountStep} inputMode="decimal" disabled={!isSolConnected && !evmConnected} />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[0.25,0.5,0.75,1].map(p => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={()=>setPercent(p)}
              disabled={submitting || available <= 0 || (chainMode==='SOL' && (!isSolConnected || !isSolToken)) || (chainMode==='EVM' && !evmConnected)}
            >
              {Math.round(p*100)}%
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground mb-1 block font-semibold">Slippage (%)</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={(slippage/100).toString()}
              onChange={(e)=>{
                const v = parseFloat(e.target.value || '0');
                if (!Number.isFinite(v)) return;
                const bps = Math.round(v * 100);
                const clamped = Math.min(500, Math.max(10, bps)); // 0.10% - 5.00%
                setSlippage(clamped);
              }}
              min={0.1}
              max={5}
              step={0.1}
              className="h-8 text-xs font-mono"
              inputMode="decimal"
            />
            {[0.1,0.5,1].map(p => (
              <Button key={p} variant="outline" size="sm" className="h-8 text-xs" onClick={()=>setSlippage(Math.round(p*100))}>
                {p}%
              </Button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground">Lägre slippage kan orsaka missade fills; högre ökar prispåverkan. Standard 0.5%.</div>
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


        <Button onClick={onSubmit} className={`w-full ${side==='buy'?'bg-success':'bg-destructive'} text-white`} disabled={submitting || (chainMode==='SOL' && (!isSolConnected || !isSolToken)) || (chainMode==='EVM' && !evmConnected) || !amountInput || parseFloat(amountInput) <= 0 || available <= 0 || (typeof navigator !== 'undefined' && !navigator.onLine)}>
          <Wallet className="h-4 w-4 mr-2" /> {submitting ? 'Skickar...' : `${side==='buy'?'Buy':'Sell'} ${symbol}`}
        </Button>
      </div>
    </div>
  );
}
