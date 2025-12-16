import { Logger } from 'winston';
import { WalletMemoryTracker } from './WalletMemoryTracker';
import { KOLWallet } from '../data/kol-wallets';
import { OdinBotClient } from './OdinBotClient';

export interface WalletScore {
  address: string;
  name?: string;
  score: number;
  testTrades: number;
  successfulTrades: number;
  totalProfitSol: number;
  averageReturn: number;
  lastUpdateTimestamp: number;
  status: 'testing' | 'approved' | 'rejected';
  discoveredAt: number;
}

/**
 * Testing-based system for wallet validation
 *
 * Workflow:
 * 1. Find potential wallets from Dune
 * 2. Test them (observe without mirroring)
 * 3. Track performance and update scores (+1 good, -1 bad)
 * 4. Only mirror wallets that prove themselves (score >= threshold)
 */
export class WalletTestingSystem {
  private memory: WalletMemoryTracker;
  private odinBot: OdinBotClient;
  private logger: Logger;
  private walletScores: Map<string, WalletScore>;

  // Scoring thresholds
  private readonly APPROVAL_THRESHOLD = 5;    // Need +5 score to approve
  private readonly REJECTION_THRESHOLD = -3;  // -3 score = rejected
  private readonly MIN_TEST_TRADES = 3;       // Minimum trades before approval

  constructor(
    memoryTracker: WalletMemoryTracker,
    odinBotClient: OdinBotClient,
    logger: Logger
  ) {
    this.memory = memoryTracker;
    this.odinBot = odinBotClient;
    this.logger = logger;
    this.walletScores = new Map();
  }

  /**
   * Add a wallet to the testing pool
   */
  async addWalletToTesting(wallet: KOLWallet): Promise<void> {
    const existingScore = this.walletScores.get(wallet.address);

    if (existingScore) {
      this.logger.debug(`Wallet ${wallet.name || wallet.address.slice(0, 8)} already in testing`);
      return;
    }

    const walletScore: WalletScore = {
      address: wallet.address,
      name: wallet.name,
      score: 0,
      testTrades: 0,
      successfulTrades: 0,
      totalProfitSol: 0,
      averageReturn: 0,
      lastUpdateTimestamp: Date.now(),
      status: 'testing',
      discoveredAt: Date.now()
    };

    this.walletScores.set(wallet.address, walletScore);

    // Store to memory
    await this.memory.storeMarketInsight(
      `Started testing wallet ${wallet.name || wallet.address.slice(0, 8)}. ` +
      `Initial metrics: Win rate ${wallet.winRate}%, PnL ${wallet.totalPnL} SOL`,
      {
        type: 'wallet_testing_start',
        address: wallet.address,
        name: wallet.name,
        initialMetrics: {
          winRate: wallet.winRate,
          totalPnL: wallet.totalPnL,
          numTrades: wallet.numTrades
        }
      }
    );

    this.logger.info(`Added wallet to testing: ${wallet.name || wallet.address.slice(0, 8)}`);
  }

  /**
   * Record a trade outcome for a wallet being tested
   */
  async recordTestTradeOutcome(
    walletAddress: string,
    tokenSymbol: string,
    profitable: boolean,
    profitSol: number,
    returnPercentage: number
  ): Promise<void> {
    const walletScore = this.walletScores.get(walletAddress);

    if (!walletScore || walletScore.status !== 'testing') {
      return;
    }

    // Update metrics
    walletScore.testTrades++;
    if (profitable) {
      walletScore.successfulTrades++;
      walletScore.score++; // +1 for profitable trade
    } else {
      walletScore.score--; // -1 for losing trade
    }
    walletScore.totalProfitSol += profitSol;
    walletScore.averageReturn =
      (walletScore.averageReturn * (walletScore.testTrades - 1) + returnPercentage) / walletScore.testTrades;
    walletScore.lastUpdateTimestamp = Date.now();

    this.walletScores.set(walletAddress, walletScore);

    // Store outcome to memory
    await this.memory.recordTradeOutcome(
      walletAddress,
      tokenSymbol,
      profitable,
      profitSol
    );

    const scoreChange = profitable ? '+1' : '-1';
    this.logger.info(
      `Test trade for ${walletScore.name || walletAddress.slice(0, 8)}: ` +
      `${profitable ? 'PROFIT' : 'LOSS'} ${profitSol.toFixed(4)} SOL. ` +
      `Score: ${walletScore.score} (${scoreChange}), ` +
      `Win rate: ${((walletScore.successfulTrades / walletScore.testTrades) * 100).toFixed(1)}%`
    );

    // Check if wallet should be approved or rejected
    await this.evaluateWalletStatus(walletAddress);
  }

