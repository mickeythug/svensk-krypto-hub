export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const SOL_TOKENS: Record<string, { mint: string; decimals: number }> = {
  SOL: { mint: SOL_MINT, decimals: 9 },
  BONK: { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
};

export const USDT_BY_CHAIN: Record<number, string> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
};

export const NATIVE_TOKEN_PSEUDO: Record<number, string> = {
  1: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
};
