export interface Config {
  duneApiKey: string;
  bagsApiKey: string;
  bagsApiUrl: string;
  solanaRpcUrl: string;
  walletPrivateKey: string;
  maxPositionSizeSol: number;
  maxTotalPortfolioSol: number;
  minLiquidityUsd: number;
  slippageBps: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  checkIntervalSeconds: number;
  kolBuyMinAmountSol: number;
  trendingTokenMinVolume24h: number;
  signalScoreThreshold: number;
  logLevel: string;
}

export interface KOLBuy {
  tokenAddress: string;
  tokenSymbol: string;
  kolWallet: string;
  amountSol: number;
  timestamp: number;
  txSignature?: string;
}

export interface TrendingToken {
  tokenAddress: string;
  tokenSymbol: string;
  marketCap?: number;
  volume24h: number;
  priceChange24h?: number;
  source: string;
  timestamp: number;
}

export interface TokenSignal {
  tokenAddress: string;
  tokenSymbol: string;
  score: number;
  signals: string[];
  kolBuys: KOLBuy[];
  trendingData: TrendingToken[];
  consensusBuyCount?: number; // Number of KOLs who bought this token
  consensusKOLs?: string[]; // Names of KOLs who bought
  timestamp: number;
}

export interface Position {
  tokenAddress: string;
  tokenSymbol: string;
  entryPrice: number;
  currentPrice: number;
  amountSol: number;
  tokenAmount: number;
  entryTime: number;
  stopLoss: number;
  takeProfit: number;
  pnlPercentage: number;
}

export interface TradeQuote {
  inputMint: string;
  outputMint: string;
  amount: string;
  expectedOutput: string;
  minOutput: string;
  priceImpact: number;
  route: any;
  requestId: string;
}

export interface Trade {
  type: 'buy' | 'sell';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol: number;
  expectedTokens?: number;
  txSignature?: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}
