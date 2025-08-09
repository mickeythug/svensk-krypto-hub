import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { Wallet, LogOut, CopyCheck, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function formatAddress(addr?: string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [nonce, setNonce] = useState<string>('');

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
      toast({ title: 'Wallet ansluten', description: 'Du är nu ansluten.' });
    } catch (e: any) {
      toast({ title: 'Fel vid anslutning', description: String(e.message || e), variant: 'destructive' });
    }
  };

  const handleSign = async () => {
    try {
      const message = `Signera för att bekräfta ägarskap\n\nNonce: ${nonce}\nKälla: Crypto Network Sweden`;
      if (!address) throw new Error('Ingen adress tillgänglig');
      const signature = await signMessageAsync({ account: address, message });
      localStorage.setItem('siwe_signature', signature);
      localStorage.setItem('siwe_address', address || '');
      toast({ title: 'Signering klar', description: 'Ägarskap verifierat lokalt.' });
      setNonce(crypto.getRandomValues(new Uint32Array(1))[0].toString());
    } catch (e: any) {
      toast({ title: 'Signering avbröts', description: String(e.message || e), variant: 'destructive' });
    }
  };

  if (!isConnected) {
    return (
      <Button onClick={handleConnect} size="sm" className="font-crypto uppercase">
        <Wallet className="w-4 h-4 mr-2" /> Anslut Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(address || '')}>
        <CopyCheck className="w-4 h-4 mr-2" /> {formatAddress(address)}
      </Button>
      <Button variant="secondary" size="sm" onClick={handleSign}>
        <RefreshCw className="w-4 h-4 mr-2" /> Signera
      </Button>
      <Button variant="ghost" size="sm" onClick={() => disconnect()}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
