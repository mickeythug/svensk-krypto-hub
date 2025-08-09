import React from 'react';

export default function JupiterSwapWidget({ height = 660 }: { height?: number }) {
  return (
    <section aria-labelledby="jupiter-swap-title" className="w-full">
      <h2 id="jupiter-swap-title" className="sr-only">Köp och sälj tokens på Solana via Jupiter</h2>
      <iframe
        title="Jupiter Swap Widget – Köp/Sälj på Solana"
        src="https://jup.ag/swap-widget?theme=dark&defaultInputMint=So11111111111111111111111111111111111111112"
        style={{ width: '100%', height, border: '0', borderRadius: 12 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <link rel="canonical" href="https://jup.ag/swap" />
    </section>
  );
}
