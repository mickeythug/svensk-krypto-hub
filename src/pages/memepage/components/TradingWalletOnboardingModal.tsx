import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';

interface Props {
  open: boolean;
  walletAddress?: string | null;
  privateKey?: string | null; // shown once
  onCopyPrivateKey?: () => void;
  onConfirm?: () => void;
}

export default function TradingWalletOnboardingModal({ open, walletAddress, privateKey, onCopyPrivateKey, onConfirm }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => { setCopied(false); }, [open]);

  const canContinue = copied;

  const copy = async (text?: string | null) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopyPrivateKey?.();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-crypto">Din nya Trading Wallet</DialogTitle>
          <DialogDescription>
            Spara din privata nyckel innan du fortsätter. Vi visar den bara en gång. Utan den kan du inte återställa plånboken.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Public Address</label>
            <div className="flex gap-2 mt-1">
              <Input readOnly value={walletAddress || ''} />
              <Button variant="outline" onClick={() => copy(walletAddress)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Private Key (spara säkert)</label>
            <div className="flex gap-2 mt-1">
              <Input readOnly type="password" value={privateKey || ''} />
              <Button onClick={() => copy(privateKey)} className="bg-warning text-warning-foreground">
                Kopiera Private Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Du måste kopiera din private key för att fortsätta.</p>
          </div>

          <Button disabled={!canContinue} onClick={onConfirm} className="w-full">
            Jag har sparat min private key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
