import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useChains } from 'wagmi';
import { Wallet, LogOut, CopyCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useSiwsSolana } from '@/hooks/useSiwsSolana';
import type { Address } from 'viem';

function formatAddress(addr?: string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const chains = useChains();
  const evmChains = useMemo(() => chains.filter((c) => c.id === 1), [chains]);
  const { switchChainAsync } = useSwitchChain();

  // Solana wallet
  const { connected: solConnected, connect: connectSol, disconnect: disconnectSol, publicKey, signMessage: signMessageSol, select, wallets, wallet } = useWallet();
  const solAddress = publicKey?.toBase58();
  const { balance: solBalance } = useSolBalance();
  const { signAndVerify, loading: siwsLoading } = useSiwsSolana();

  const [chainMode, setChainMode] = useState<'EVM' | 'SOL' | null>(null);
  const [selectedEvmChainId, setSelectedEvmChainId] = useState<number | null>(1);
  const [isAuthed, setIsAuthed] = useState(false);
  const [nonce, setNonce] = useState<string>('');
  const { data: balances } = useWalletBalances(address as Address | undefined);
  const selectedChainBalance = useMemo(() => balances.find?.((b) => b.chainId === selectedEvmChainId), [balances, selectedEvmChainId]);

  useEffect(() => {
    if (chainMode === 'EVM') {
      const sig = sessionStorage.getItem('siwe_signature');
      const addrStored = sessionStorage.getItem('siwe_address');
      const ok = Boolean(sig && addrStored && address && addrStored.toLowerCase() === address.toLowerCase());
      setIsAuthed(ok);
    } else if (chainMode === 'SOL') {
      const verified = sessionStorage.getItem('siws_verified') === 'true';
      const addrStored = sessionStorage.getItem('siws_address');
      const ok = Boolean(verified && addrStored && solAddress && addrStored === solAddress);
      setIsAuthed(ok);
    } else {
      setIsAuthed(false);
    }
  }, [chainMode, address, solAddress, isConnected, solConnected]);

  // Always disable any auto-connect persistence for both wagmi and solana
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.includes('@solana/wallet-adapter') || k.includes('walletName')) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }, []);


  useEffect(() => {
    if (chainMode !== 'EVM' || !isConnected || selectedEvmChainId == null) return;
    (async () => {
      try {
        await switchChainAsync({ chainId: selectedEvmChainId });
      } catch {}
    })();
  }, [chainMode, selectedEvmChainId, isConnected]);

  useEffect(() => {
    setNonce(crypto.getRandomValues(new Uint32Array(1))[0].toString());
  }, [isConnected]);

  useEffect(() => {
    if (connectError) {
      toast({
        title: 'Wallet-anslutning misslyckades',
        description: connectError.message,
        variant: 'destructive',
      });
    }
  }, [connectError]);

  const handleConnect = async () => {
    try {
      if (!chainMode) {
        toast({ title: 'Välj kedja', description: 'Du måste välja kedja innan du ansluter.', variant: 'destructive' });
        return;
      }

      if (chainMode === 'SOL') {
        // Phantom detection (supports window.solana and window.phantom)
        const isPhantom = typeof window !== 'undefined' && (
          (window as any)?.solana?.isPhantom || (window as any)?.phantom?.solana?.isPhantom
        );
        if (!isPhantom) {
          toast({
            title: 'Phantom saknas',
            description: 'Installera Phantom för att ansluta.',
            variant: 'destructive',
          });
          window.open('https://phantom.app/download', '_blank');
          return;
        }

        try {
          // Ensure Phantom is selected in the adapter before connecting
          const phantomWallet = wallets?.find?.((w: any) => w?.adapter?.name === 'Phantom');
          if (phantomWallet && wallet?.adapter?.name !== phantomWallet.adapter.name) {
            select?.(phantomWallet.adapter.name as any);
            await new Promise((r) => setTimeout(r, 0));
          }

          await connectSol();

          if (!publicKey) throw new Error('Kunde inte läsa din Solana-adress');
          if (!signMessageSol) throw new Error('Din wallet stöder inte meddelandesignering');

          const ok = await signAndVerify(publicKey.toBase58(), signMessageSol);
          if (!ok) throw new Error('Signaturen kunde inte verifieras');

          sessionStorage.setItem('siws_verified', 'true');
          sessionStorage.setItem('siws_address', publicKey.toBase58());
          setIsAuthed(true);
          toast({ title: 'Wallet ansluten', description: 'Solana ansluten och verifierad.' });
          setNonce(crypto.getRandomValues(new Uint32Array(1))[0].toString());
          return;
        } catch (err: any) {
          if (err?.name === 'WalletNotSelectedError') {
            try {
              select?.('Phantom' as any);
              await new Promise((r) => setTimeout(r, 0));
              await connectSol();
            } catch {}
          }
          throw err;
        }
      }

// EVM connect + optional chain switch + sign
      if (selectedEvmChainId == null) {
        toast({ title: 'Välj EVM-kedja', description: 'Välj Ethereum.', variant: 'destructive' });
        return;
      }
      const wc = connectors.find((c) => c.id === 'walletConnect') || connectors[0];
      await connect({ connector: wc });
      try {
        await switchChainAsync({ chainId: selectedEvmChainId });
      } catch {}
      const message = `Signera för att bekräfta ägarskap\n\nNonce: ${nonce}\nKälla: Crypto Network Sweden`;
      try {
        const signature = await signMessageAsync({ message } as any);
        sessionStorage.setItem('siwe_signature', signature);
        if (address) sessionStorage.setItem('siwe_address', address);
        setIsAuthed(true);
      } catch (e) {
        await disconnect();
        sessionStorage.removeItem('siwe_signature');
        sessionStorage.removeItem('siwe_address');
        toast({ title: 'Signering krävs', description: 'Du måste signera för att logga in.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Wallet ansluten', description: 'EVM ansluten och signerad.' });
      setNonce(crypto.getRandomValues(new Uint32Array(1))[0].toString());
    } catch (e: any) {
      toast({ title: 'Fel vid anslutning', description: String(e.message || e), variant: 'destructive' });
    }
  };

  const handleDisconnect = async () => {
    try {
      if (chainMode === 'SOL') {
        try { await disconnectSol(); } catch {}
      } else {
        await disconnect();
      }
    } finally {
      try {
        // Remove EVM auth
        sessionStorage.removeItem('siwe_signature');
        sessionStorage.removeItem('siwe_address');
        localStorage.removeItem('siwe_signature');
        localStorage.removeItem('siwe_address');
        // Remove SOL auth
        sessionStorage.removeItem('siws_signature');
        sessionStorage.removeItem('siws_address');
        sessionStorage.removeItem('siws_verified');
        localStorage.removeItem('siws_signature');
        localStorage.removeItem('siws_address');
        localStorage.removeItem('siws_verified');
        // Rensa wagmi/walletconnect persistence
        const clearKeys = (store: Storage) => {
          for (const k of Object.keys(store)) {
            if (
              k.startsWith('wagmi') ||
              k.startsWith('wc@') ||
              k.includes('walletconnect') ||
              k.includes('@solana/wallet-adapter') ||
              k.includes('walletName') ||
              k === '@solana/wallet-adapter-react/walletName' ||
              k === 'walletAdapter'
            ) {
              store.removeItem(k);
            }
          }
        };
        clearKeys(localStorage);
        clearKeys(sessionStorage);
      } catch {}
      setIsAuthed(false);
      toast({ title: 'Frånkopplad', description: 'Session rensad. Du behöver ansluta och signera igen nästa gång.' });
    }
  };

  const isConnectedForMode = chainMode === 'SOL' ? solConnected : isConnected;
  if (!isConnectedForMode || !isAuthed) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={chainMode === 'SOL' ? 'sol' : selectedEvmChainId ? String(selectedEvmChainId) : undefined}
          onValueChange={(v) => {
            if (v === 'sol') {
              setChainMode('SOL');
              setSelectedEvmChainId(null);
            } else {
              setChainMode('EVM');
              setSelectedEvmChainId(Number(v));
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Välj kedja (ETH/SOL)" />
          </SelectTrigger>
          <SelectContent>
            {evmChains.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value="sol">Solana</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleConnect}
          size="sm"
          className="font-crypto uppercase"
          disabled={!chainMode || (chainMode === 'EVM' && !selectedEvmChainId) || isConnecting || (chainMode==='SOL' && siwsLoading)}
        >
          <Wallet className="w-4 h-4 mr-2" /> {isConnectedForMode && isAuthed ? 'Connected' : 'Connect Wallet'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={chainMode === 'SOL' ? 'sol' : selectedEvmChainId ? String(selectedEvmChainId) : undefined}
        onValueChange={(v) => {
          if (v === 'sol') {
            setChainMode('SOL');
            setSelectedEvmChainId(null);
          } else {
            setChainMode('EVM');
            setSelectedEvmChainId(Number(v));
          }
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {evmChains.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
          <SelectItem value="sol">Solana</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigator.clipboard.writeText(chainMode === 'SOL' ? (solAddress || '') : (address || ''))}
      >
        <CopyCheck className="w-4 h-4 mr-2" />
        {chainMode === 'SOL'
          ? `${formatAddress(solAddress)}${solBalance != null ? ` · SOL ${solBalance.toFixed(4)}` : ''}`
          : `${formatAddress(address)}${selectedChainBalance ? ` · ${selectedChainBalance.symbol} ${Number(selectedChainBalance.balance).toFixed(4)}` : ''}`}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDisconnect}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
