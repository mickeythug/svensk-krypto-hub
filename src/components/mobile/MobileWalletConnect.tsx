import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wallet, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Import wallet logos
import phantomLogo from '@/assets/wallet-logos/phantom-logo.png';
import metamaskLogo from '@/assets/wallet-logos/metamask-logo.png';
import trustwalletLogo from '@/assets/wallet-logos/trustwallet-logo-correct.png';
import solanaLogo from '@/assets/wallet-logos/solana-logo.png';
import ethereumLogo from '@/assets/wallet-logos/ethereum-logo.png';

interface MobileWalletConnectProps {
  onBack: () => void;
}

export const MobileWalletConnect = ({ onBack }: MobileWalletConnectProps) => {
  const [selectedChain, setSelectedChain] = useState<'solana' | 'ethereum' | null>(null);
  const location = useLocation();

  const handleChainSelect = (chain: 'solana' | 'ethereum') => {
    setSelectedChain(chain);
  };

  const handleWalletConnect = (wallet: string) => {
    const baseUrl = window.location.origin;
    const redirectPath = encodeURIComponent(location.pathname);
    
    if (selectedChain === 'solana') {
      // Phantom deep link for Solana
      const phantomUrl = `https://phantom.app/ul/browse/${encodeURIComponent(`${baseUrl}/connect?chain=sol&redirect=${redirectPath}`)}`;
      window.open(phantomUrl, '_blank');
    } else if (selectedChain === 'ethereum') {
      let walletUrl = '';
      
      if (wallet === 'metamask') {
        walletUrl = `https://metamask.app.link/dapp/${window.location.host}/connect?chain=evm&wallet=metamask&redirect=${redirectPath}`;
      } else if (wallet === 'trust') {
        walletUrl = `https://link.trustwallet.com/open_url?url=${encodeURIComponent(`${baseUrl}/connect?chain=evm&wallet=trust&redirect=${redirectPath}`)}`;
      }
      
      if (walletUrl) {
        window.open(walletUrl, '_blank');
      }
    }
  };

  if (!selectedChain) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-crypto text-lg font-bold text-foreground">ANSLUT PLÅNBOK</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center mb-6">
            Välj vilken blockchain du vill ansluta till
          </p>

          <Button
            onClick={() => handleChainSelect('solana')}
            className="w-full h-16 flex items-center justify-between text-left bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 hover:border-purple-500/50 hover:from-purple-600/30 hover:to-purple-700/30 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center overflow-hidden">
                <img 
                  src={solanaLogo} 
                  alt="Solana" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <div className="font-crypto font-bold">SOLANA</div>
              </div>
            </div>
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Button>

          <Button
            onClick={() => handleChainSelect('ethereum')}
            className="w-full h-16 flex items-center justify-between text-left bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 hover:border-blue-500/50 hover:from-blue-600/30 hover:to-blue-700/30 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center overflow-hidden">
                <img 
                  src={ethereumLogo} 
                  alt="Ethereum" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <div className="font-crypto font-bold">ETHEREUM</div>
              </div>
            </div>
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Button>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="text-xs text-muted-foreground">
              Genom att ansluta godkänner du våra användarvillkor. Din plånbok kommer att öppnas i en säker miljö.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedChain(null)} className="p-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-crypto text-lg font-bold text-foreground">
          VÄLJ {selectedChain === 'solana' ? 'SOLANA' : 'ETHEREUM'} PLÅNBOK
        </h2>
      </div>

      <div className="space-y-4">
        {selectedChain === 'solana' && (
          <Button
            onClick={() => handleWalletConnect('phantom')}
            className="w-full h-16 flex items-center justify-between text-left bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 hover:border-purple-500/50 hover:from-purple-600/30 hover:to-purple-700/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center overflow-hidden">
                <img 
                  src={phantomLogo} 
                  alt="Phantom Wallet" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <div className="font-crypto font-bold text-white">PHANTOM</div>
              </div>
            </div>
            <ExternalLink className="h-5 w-5 text-purple-400" />
          </Button>
        )}

        {selectedChain === 'ethereum' && (
          <>
            <Button
              onClick={() => handleWalletConnect('metamask')}
              className="w-full h-16 flex items-center justify-between text-left bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-500/30 hover:border-orange-500/50 hover:from-orange-600/30 hover:to-orange-700/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={metamaskLogo} 
                    alt="MetaMask" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="font-crypto font-bold text-white">METAMASK</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-orange-400" />
            </Button>

            <Button
              onClick={() => handleWalletConnect('trust')}
              className="w-full h-16 flex items-center justify-between text-left bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 hover:border-blue-500/50 hover:from-blue-600/30 hover:to-blue-700/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={trustwalletLogo} 
                    alt="Trust Wallet" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="font-crypto font-bold text-white">TRUST WALLET</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-blue-400" />
            </Button>
          </>
        )}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/30">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="text-xs text-muted-foreground">
            Du kommer att signera ett meddelande för att bekräfta din identitet. Detta kostar ingen gas och är helt säkert.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletConnect;