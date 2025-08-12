import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { mainnet } from 'viem/chains';
import { injected } from 'wagmi/connectors';


// Chains we support initially
const chains = [mainnet] as const;

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  

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
    ];

    return createConfig({
      chains: [...chains],
      transports,
      connectors,
      multiInjectedProviderDiscovery: true,
      ssr: false,
      storage: createStorage({ storage: typeof window !== 'undefined' ? window.localStorage : undefined }) as any,
    });
  }, []);

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
