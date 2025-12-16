import { Logger } from 'winston';
import { Mem0Client } from './Mem0Client';
import { KOLWallet } from '../data/kol-wallets';

export interface WalletPerformance {
  address: string;
  name?: string;
  totalTrades: number;
  successfulTrades: number;
  totalProfitSol: number;
  averageReturn: number;
  winRate: number;
  lastTradeDate: string;
  performanceScore: number;
}

/**
 * Tracks and learns from winning wallet addresses using Mem0
 * Builds institutional knowledge about profitable wallets over time
 */
export class WalletMemoryTracker {
  private mem0: Mem0Client;
  private logger: Logger;
  private performanceCache: Map<string, WalletPerformance>;

  constructor(mem0Client: Mem0Client, logger: Logger) {
    this.mem0 = mem0Client;
    this.logger = logger;
    this.performanceCache = new Map();
  }

  /**
   * Store a winning wallet to long-term memory
   */
  async storeWinningWallet(wallet: KOLWallet, reason: string): Promise<void> {
    if (!this.mem0.isEnabled()) {
      return;
    }

    try {
      const memory = `Winning wallet discovered: ${wallet.name || wallet.address.slice(0, 8)}. ` +
        `Win rate: ${wallet.winRate?.toFixed(1)}%, ` +
        `Total profit: ${wallet.totalPnL?.toFixed(2)} SOL, ` +
        `Trades: ${wallet.numTrades}, ` +
        `ROI: ${wallet.roi?.toFixed(1)}%. ` +
        `Reason: ${reason}`;

      const metadata = {
        type: 'winning_wallet',
        address: wallet.address,
        name: wallet.name,
        winRate: wallet.winRate,
        totalPnL: wallet.totalPnL,
        numTrades: wallet.numTrades,
        roi: wallet.roi,
        avgTradeSize: wallet.avgTradeSize,
        lastActive: wallet.lastActive,
        discoveredAt: new Date().toISOString(),
        reason
      };

      await this.mem0.addMemory(memory, metadata);

      this.logger.info(`Stored winning wallet to memory: ${wallet.name || wallet.address.slice(0, 8)}`, {
        winRate: wallet.winRate,
        profit: wallet.totalPnL
      });

    } catch (error: any) {
      this.logger.error('Error storing winning wallet', {
        address: wallet.address,
        error: error.message
      });
    }
  }

