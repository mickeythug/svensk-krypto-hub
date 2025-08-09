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
  const [selectedChainId, setSelectedChainId] = useState<number>(() => chains[0]?.id ?? 1);
  const [nonce, setNonce] = useState<string>('');
  const { data: balances } = useWalletBalances(address as Address | undefined);
  const selectedChainBalance = useMemo(() => balances.find?.((b) => b.chainId === selectedChainId), [balances, selectedChainId]);

  useEffect(() => {
    if (chains.length && !chains.find((c) => c.id === selectedChainId)) {
      setSelectedChainId(chains[0]!.id);
    }
  }, [chains, selectedChainId]);

  useEffect(() => {
    if (!isConnected) return;
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
        if (address) {
          const signature = await signMessageAsync({ account: address, message });
          localStorage.setItem('siwe_signature', signature);
          localStorage.setItem('siwe_address', address || '');
        } else {
          const signature = await signMessageAsync({ message } as any);
          localStorage.setItem('siwe_signature', signature);
        }
      } catch (e) {
        // Användaren kan ha avbrutit signeringen – anslutningen kvarstår
      }

      toast({ title: 'Wallet ansluten', description: 'Ansluten och (om godkänd) signerad.' });
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
        localStorage.removeItem('siwe_signature');
        localStorage.removeItem('siwe_address');
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('wagmi') || k.startsWith('wc@') || k.includes('walletconnect')) {
            localStorage.removeItem(k);
          }
        });
      } catch {}
      toast({ title: 'Frånkopplad', description: 'Session rensad. Du behöver ansluta och signera igen nästa gång.' });
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Select value={String(selectedChainId)} onValueChange={(v) => setSelectedChainId(Number(v))}>
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
        <Button onClick={handleConnect} size="sm" className="font-crypto uppercase" disabled={isConnecting || isSwitching}>
          <Wallet className="w-4 h-4 mr-2" /> Anslut Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={String(selectedChainId)} onValueChange={(v) => setSelectedChainId(Number(v))}>
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