  /**
   * Evaluate if a wallet should be approved, rejected, or continue testing
   */
  private async evaluateWalletStatus(walletAddress: string): Promise<void> {
    const walletScore = this.walletScores.get(walletAddress);

    if (!walletScore || walletScore.status !== 'testing') {
      return;
    }

    // Check for rejection (too many losses)
    if (walletScore.score <= this.REJECTION_THRESHOLD) {
      walletScore.status = 'rejected';
      this.walletScores.set(walletAddress, walletScore);

      await this.memory.storeMarketInsight(
        `Rejected wallet ${walletScore.name || walletAddress.slice(0, 8)} after testing. ` +
        `Final score: ${walletScore.score}, Win rate: ${((walletScore.successfulTrades / walletScore.testTrades) * 100).toFixed(1)}%, ` +
        `Total PnL: ${walletScore.totalProfitSol.toFixed(4)} SOL. Reason: Poor performance`,
        {
          type: 'wallet_rejected',
          address: walletAddress,
          finalScore: walletScore.score,
          winRate: (walletScore.successfulTrades / walletScore.testTrades) * 100,
          totalProfitSol: walletScore.totalProfitSol
        }
      );

      this.logger.warn(
        `❌ Wallet REJECTED: ${walletScore.name || walletAddress.slice(0, 8)} ` +
        `(Score: ${walletScore.score}, Win rate: ${((walletScore.successfulTrades / walletScore.testTrades) * 100).toFixed(1)}%)`
      );
      return;
    }

    // Check for approval (good performance + enough trades)
    if (
      walletScore.score >= this.APPROVAL_THRESHOLD &&
      walletScore.testTrades >= this.MIN_TEST_TRADES
    ) {
      walletScore.status = 'approved';
      this.walletScores.set(walletAddress, walletScore);

      // Add to OdinBot mirrors
      if (this.odinBot.isEnabled()) {
        const buyAmount = Math.min(
          Math.max(walletScore.averageReturn * 0.01, 0.1), // Scale with avg return
          2.0 // Max 2 SOL
        );

        await this.odinBot.createMirror({
          address: walletAddress,
          enabled: true,
          buyAmount,
          sellPercentage: 100,
          notes: `APPROVED after testing: Score ${walletScore.score}, ` +
                 `Win rate ${((walletScore.successfulTrades / walletScore.testTrades) * 100).toFixed(1)}%, ` +
                 `Avg return ${walletScore.averageReturn.toFixed(1)}%`
        });
      }

      // Store to memory as winning wallet
      await this.memory.storeWinningWallet(
        {
          address: walletAddress,
          name: walletScore.name,
          winRate: (walletScore.successfulTrades / walletScore.testTrades) * 100,
          totalPnL: walletScore.totalProfitSol,
          numTrades: walletScore.testTrades,
          roi: walletScore.averageReturn
        },
        `Passed testing phase with score ${walletScore.score}`
      );

      this.logger.info(
        `✅ Wallet APPROVED: ${walletScore.name || walletAddress.slice(0, 8)} ` +
        `(Score: ${walletScore.score}, Win rate: ${((walletScore.successfulTrades / walletScore.testTrades) * 100).toFixed(1)}%, ` +
        `Tests: ${walletScore.testTrades}) - Now mirroring on OdinBot!`
      );
    }
  }