  /**
   * Store a batch of winning wallets
   */
  async storeWinningWallets(wallets: KOLWallet[], reason: string): Promise<number> {
    if (!this.mem0.isEnabled()) {
      return 0;
    }

    let stored = 0;

    for (const wallet of wallets) {
      await this.storeWinningWallet(wallet, reason);
      stored++;
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.info(`Stored ${stored} winning wallets to memory`);
    return stored;
  }

  /**
   * Search for similar winning wallets in memory
   */
  async findSimilarWinners(query: string, limit: number = 5): Promise<any[]> {
    if (!this.mem0.isEnabled()) {
      return [];
    }

    try {
      const results = await this.mem0.searchMemories({
        query,
        limit
      });

      this.logger.debug(`Found ${results.length} similar winners for query: ${query.slice(0, 50)}`);

      return results.map(r => ({
        memory: r.memory,
        score: r.score,
        address: r.metadata?.address,
        name: r.metadata?.name,
        winRate: r.metadata?.winRate,
        profit: r.metadata?.totalPnL,
        trades: r.metadata?.numTrades
      }));

    } catch (error: any) {
      this.logger.error('Error searching for similar winners', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Get all winning wallets from memory
   */
  async getAllWinningWallets(): Promise<any[]> {
    if (!this.mem0.isEnabled()) {
      return [];
    }

    try {
      const memories = await this.mem0.getAllMemories();

      return memories
        .filter(m => m.metadata?.type === 'winning_wallet')
        .map(m => ({
          address: m.metadata?.address,
          name: m.metadata?.name,
          winRate: m.metadata?.winRate,
          totalPnL: m.metadata?.totalPnL,
          numTrades: m.metadata?.numTrades,
          roi: m.metadata?.roi,
          discoveredAt: m.metadata?.discoveredAt,
          reason: m.metadata?.reason
        }))
        .sort((a, b) => (b.winRate || 0) - (a.winRate || 0));

    } catch (error: any) {
      this.logger.error('Error fetching all winning wallets', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Record a trade outcome for learning
   */
  async recordTradeOutcome(
    walletAddress: string,
    tokenAddress: string,
    profitable: boolean,
    profitSol: number
  ): Promise<void> {
    if (!this.mem0.isEnabled()) {
      return;
    }

    try {
      const outcome = profitable ? 'profitable' : 'loss';
      const memory = `Trade ${outcome}: Wallet ${walletAddress.slice(0, 8)} traded token ${tokenAddress.slice(0, 8)}. ` +
        `Profit: ${profitSol.toFixed(4)} SOL. ` +
        `This ${profitable ? 'validates' : 'questions'} the wallet's reliability.`;

      const metadata = {
        type: 'trade_outcome',
        walletAddress,
        tokenAddress,
        profitable,
        profitSol,
        timestamp: new Date().toISOString()
      };

      await this.mem0.addMemory(memory, metadata);

      this.logger.debug(`Recorded ${outcome} trade for wallet ${walletAddress.slice(0, 8)}`);

    } catch (error: any) {
      this.logger.error('Error recording trade outcome', {
        error: error.message
      });
    }
  }

  /**
   * Get insights about a specific wallet from memory
   */
  async getWalletInsights(walletAddress: string): Promise<string[]> {
    if (!this.mem0.isEnabled()) {
      return [];
    }

    try {
      const results = await this.mem0.searchMemories({
        query: `Wallet ${walletAddress} performance history trades outcomes`,
        limit: 10
      });

      return results.map(r => r.memory);

    } catch (error: any) {
      this.logger.error('Error fetching wallet insights', {
        address: walletAddress,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Store market insight or pattern
   */
  async storeMarketInsight(insight: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.mem0.isEnabled()) {
      return;
    }

    try {
      const fullMetadata = {
        type: 'market_insight',
        timestamp: new Date().toISOString(),
        ...metadata
      };

      await this.mem0.addMemory(insight, fullMetadata);

      this.logger.debug('Stored market insight to memory');

    } catch (error: any) {
      this.logger.error('Error storing market insight', {
        error: error.message
      });
    }
  }

  /**
   * Get recent market insights
   */
  async getMarketInsights(query: string, limit: number = 5): Promise<string[]> {
    if (!this.mem0.isEnabled()) {
      return [];
    }

    try {
      const results = await this.mem0.searchMemories({
        query: `Market insights: ${query}`,
        limit
      });

      return results.map(r => r.memory);

    } catch (error: any) {
      this.logger.error('Error fetching market insights', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Analyze and learn from consensus patterns
   */
  async learnFromConsensus(
    tokenSymbol: string,
    kolWallets: string[],
    outcome: 'pending' | 'success' | 'failure',
    profitSol?: number
  ): Promise<void> {
    if (!this.mem0.isEnabled()) {
      return;
    }

    try {
      const memory = `Consensus signal for ${tokenSymbol}: ${kolWallets.length} KOLs bought. ` +
        `Wallets: ${kolWallets.slice(0, 3).join(', ')}${kolWallets.length > 3 ? '...' : ''}. ` +
        `Outcome: ${outcome}` +
        (profitSol !== undefined ? `, Profit: ${profitSol.toFixed(4)} SOL` : '');

      const metadata = {
        type: 'consensus_pattern',
        tokenSymbol,
        kolWallets,
        kolCount: kolWallets.length,
        outcome,
        profitSol,
        timestamp: new Date().toISOString()
      };

      await this.mem0.addMemory(memory, metadata);

      this.logger.debug(`Learned from consensus signal: ${tokenSymbol}`);

    } catch (error: any) {
      this.logger.error('Error learning from consensus', {
        token: tokenSymbol,
        error: error.message
      });
    }
  }

  /**
   * Get statistics about stored knowledge
   */
  async getMemoryStats(): Promise<{
    totalMemories: number;
    winningWallets: number;
    tradeOutcomes: number;
    marketInsights: number;
    consensusPatterns: number;
  }> {
    if (!this.mem0.isEnabled()) {
      return {
        totalMemories: 0,
        winningWallets: 0,
        tradeOutcomes: 0,
        marketInsights: 0,
        consensusPatterns: 0
      };
    }

    try {
      const memories = await this.mem0.getAllMemories();

      const stats = {
        totalMemories: memories.length,
        winningWallets: memories.filter(m => m.metadata?.type === 'winning_wallet').length,
        tradeOutcomes: memories.filter(m => m.metadata?.type === 'trade_outcome').length,
        marketInsights: memories.filter(m => m.metadata?.type === 'market_insight').length,
        consensusPatterns: memories.filter(m => m.metadata?.type === 'consensus_pattern').length
      };

      this.logger.debug('Memory stats retrieved', stats);

      return stats;

    } catch (error: any) {
      this.logger.error('Error fetching memory stats', {
        error: error.message
      });
      return {
        totalMemories: 0,
        winningWallets: 0,
        tradeOutcomes: 0,
        marketInsights: 0,
        consensusPatterns: 0
      };
    }
  }
}
