import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useChains } from 'wagmi';
import { Wallet, LogOut, CopyCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import type { Address } from 'viem';

function formatAddress(addr?: string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const chains = useChains();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [nonce, setNonce] = useState<string>('');
  const { data: balances } = useWalletBalances(address as Address | undefined);
  const selectedChainBalance = useMemo(() => balances.find?.((b) => b.chainId === selectedChainId), [balances, selectedChainId]);

  useEffect(() => {
    const sig = sessionStorage.getItem('siwe_signature');
    const addrStored = sessionStorage.getItem('siwe_address');
    const ok = Boolean(sig && addrStored && address && addrStored.toLowerCase() === address.toLowerCase());
    setIsAuthed(ok);
  }, [address, isConnected]);

  useEffect(() => {
    if (!isConnected || selectedChainId == null) return;
    (async () => {
      try {
        await switchChainAsync({ chainId: selectedChainId });
      } catch {}
    })();
  }, [selectedChainId, isConnected]);

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
      if (selectedChainId == null) {
        toast({ title: 'Välj kedja', description: 'Du måste välja kedja innan du ansluter.', variant: 'destructive' });
        return;
      }
      // Prefer WalletConnect om tillgänglig, annars injected
      const wc = connectors.find((c) => c.id === 'walletConnect') || connectors[0];
      await connect({ connector: wc });

      // Försök byta till vald kedja
      try {
        await switchChainAsync({ chainId: selectedChainId });
      } catch (e) {
        // Ignorera, vissa wallets hanterar detta själva
      }

      // Signera automatiskt (SIWE-lik verifiering)
      const message = `Signera för att bekräfta ägarskap\n\nNonce: ${nonce}\nKälla: Crypto Network Sweden`;
      try {
        const signature = await signMessageAsync({ message } as any);
        sessionStorage.setItem('siwe_signature', signature);
        if (address) sessionStorage.setItem('siwe_address', address);
        setIsAuthed(true);
      } catch (e) {
        // Kräver signering: koppla från och rensa
        await disconnect();
        try {
          sessionStorage.removeItem('siwe_signature');
          sessionStorage.removeItem('siwe_address');
        } catch {}
        toast({ title: 'Signering krävs', description: 'Du måste signera för att logga in.', variant: 'destructive' });
        return;
      }

      toast({ title: 'Wallet ansluten', description: 'Ansluten och signerad.' });
      setNonce(crypto.getRandomValues(new Uint32Array(1))[0].toString());
    } catch (e: any) {
      toast({ title: 'Fel vid anslutning', description: String(e.message || e), variant: 'destructive' });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } finally {
      try {
        sessionStorage.removeItem('siwe_signature');
        sessionStorage.removeItem('siwe_address');
        localStorage.removeItem('siwe_signature');
        localStorage.removeItem('siwe_address');
        // Rensa wagmi/walletconnect persistence
        const clearKeys = (store: Storage) => {
          for (const k of Object.keys(store)) {
            if (k.startsWith('wagmi') || k.startsWith('wc@') || k.includes('walletconnect')) {
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

  if (!isConnected || !isAuthed) {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedChainId ? String(selectedChainId) : undefined} onValueChange={(v) => setSelectedChainId(Number(v))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Välj kedja" />
          </SelectTrigger>
          <SelectContent>
            {chains.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleConnect} size="sm" className="font-crypto uppercase" disabled={isConnecting || !selectedChainId}>
          <Wallet className="w-4 h-4 mr-2" /> Anslut Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedChainId ? String(selectedChainId) : undefined} onValueChange={(v) => setSelectedChainId(Number(v))}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {chains.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(address || '')}>
        <CopyCheck className="w-4 h-4 mr-2" /> {formatAddress(address)}{selectedChainBalance ? ` · ${selectedChainBalance.symbol} ${Number(selectedChainBalance.balance).toFixed(4)}` : ''}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDisconnect}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
