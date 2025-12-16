import { Position, TokenSignal, Config } from '../types';
import { BagsClient } from './BagsClient';
import { Logger } from 'winston';

export class TradingEngine {
  private positions: Map<string, Position> = new Map();
  private bagsClient: BagsClient;
  private config: Config;
  private logger: Logger;
  private totalInvestedSol: number = 0;

  constructor(bagsClient: BagsClient, config: Config, logger: Logger) {
    this.bagsClient = bagsClient;
    this.config = config;
    this.logger = logger;
  }

  async processSignals(signals: TokenSignal[]): Promise<void> {
    this.logger.info(`Processing ${signals.length} signals`);

    for (const signal of signals) {
      if (signal.score < this.config.signalScoreThreshold) {
        continue;
      }

      // Skip if we already have a position
      if (this.positions.has(signal.tokenAddress)) {
        this.logger.debug(`Already have position in ${signal.tokenSymbol}`);
        continue;
      }

      // Check if we have room for new positions
      if (!this.canOpenNewPosition()) {
        this.logger.warn('Cannot open new position: portfolio limit reached');
        break;
      }

      await this.openPosition(signal);
    }

    // Check existing positions for exit conditions
    await this.managePositions();
  }

  private async openPosition(signal: TokenSignal): Promise<void> {
    try {
      const positionSize = this.calculatePositionSize(signal.score);

      this.logger.info(
        `Opening position in ${signal.tokenSymbol} (${signal.tokenAddress})`,
        {
          score: signal.score,
          size: positionSize,
          signals: signal.signals
        }
      );

      const trade = await this.bagsClient.buyToken(
        signal.tokenAddress,
        positionSize,
        this.config.slippageBps
      );

      if (trade.status === 'success' && trade.txSignature) {
        const entryPrice = positionSize / (trade.expectedTokens || 1);

        const position: Position = {
          tokenAddress: signal.tokenAddress,
          tokenSymbol: signal.tokenSymbol,
          entryPrice,
          currentPrice: entryPrice,
          amountSol: positionSize,
          tokenAmount: trade.expectedTokens || 0,
          entryTime: Date.now(),
          stopLoss: entryPrice * (1 - this.config.stopLossPercentage / 100),
          takeProfit: entryPrice * (1 + this.config.takeProfitPercentage / 100),
          pnlPercentage: 0
        };

        this.positions.set(signal.tokenAddress, position);
        this.totalInvestedSol += positionSize;

        this.logger.info(`Position opened successfully`, {
          symbol: signal.tokenSymbol,
          txSignature: trade.txSignature,
          entryPrice,
          stopLoss: position.stopLoss,
          takeProfit: position.takeProfit
        });
      } else {
        this.logger.error(`Failed to open position in ${signal.tokenSymbol}`, {
          error: trade.error
        });
      }
    } catch (error: any) {
      this.logger.error(`Error opening position`, {
        symbol: signal.tokenSymbol,
        error: error.message
      });
    }
  }

  private async managePositions(): Promise<void> {
    for (const [address, position] of this.positions.entries()) {
      try {
        // In a real implementation, you would fetch the current price
        // For now, we'll use a placeholder
        const currentPrice = await this.getCurrentPrice(address);

        position.currentPrice = currentPrice;
        position.pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

        this.logger.debug(`Position status: ${position.tokenSymbol}`, {
          entryPrice: position.entryPrice,
          currentPrice: position.currentPrice,
          pnl: position.pnlPercentage.toFixed(2) + '%'
        });

        // Check stop loss
        if (currentPrice <= position.stopLoss) {
          this.logger.warn(`Stop loss hit for ${position.tokenSymbol}`);
          await this.closePosition(address, 'stop_loss');
          continue;
        }

        // Check take profit
        if (currentPrice >= position.takeProfit) {
          this.logger.info(`Take profit hit for ${position.tokenSymbol}`);
          await this.closePosition(address, 'take_profit');
          continue;
        }

        // Trailing stop: if position is up 30%+, move stop loss to break even
        if (position.pnlPercentage > 30 && position.stopLoss < position.entryPrice) {
          position.stopLoss = position.entryPrice;
          this.logger.info(`Trailing stop activated for ${position.tokenSymbol}: moved to break even`);
        }

        // Time-based exit: close after 24 hours if not hitting targets
        const positionAge = Date.now() - position.entryTime;
        if (positionAge > 86400000) { // 24 hours
          this.logger.info(`Time-based exit for ${position.tokenSymbol} (24h limit)`);
          await this.closePosition(address, 'time_limit');
        }
      } catch (error: any) {
        this.logger.error(`Error managing position ${position.tokenSymbol}`, {
          error: error.message
        });
      }
    }
  }

  private async closePosition(tokenAddress: string, reason: string): Promise<void> {
    const position = this.positions.get(tokenAddress);
    if (!position) return;

    try {
      this.logger.info(`Closing position in ${position.tokenSymbol}`, {
        reason,
        pnl: position.pnlPercentage.toFixed(2) + '%'
      });

      const tokenAmount = position.tokenAmount.toString();

      const trade = await this.bagsClient.sellToken(
        tokenAddress,
        tokenAmount,
        this.config.slippageBps
      );

      if (trade.status === 'success') {
        const returnSol = trade.amountSol;
        const profit = returnSol - position.amountSol;

        this.totalInvestedSol -= position.amountSol;
        this.positions.delete(tokenAddress);

        this.logger.info(`Position closed successfully`, {
          symbol: position.tokenSymbol,
          invested: position.amountSol.toFixed(4),
          returned: returnSol.toFixed(4),
          profit: profit.toFixed(4),
          pnl: position.pnlPercentage.toFixed(2) + '%',
          txSignature: trade.txSignature
        });
      } else {
        this.logger.error(`Failed to close position in ${position.tokenSymbol}`, {
          error: trade.error
        });
      }
    } catch (error: any) {
      this.logger.error(`Error closing position`, {
        symbol: position.tokenSymbol,
        error: error.message
      });
    }
  }

  private calculatePositionSize(signalScore: number): number {
    // Base position size
    let size = this.config.maxPositionSizeSol;

    // Adjust based on signal strength (score 7-15)
    const scoreMultiplier = Math.min(signalScore / 10, 1.5);
    size *= scoreMultiplier;

    // Don't exceed max position size
    size = Math.min(size, this.config.maxPositionSizeSol);

    // Don't exceed available portfolio allocation
    const remainingAllocation = this.config.maxTotalPortfolioSol - this.totalInvestedSol;
    size = Math.min(size, remainingAllocation);

    return Math.max(0, size);
  }

  private canOpenNewPosition(): boolean {
    return this.totalInvestedSol < this.config.maxTotalPortfolioSol;
  }

  private async getCurrentPrice(tokenAddress: string): Promise<number> {
    // In a real implementation, fetch current price from a DEX or price oracle
    // For now, return a placeholder
    // You could use Jupiter API, Birdeye, or another price service
    const position = this.positions.get(tokenAddress);
    if (!position) return 0;

    // Simulate price movement (replace with actual price fetching)
    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% random
    return position.entryPrice * (1 + randomChange);
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getPortfolioValue(): number {
    return this.totalInvestedSol;
  }

  getPositionCount(): number {
    return this.positions.size;
  }
}
