import { Logger } from 'winston';
import { DuneClient } from './DuneClient';
import { KOL_WALLETS, getKOLName } from '../data/kol-wallets';

export interface TokenConsensus {
  tokenAddress: string;
  tokenSymbol: string;
  buyCount: number; // Number of different KOLs who bought this token
  kolBuyers: string[]; // Names of KOLs who bought
  totalAmountSol: number; // Total SOL spent by all KOLs
  recentBuys: {
    kolName: string;
    amountSol: number;
    timestamp: number;
  }[];
}

export class KOLConsensusTracker {
  private logger: Logger;
  private duneClient: DuneClient;
  private consensusThreshold: number;
  private cache: Map<string, TokenConsensus>;
  private lastUpdate: number;
  private cacheValidityMs: number;

  constructor(
    duneClient: DuneClient,
    logger: Logger,
    consensusThreshold: number = 2,
    cacheValidityMs: number = 300000 // 5 minutes
  ) {
    this.logger = logger;
    this.duneClient = duneClient;
    this.consensusThreshold = consensusThreshold;
    this.cache = new Map();
    this.lastUpdate = 0;
    this.cacheValidityMs = cacheValidityMs;
  }

  /**
   * Fetch and analyze KOL consensus on tokens
   * Returns tokens that have been bought by 2+ different KOLs
   */
  async getConsensusSignals(): Promise<TokenConsensus[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (now - this.lastUpdate < this.cacheValidityMs && this.cache.size > 0) {
      this.logger.debug('Using cached consensus data');
      return Array.from(this.cache.values()).filter(
        token => token.buyCount >= this.consensusThreshold
      );
    }

    this.logger.info(`Fetching KOL transactions for ${KOL_WALLETS.length} wallets...`);

    // Track token purchases by KOL
    const tokenPurchases = new Map<string, {
      symbol: string;
      buyers: Set<string>;
      amounts: Map<string, number>;
      timestamps: Map<string, number>;
    }>();

    // Fetch transactions for each KOL wallet (with rate limiting)
    let processedWallets = 0;
    const batchSize = 10; // Process 10 wallets at a time to avoid rate limits

    for (let i = 0; i < KOL_WALLETS.length; i += batchSize) {
      const batch = KOL_WALLETS.slice(i, i + batchSize);

      const batchPromises = batch.map(async (kol) => {
        try {
          // Create a temporary DuneClient instance for each wallet
          const walletDuneClient = new DuneClient(
            process.env.DUNE_API_KEY || '',
            this.logger,
            kol.address
          );

          const kolBuys = await walletDuneClient.getRecentKOLBuys(20);

          processedWallets++;

          if (kolBuys.length > 0) {
            this.logger.debug(`Found ${kolBuys.length} buys for ${kol.name}`);
          }

          // Process each buy
          for (const buy of kolBuys) {
            if (!buy.tokenAddress || buy.tokenAddress === '') continue;

            if (!tokenPurchases.has(buy.tokenAddress)) {
              tokenPurchases.set(buy.tokenAddress, {
                symbol: buy.tokenSymbol,
                buyers: new Set(),
                amounts: new Map(),
                timestamps: new Map()
              });
            }

            const tokenData = tokenPurchases.get(buy.tokenAddress)!;
            tokenData.buyers.add(kol.name);
            tokenData.amounts.set(kol.name, buy.amountSol);
            tokenData.timestamps.set(kol.name, buy.timestamp);
          }
        } catch (error: any) {
          this.logger.error(`Error fetching trades for ${kol.name}`, {
            error: error.message
          });
        }
      });

      await Promise.all(batchPromises);

      // Log progress
      this.logger.info(`Processed ${processedWallets}/${KOL_WALLETS.length} KOL wallets...`);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < KOL_WALLETS.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Build consensus signals
    this.cache.clear();
    const consensusSignals: TokenConsensus[] = [];

    for (const [tokenAddress, data] of tokenPurchases.entries()) {
      const buyCount = data.buyers.size;

      if (buyCount >= this.consensusThreshold) {
        const recentBuys = Array.from(data.buyers).map(kolName => ({
          kolName,
          amountSol: data.amounts.get(kolName) || 0,
          timestamp: data.timestamps.get(kolName) || 0
        })).sort((a, b) => b.timestamp - a.timestamp);

        const totalAmountSol = recentBuys.reduce((sum, buy) => sum + buy.amountSol, 0);

        const consensus: TokenConsensus = {
          tokenAddress,
          tokenSymbol: data.symbol,
          buyCount,
          kolBuyers: Array.from(data.buyers),
          totalAmountSol,
          recentBuys
        };

        consensusSignals.push(consensus);
        this.cache.set(tokenAddress, consensus);
      }
    }

    // Sort by buy count (most consensus first)
    consensusSignals.sort((a, b) => b.buyCount - a.buyCount);

    this.lastUpdate = now;

    this.logger.info(`Found ${consensusSignals.length} tokens with KOL consensus (${this.consensusThreshold}+ buyers)`);

    if (consensusSignals.length > 0) {
      this.logger.info('Top consensus tokens:');
      consensusSignals.slice(0, 5).forEach((token, index) => {
        this.logger.info(`  ${index + 1}. ${token.tokenSymbol} - ${token.buyCount} KOLs bought (${token.kolBuyers.join(', ')})`);
      });
    }

    return consensusSignals;
  }

  /**
   * Get consensus signal for a specific token
   */
  getConsensusForToken(tokenAddress: string): TokenConsensus | undefined {
    return this.cache.get(tokenAddress);
  }

  /**
   * Clear the cache and force a refresh on next call
   */
  clearCache(): void {
    this.cache.clear();
    this.lastUpdate = 0;
    this.logger.debug('KOL consensus cache cleared');
  }

  /**
   * Set the consensus threshold (minimum number of KOLs required)
   */
  setConsensusThreshold(threshold: number): void {
    this.consensusThreshold = threshold;
    this.logger.info(`Consensus threshold set to ${threshold} KOLs`);
  }
}
