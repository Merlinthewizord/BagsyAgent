import { Logger } from 'winston';
import { OdinBotClient, MirrorWallet } from './OdinBotClient';
import { getQualifiedWallets, KOLWallet } from '../data/kol-wallets';
import { ApiReporter } from './ApiReporter';

/**
 * Manages automated copy trading via OdinBot
 * Syncs mirrors with top performing KOL wallets
 */
export class CopyTradingManager {
  private odinBot: OdinBotClient;
  private logger: Logger;
  private apiReporter: ApiReporter;
  private lastSyncTime: number = 0;
  private syncIntervalMs: number;
  private defaultBuyAmount: number;
  private defaultSellPercentage: number;

  constructor(
    odinBot: OdinBotClient,
    apiReporter: ApiReporter,
    logger: Logger,
    syncIntervalHours: number = 24,
    defaultBuyAmount: number = 0.01,
    defaultSellPercentage: number = 100
  ) {
    this.odinBot = odinBot;
    this.logger = logger;
    this.apiReporter = apiReporter;
    this.syncIntervalMs = syncIntervalHours * 3600000;
    this.defaultBuyAmount = defaultBuyAmount;
    this.defaultSellPercentage = defaultSellPercentage;
  }

  /**
   * Check if it's time to sync mirrors
   */
  shouldSync(): boolean {
    const now = Date.now();
    return now - this.lastSyncTime >= this.syncIntervalMs;
  }

  /**
   * Get all wallets to mirror from curated list
   */
  getWalletsToMirror(maxWallets: number = 314): KOLWallet[] {
    // Return all wallets from our curated list (no filtering needed)
    const allWallets = getQualifiedWallets();

    // Return up to maxWallets (default 314 to include all)
    return allWallets.slice(0, maxWallets);
  }

  /**
   * Convert KOL wallet to OdinBot mirror format
   */
  private kolToMirror(kol: KOLWallet): MirrorWallet {
    // Always use fixed buy amount of 0.01 SOL per trade
    const buyAmount = this.defaultBuyAmount;

    return {
      address: kol.address,
      enabled: true,
      buyAmount,
      sellPercentage: this.defaultSellPercentage,
      notes: `Auto-mirror: ${kol.name || 'Unknown'} | Win Rate: ${kol.winRate?.toFixed(1) || 'N/A'}% | PnL: ${kol.totalPnL?.toFixed(2) || 'N/A'} SOL`
    };
  }

  /**
   * Sync OdinBot mirrors with top performing KOL wallets
   */
  async syncMirrors(): Promise<void> {
    if (!this.odinBot.isEnabled()) {
      this.logger.debug('OdinBot is disabled, skipping mirror sync');
      return;
    }

    this.logger.info('🔄 Starting OdinBot mirror sync...');

    try {
      // Get all wallets to mirror from curated list
      const topWallets = this.getWalletsToMirror(314);

      if (topWallets.length === 0) {
        this.logger.warn('No qualified wallets found to mirror');
        return;
      }

      this.logger.info(`Found ${topWallets.length} top performing wallets to mirror`);

      // Convert to mirror format
      const desiredMirrors = topWallets.map(w => this.kolToMirror(w));

      // Log top 5
      this.logger.info('Top 5 wallets being mirrored:');
      topWallets.slice(0, 5).forEach((w, i) => {
        this.logger.info(`  ${i + 1}. ${w.name || w.address.slice(0, 8)} - Win: ${w.winRate?.toFixed(1) || 'N/A'}%, PnL: ${w.totalPnL?.toFixed(2) || 'N/A'} SOL, Trades: ${w.numTrades || 'N/A'}`);
      });

      // Sync with OdinBot
      const stats = await this.odinBot.syncMirrors(desiredMirrors);

      this.logger.info('✓ Mirror sync complete', stats);

      // Report to API
      this.apiReporter.reportThought({
        type: 'decision',
        content: `🔄 Synced copy trading mirrors: ${stats.added} added, ${stats.removed} removed, ${stats.kept} kept. Now mirroring ${topWallets.length} top KOL wallets.`,
        sentiment: 'neutral'
      });

      this.lastSyncTime = Date.now();

    } catch (error: any) {
      this.logger.error('Error syncing mirrors', {
        error: error.message,
        stack: error.stack
      });

      this.apiReporter.reportThought({
        type: 'reflection',
        content: `❌ Failed to sync copy trading mirrors: ${error.message}`,
        sentiment: 'cautious'
      });
    }
  }

  /**
   * Get current mirror status
   */
  async getMirrorStatus(): Promise<{
    totalMirrors: number;
    enabledMirrors: number;
    lastSync: number;
    nextSync: number;
  }> {
    if (!this.odinBot.isEnabled()) {
      return {
        totalMirrors: 0,
        enabledMirrors: 0,
        lastSync: 0,
        nextSync: 0
      };
    }

    const mirrors = await this.odinBot.getAllMirrors();

    return {
      totalMirrors: mirrors.length,
      enabledMirrors: mirrors.filter(m => m.enabled).length,
      lastSync: this.lastSyncTime,
      nextSync: this.lastSyncTime + this.syncIntervalMs
    };
  }

  /**
   * Force an immediate sync
   */
  async forceSyncNow(): Promise<void> {
    this.lastSyncTime = 0; // Reset to force sync
    await this.syncMirrors();
  }

  /**
   * Check and sync if needed (call this in main loop)
   */
  async checkAndSync(): Promise<void> {
    if (this.shouldSync()) {
      await this.syncMirrors();
    } else {
      const nextSyncIn = Math.round((this.lastSyncTime + this.syncIntervalMs - Date.now()) / 3600000);
      this.logger.debug(`Next mirror sync in ${nextSyncIn} hours`);
    }
  }
}
