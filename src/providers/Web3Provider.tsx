import React, { useEffect, useMemo, useState } from 'react';
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet } from 'viem/chains';
import { walletConnect } from 'wagmi/connectors';
import { injected } from 'wagmi/connectors';
import { supabase } from '@/integrations/supabase/client';


// Chains we support initially
const chains = [mainnet] as const;

function useWalletConnectProjectId() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.functions
      .invoke('wc-project')
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setError(error.message || 'Kunde inte hämta WalletConnect Project ID');
        } else if (data?.projectId) {
          setProjectId(data.projectId);
        } else {
          setError('Ogiltigt svar från wc-project');
        }
      })
      .catch((e) => {
        if (!mounted) return;
        setError(String(e));
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { projectId, error };
}

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const { projectId } = useWalletConnectProjectId();

  const config = useMemo(() => {
    const transports: Record<number, ReturnType<typeof http>> = {};
    for (const c of chains) {
      if (c.id === mainnet.id) {
        transports[c.id] = http('https://virulent-lingering-bird.quiknode.pro/a906d4dfb530b9c74d895b2f9b3a67850d0f92f4/');
      } else {
        const url = c.rpcUrls.default.http[0];
        transports[c.id] = http(url);
      }
    }
    const connectors = [
      injected({ shimDisconnect: true }),
      ...(projectId
        ? [walletConnect({ projectId, showQrModal: true })]
        : []),
    ];

    return createConfig({
      chains: [...chains],
      transports,
      connectors,
      multiInjectedProviderDiscovery: true,
      ssr: false,
      storage: createStorage({ storage: typeof window !== 'undefined' ? window.localStorage : undefined }) as any,
    });
  }, [projectId]);

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
