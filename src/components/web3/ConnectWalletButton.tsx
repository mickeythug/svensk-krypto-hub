import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useChains } from 'wagmi';
import { Wallet, LogOut, CopyCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useSiwsSolana } from '@/hooks/useSiwsSolana';
import type { Address } from 'viem';
import { authLog } from '@/lib/authDebug';

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
  const { connection: solConnection } = useConnection();

  // Solana wallet
  const { connected: solConnected, connect: connectSol, disconnect: disconnectSol, publicKey, signMessage: signMessageSol, select, wallets, wallet } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const solAddress = publicKey?.toBase58();
  const { balance: solBalance } = useSolBalance();
  const { signAndVerify, loading: siwsLoading } = useSiwsSolana();

  const [chainMode, setChainMode] = useState<'EVM' | 'SOL' | null>(null);
  const [selectedEvmChainId, setSelectedEvmChainId] = useState<number | null>(1);
  const [isAuthed, setIsAuthed] = useState(false);
  const [nonce, setNonce] = useState<string>('');
  const { data: balances } = useWalletBalances(address as Address | undefined);
  const selectedChainBalance = useMemo(() => balances.find?.((b) => b.chainId === selectedEvmChainId), [balances, selectedEvmChainId]);
  const authedSol = useMemo(() => {
    const verified = sessionStorage.getItem('siws_verified') === 'true';
    const stored = sessionStorage.getItem('siws_address');
    return Boolean(solConnected && solAddress && verified && stored === solAddress);
  }, [solConnected, solAddress]);
  const authedEvm = useMemo(() => {
    const sig = sessionStorage.getItem('siwe_signature');
    const stored = sessionStorage.getItem('siwe_address');
    const verified = sessionStorage.getItem('siwe_verified') === 'true';
    return Boolean(isConnected && address && sig && verified && stored && stored.toLowerCase() === (address || '').toLowerCase());
  }, [isConnected, address]);
  const fullyAuthed = authedSol || authedEvm;
  const activeMode = authedSol ? 'SOL' : (authedEvm ? 'EVM' : null);

  useEffect(() => {
    if (chainMode === 'EVM') {
      const sig = sessionStorage.getItem('siwe_signature');
      const addrStored = sessionStorage.getItem('siwe_address');
      const verified = sessionStorage.getItem('siwe_verified') === 'true';
      const ok = Boolean(verified && sig && addrStored && address && addrStored.toLowerCase() === address.toLowerCase());
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



  // Lås kedja till den verifierade kedjan och synka UI
  useEffect(() => {
    if (authedSol) {
      setChainMode('SOL');
      setSelectedEvmChainId(null);
    } else if (authedEvm) {
      setChainMode('EVM');
      if (selectedEvmChainId == null) setSelectedEvmChainId(1);
    }
  }, [authedSol, authedEvm]);

  // EVM: byt nät vid behov
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
      authLog('EVM: connect error', connectError?.message || String(connectError), 'error');
      toast({
        title: 'Wallet-anslutning misslyckades',
        description: connectError.message,
        variant: 'destructive',
      });
    }
  }, [connectError]);

  const handleConnect = async () => {
    try {
      // Kräv att användaren väljer kedja (ingen auto-detektering)
      if (!chainMode) {
        toast({ title: 'Välj kedja', description: 'Välj Solana (Phantom) eller Ethereum (MetaMask/Trust).', variant: 'destructive' });
        return;
      }
      const mode: 'SOL' | 'EVM' = chainMode;
      authLog('Connect: start', { mode, selectedEvmChainId });

      if (mode === 'SOL') {
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
          // Säkerställ att Phantom är vald
          const phantomWallet = wallets?.find?.((w: any) => w?.adapter?.name === 'Phantom');
          if (phantomWallet && wallet?.adapter?.name !== phantomWallet.adapter.name) {
            select?.(phantomWallet.adapter.name as any);
            await new Promise((r) => setTimeout(r, 0));
          }

          if (!wallet) {
            toast({ title: 'Välj Solana‑wallet', description: 'Öppnar wallet‑väljaren – välj Phantom för att fortsätta.' });
            setWalletModalVisible(true);
            return;
          }

          await connectSol();

          // Vänta kort på att publicKey uppdateras från adaptern
          let pk = publicKey as typeof publicKey | undefined;
          for (let i = 0; i < 20 && !pk; i++) {
            await new Promise((r) => setTimeout(r, 50));
            pk = publicKey as typeof publicKey | undefined;
          }
          const pubkeyStr = pk?.toBase58?.() || (wallet as any)?.adapter?.publicKey?.toBase58?.();
          if (!pubkeyStr) throw new Error('Kunde inte läsa din Solana‑adress. Godkänn anslutningen i Phantom och försök igen.');

          const canAdapterSign = typeof signMessageSol === 'function';
          const providerSign = (typeof window !== 'undefined' ? (window as any)?.solana?.signMessage : undefined) as ((message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array | number[] }>) | undefined;
          const canProviderSign = typeof providerSign === 'function';
          if (!canAdapterSign && !canProviderSign) {
            toast({
              title: 'Meddelandesignering ej tillgänglig',
              description: 'Din valda wallet stöder inte “Sign Message”. Välj Phantom (rekommenderas).',
              variant: 'destructive',
            });
            setWalletModalVisible(true);
            return;
          }

          const signFn = async (bytes: Uint8Array) => {
            if (canAdapterSign) return await (signMessageSol as any)(bytes);
            const res = await (providerSign as any)(bytes, 'utf8');
            const sig = (res?.signature && Array.isArray(res.signature)) ? new Uint8Array(res.signature) : (res?.signature as Uint8Array);
            if (!(sig instanceof Uint8Array)) throw new Error('Signatur ogiltig från wallet');
            return sig;
          };

          const ok = await signAndVerify(pubkeyStr, signFn);
          if (!ok) throw new Error('Signaturen kunde inte verifieras');

          sessionStorage.setItem('siws_verified', 'true');
          sessionStorage.setItem('siws_address', pubkeyStr);
          setIsAuthed(true);
          toast({ title: 'Wallet ansluten', description: 'Solana ansluten och verifierad.' });
          try {
            if (pk) {
              const lamports = await solConnection.getBalance(pk, { commitment: 'processed' } as any);
              const sol = lamports / 1_000_000_000;
              console.info('Efter anslutning: SOL-saldo', sol);
            }
          } catch {}
          setNonce(crypto.getRandomValues(new Uint32Array(1))[0].toString());
          return;
        } catch (err: any) {
          if (err?.name === 'WalletNotSelectedError') {
            toast({ title: 'Välj Solana‑wallet', description: 'Öppnar wallet‑väljaren – välj Phantom för att fortsätta.', variant: 'destructive' });
            setWalletModalVisible(true);
            return;
          }
          try { await disconnectSol(); } catch {}
          try {
            sessionStorage.removeItem('siws_signature');
            sessionStorage.removeItem('siws_address');
            sessionStorage.removeItem('siws_verified');
            localStorage.removeItem('siws_signature');
            localStorage.removeItem('siws_address');
            localStorage.removeItem('siws_verified');
          } catch {}
          setIsAuthed(false);
          throw err;
        }
      }

      // EVM connect + optional chain switch + sign
      if (selectedEvmChainId == null) {
        toast({ title: 'Välj EVM-kedja', description: 'Välj Ethereum.', variant: 'destructive' });
        return;
      }
      const injectedConnector = connectors.find((c) => c.id === 'injected');
      const wcConnector = connectors.find((c) => c.id === 'walletConnect');
      const chosen = injectedConnector || wcConnector || connectors[0];
      authLog('EVM: choosing connector', { chosen: chosen?.id, haveInjected: Boolean(injectedConnector), haveWalletConnect: Boolean(wcConnector) });
      await connect({ connector: chosen });
      try {
        authLog('EVM: switchChain attempt', { chainId: selectedEvmChainId });
        await switchChainAsync({ chainId: selectedEvmChainId });
        authLog('EVM: switchChain success', { chainId: selectedEvmChainId });
      } catch (e) {
        authLog('EVM: switchChain failed', String(e), 'warn');
      }
      const message = `Signera för att bekräfta ägarskap\n\nNonce: ${nonce}\nDomän: ${window.location.host}`;
      try {
        const signature = await signMessageAsync({ message } as any);
        // Server-verify SIWE
        const { data, error } = await (await import('@/integrations/supabase/client')).supabase.functions.invoke('siwe-verify', {
          body: { address, message, signature },
        });
        if (error || !(data as any)?.ok) {
          authLog('EVM: server verify failed', { error, data }, 'error');
          throw new Error((error as any)?.message || 'Serververifiering misslyckades');
        }
        authLog('EVM: SIWE verified', { address });
        sessionStorage.setItem('siwe_signature', signature);
        if (address) sessionStorage.setItem('siwe_address', address);
        sessionStorage.setItem('siwe_verified', 'true');
        setIsAuthed(true);
      } catch (e) {
        authLog('EVM: sign/verify failed', String(e), 'error');
        await disconnect();
        sessionStorage.removeItem('siwe_signature');
        sessionStorage.removeItem('siwe_address');
        sessionStorage.removeItem('siwe_verified');
        toast({ title: 'Signering krävs', description: 'Du måste signera och verifiera för att logga in.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Wallet ansluten', description: 'EVM ansluten och verifierad.' });
      authLog('EVM: connect+verify success', { address });
      setNonce(crypto.getRandomValues(new Uint32Array(1))[0].toString());
    } catch (e: any) {
      authLog('Connect: fatal error', String(e?.message || e), 'error');
      toast({ title: 'Fel vid anslutning', description: String(e.message || e), variant: 'destructive' });
      setIsAuthed(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const mode = chainMode || (solConnected ? 'SOL' : 'EVM');
      if (mode === 'SOL') {
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
  if (!fullyAuthed) {
    if (solConnected && solAddress) {
      // En enda knapp för att slutföra inloggning
      return (
        <Button
          onClick={async () => {
            try {
              const canAdapterSign = typeof signMessageSol === 'function';
              const providerSign = (window as any)?.solana?.signMessage as ((message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array | number[] }>) | undefined;
              const canProviderSign = typeof providerSign === 'function';
              if (!canAdapterSign && !canProviderSign) {
                toast({ title: 'Välj Phantom', description: 'Vi öppnar wallet‑väljaren så du kan välja Phantom.' });
                setWalletModalVisible(true);
                return;
              }
              const signFn = async (bytes: Uint8Array) => {
                if (canAdapterSign) return await (signMessageSol as any)(bytes);
                const res = await (providerSign as any)(bytes, 'utf8');
                const sig = (res?.signature && Array.isArray(res.signature)) ? new Uint8Array(res.signature) : (res?.signature as Uint8Array);
                if (!(sig instanceof Uint8Array)) throw new Error('Signatur ogiltig från wallet');
                return sig;
              };
              const ok = await signAndVerify(solAddress!, signFn);
              if (!ok) throw new Error('Verifiering misslyckades');
              sessionStorage.setItem('siws_verified', 'true');
              sessionStorage.setItem('siws_address', solAddress!);
              setIsAuthed(true);
              toast({ title: 'Verifierad', description: 'SIWS slutförd.' });
            } catch (e: any) {
              toast({ title: 'Verifiering misslyckades', description: String(e?.message || e), variant: 'destructive' });
            }
          }}
          size="sm"
          className="font-crypto uppercase"
        >
          <Wallet className="w-4 h-4 mr-2" /> Slutför inloggning
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="font-crypto uppercase"
            disabled={isConnecting || siwsLoading}
          >
            <Wallet className="w-4 h-4 mr-2" /> Connect Wallet
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuItem onClick={() => { setChainMode('SOL'); void handleConnect(); }}>
            Solana (Phantom)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setChainMode('EVM'); setSelectedEvmChainId(1); void handleConnect(); }}>
            Ethereum (MetaMask / Trust)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">
        {activeMode === 'SOL' ? 'Solana' : 'Ethereum'}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigator.clipboard.writeText(activeMode === 'SOL' ? (solAddress || '') : (address || ''))}
      >
        <CopyCheck className="w-4 h-4 mr-2" />
        {activeMode === 'SOL'
          ? `${formatAddress(solAddress)}`
          : `${formatAddress(address)}`}

      </Button>
      <Button variant="ghost" size="sm" onClick={handleDisconnect}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
