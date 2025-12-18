export interface BagsyThought {
  id: string;
  timestamp: number;
  type: 'analysis' | 'decision' | 'trade' | 'reflection' | 'goal';
  content: string;
  relatedToken?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'excited' | 'cautious';
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  role: 'user' | 'bagsy';
  content: string;
  userName?: string;
}

export interface TradeActivity {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol: number;
  tokenAmount?: number;
  price?: number;
  txSignature?: string;
  reason?: string;
  pnl?: number;
  fee?: number;
}

export interface PortfolioStats {
  totalValueSol: number;
  totalValueUsd: number;
  positions: number;
  pnl24h: number;
  pnlAllTime: number;
  winRate: number;
  totalTrades: number;
  bagsyTokenValue?: number;
  bagsyTokenMcap?: number;
}

export interface BagsyGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  deadline?: number;
  emoji: string;
}
