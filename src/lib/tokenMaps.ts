export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const SOL_TOKENS: Record<string, { mint: string; decimals: number }> = {
  SOL: { mint: SOL_MINT, decimals: 9 },
  BONK: { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5 },
  USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
};

export const USDT_BY_CHAIN: Record<number, string> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
  56: '0x55d398326f99059fF775485246999027B3197955', // BSC
  137: '0xC2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
  42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
  8453: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Base USDC (fallback, USDT not native on Base); adjust as needed
  10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism
};

export const NATIVE_TOKEN_PSEUDO: Record<number, string> = {
  1: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  56: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  137: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  42161: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  8453: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  10: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
};
