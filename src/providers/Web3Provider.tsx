import React, { useEffect, useMemo, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, base, optimism } from 'viem/chains';
import { walletConnect } from 'wagmi/connectors';
import { injected } from 'wagmi/connectors';
import { supabase } from '@/lib/supabase';

// Chains we support initially
const chains = [mainnet, bsc, polygon, arbitrum, base, optimism] as const;

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
      const url = c.rpcUrls.default.http[0];
      transports[c.id] = http(url);
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
    });
  }, [projectId]);

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
