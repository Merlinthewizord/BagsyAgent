import { KOLBuy, TrendingToken, TokenSignal } from '../types';
import { Logger } from 'winston';

export class SignalAnalyzer {
  private logger: Logger;
  private tokenSignals: Map<string, TokenSignal> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  analyzeSignals(
    kolBuys: KOLBuy[],
    trendingTokens: TrendingToken[],
    minKolBuyAmount: number,
    minVolume24h: number
  ): TokenSignal[] {
    this.logger.info('Analyzing trading signals');

    const tokenMap = new Map<string, {
      kolBuys: KOLBuy[];
      trendingData: TrendingToken[];
    }>();

    // Aggregate KOL buys by token
    for (const kolBuy of kolBuys) {
      if (kolBuy.amountSol < minKolBuyAmount) continue;

      if (!tokenMap.has(kolBuy.tokenAddress)) {
        tokenMap.set(kolBuy.tokenAddress, { kolBuys: [], trendingData: [] });
      }
      tokenMap.get(kolBuy.tokenAddress)!.kolBuys.push(kolBuy);
    }

    // Aggregate trending data by token
    for (const trending of trendingTokens) {
      if (trending.volume24h < minVolume24h) continue;

      if (!tokenMap.has(trending.tokenAddress)) {
        tokenMap.set(trending.tokenAddress, { kolBuys: [], trendingData: [] });
      }
      tokenMap.get(trending.tokenAddress)!.trendingData.push(trending);
    }

    // Calculate signals and scores
    const signals: TokenSignal[] = [];

    for (const [tokenAddress, data] of tokenMap.entries()) {
      const signal = this.calculateTokenSignal(tokenAddress, data.kolBuys, data.trendingData);
      if (signal.score > 0) {
        signals.push(signal);
        this.tokenSignals.set(tokenAddress, signal);
      }
    }

    // Sort by score descending
    signals.sort((a, b) => b.score - a.score);

    this.logger.info(`Generated ${signals.length} trading signals`);

    return signals;
  }

  private calculateTokenSignal(
    tokenAddress: string,
    kolBuys: KOLBuy[],
    trendingData: TrendingToken[]
  ): TokenSignal {
    let score = 0;
    const signals: string[] = [];

    // KOL buy signals (up to 5 points)
    if (kolBuys.length > 0) {
      const recentKolBuys = kolBuys.filter(
        k => Date.now() - k.timestamp < 3600000 // Last hour
      );

      if (recentKolBuys.length >= 3) {
        score += 5;
        signals.push(`${recentKolBuys.length} KOL buys in last hour`);
      } else if (recentKolBuys.length >= 1) {
        score += 3;
        signals.push(`${recentKolBuys.length} KOL buy(s) in last hour`);
      }

      // Large KOL buy bonus
      const largeKolBuy = kolBuys.find(k => k.amountSol > 5);
      if (largeKolBuy) {
        score += 2;
        signals.push(`Large KOL buy: ${largeKolBuy.amountSol.toFixed(2)} SOL`);
      }
    }

    // Trending signals (up to 5 points)
    if (trendingData.length > 0) {
      const avgVolume = trendingData.reduce((sum, t) => sum + t.volume24h, 0) / trendingData.length;

      if (avgVolume > 500000) {
        score += 5;
        signals.push(`High volume: $${(avgVolume / 1000).toFixed(0)}k`);
      } else if (avgVolume > 100000) {
        score += 3;
        signals.push(`Good volume: $${(avgVolume / 1000).toFixed(0)}k`);
      }

      // Multiple source confirmation
      const sources = new Set(trendingData.map(t => t.source));
      if (sources.size >= 2) {
        score += 2;
        signals.push(`Trending on ${sources.size} sources`);
      }
    }

    // Price momentum (up to 3 points)
    const priceChangeData = trendingData.filter(t => t.priceChange24h !== undefined);
    if (priceChangeData.length > 0) {
      const avgPriceChange = priceChangeData.reduce(
        (sum, t) => sum + (t.priceChange24h || 0),
        0
      ) / priceChangeData.length;

      if (avgPriceChange > 50) {
        score += 3;
        signals.push(`Strong momentum: +${avgPriceChange.toFixed(1)}%`);
      } else if (avgPriceChange > 20) {
        score += 2;
        signals.push(`Positive momentum: +${avgPriceChange.toFixed(1)}%`);
      }
    }

    // Market cap filter (reduce score if too high)
    const marketCapData = trendingData.filter(t => t.marketCap !== undefined);
    if (marketCapData.length > 0) {
      const avgMarketCap = marketCapData.reduce(
        (sum, t) => sum + (t.marketCap || 0),
        0
      ) / marketCapData.length;

      if (avgMarketCap > 10000000) {
        score -= 2;
        signals.push(`High market cap: $${(avgMarketCap / 1000000).toFixed(1)}M`);
      }
    }

    const tokenSymbol = kolBuys[0]?.tokenSymbol || trendingData[0]?.tokenSymbol || 'UNKNOWN';

    return {
      tokenAddress,
      tokenSymbol,
      score: Math.max(0, score),
      signals,
      kolBuys,
      trendingData,
      timestamp: Date.now()
    };
  }

  getTokenSignal(tokenAddress: string): TokenSignal | undefined {
    return this.tokenSignals.get(tokenAddress);
  }

  clearOldSignals(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [address, signal] of this.tokenSignals.entries()) {
      if (now - signal.timestamp > maxAge) {
        this.tokenSignals.delete(address);
      }
    }
  }
}