  /**
   * Get all wallets currently being tested
   */
  getTestingWallets(): WalletScore[] {
    return Array.from(this.walletScores.values())
      .filter(w => w.status === 'testing')
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get all approved wallets
   */
  getApprovedWallets(): WalletScore[] {
    return Array.from(this.walletScores.values())
      .filter(w => w.status === 'approved')
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get wallet score
   */
  getWalletScore(address: string): WalletScore | undefined {
    return this.walletScores.get(address);
  }

  /**
   * Demote an approved wallet back to testing if performance drops
   */
  async demoteWallet(walletAddress: string, reason: string): Promise<void> {
    const walletScore = this.walletScores.get(walletAddress);

    if (!walletScore || walletScore.status !== 'approved') {
      return;
    }

    walletScore.status = 'testing';
    walletScore.score = Math.floor(walletScore.score / 2); // Reduce score by half
    this.walletScores.set(walletAddress, walletScore);

    // Remove from OdinBot
    if (this.odinBot.isEnabled()) {
      await this.odinBot.deleteMirror(walletAddress);
    }

    await this.memory.storeMarketInsight(
      `Demoted wallet ${walletScore.name || walletAddress.slice(0, 8)} back to testing. ` +
      `Reason: ${reason}. New score: ${walletScore.score}`,
      {
        type: 'wallet_demoted',
        address: walletAddress,
        reason,
        newScore: walletScore.score
      }
    );

    this.logger.warn(
      `⚠️ Wallet DEMOTED: ${walletScore.name || walletAddress.slice(0, 8)} - ${reason}`
    );
  }

  /**
   * Get testing system statistics
   */
  getStats(): {
    totalWallets: number;
    testing: number;
    approved: number;
    rejected: number;
    avgScoreTesting: number;
    avgScoreApproved: number;
  } {
    const allWallets = Array.from(this.walletScores.values());
    const testing = allWallets.filter(w => w.status === 'testing');
    const approved = allWallets.filter(w => w.status === 'approved');
    const rejected = allWallets.filter(w => w.status === 'rejected');

    const avgScoreTesting = testing.length > 0
      ? testing.reduce((sum, w) => sum + w.score, 0) / testing.length
      : 0;

    const avgScoreApproved = approved.length > 0
      ? approved.reduce((sum, w) => sum + w.score, 0) / approved.length
      : 0;

    return {
      totalWallets: allWallets.length,
      testing: testing.length,
      approved: approved.length,
      rejected: rejected.length,
      avgScoreTesting: Math.round(avgScoreTesting * 10) / 10,
      avgScoreApproved: Math.round(avgScoreApproved * 10) / 10
    };
  }

  /**
   * Load wallet scores from memory on startup
   */
  async loadFromMemory(): Promise<void> {
    try {
      // Search for winning wallets in memory
      const winningWallets = await this.memory.getAllWinningWallets();

      for (const wallet of winningWallets) {
        if (wallet.address && wallet.winRate && wallet.winRate >= 60) {
          // Auto-approve wallets from memory that meet criteria
          const walletScore: WalletScore = {
            address: wallet.address,
            name: wallet.name,
            score: Math.floor(wallet.winRate / 10), // Convert win rate to score
            testTrades: wallet.numTrades || 10,
            successfulTrades: Math.floor((wallet.numTrades || 10) * (wallet.winRate / 100)),
            totalProfitSol: wallet.totalPnL || 0,
            averageReturn: wallet.roi || 0,
            lastUpdateTimestamp: Date.now(),
            status: 'approved',
            discoveredAt: new Date(wallet.discoveredAt || Date.now()).getTime()
          };

          this.walletScores.set(wallet.address, walletScore);
        }
      }

      this.logger.info(`Loaded ${winningWallets.length} wallets from memory`);

    } catch (error: any) {
      this.logger.error('Error loading wallets from memory', {
        error: error.message
      });
    }
  }
}
