import axios, { AxiosInstance } from 'axios';
import { Logger } from 'winston';

export interface MirrorWallet {
  address: string;
  enabled?: boolean;
  buyAmount?: number;
  sellPercentage?: number;
  autoSellProfileId?: string;
  notes?: string;
}

export interface MirrorResponse {
  address: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: any;
}

export interface OdinBotControls {
  enabled?: boolean;
  defaultBuyAmount?: number;
  defaultSellPercentage?: number;
  maxSlippage?: number;
  priorityFee?: number;
}

/**
 * OdinBot API Client for automated copy trading
 * Docs: https://docs.odinbot.io/api-documentation
 */
export class OdinBotClient {
  private client: AxiosInstance;
  private logger: Logger;
  private enabled: boolean;

  constructor(apiKey: string, logger: Logger, enabled: boolean = true) {
    this.logger = logger;
    this.enabled = enabled && apiKey !== '';

    if (!this.enabled) {
      this.logger.warn('OdinBot client disabled (no API key provided)');
    }

    this.client = axios.create({
      baseURL: 'https://api.odinbot.io/v1',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Get all currently mirrored wallets
   */
  async getAllMirrors(): Promise<MirrorResponse[]> {
    if (!this.enabled) return [];

    try {
      this.logger.debug('Fetching all mirrored wallets from OdinBot');
      const response = await this.client.get('/mirrors');

      // Handle different response formats
      let mirrors = response.data;

      // If response has a 'data' or 'mirrors' property, use that
      if (mirrors && typeof mirrors === 'object') {
        if (Array.isArray(mirrors.data)) {
          mirrors = mirrors.data;
        } else if (Array.isArray(mirrors.mirrors)) {
          mirrors = mirrors.mirrors;
        }
      }

      // Ensure we return an array
      if (!Array.isArray(mirrors)) {
        this.logger.warn('OdinBot API returned non-array response', {
          responseType: typeof mirrors,
          response: mirrors
        });
        return [];
      }

      return mirrors;
    } catch (error: any) {
      this.logger.error('Error fetching mirrors from OdinBot', {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data
      });
      return [];
    }
  }

  /**
   * Get specific mirror by wallet address
   */
  async getMirror(address: string): Promise<MirrorResponse | null> {
    if (!this.enabled) return null;

    try {
      const response = await this.client.get(`/mirror/${address}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Error fetching mirror for ${address}`, {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Create a new mirror for a wallet address
   */
  async createMirror(wallet: MirrorWallet): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would create mirror for ${wallet.address}`);
      return false;
    }

    try {
      this.logger.info(`Creating mirror for wallet: ${wallet.address}`);

      const payload = {
        address: wallet.address,
        enabled: wallet.enabled !== false,
        buyAmount: wallet.buyAmount,
        sellPercentage: wallet.sellPercentage,
        autoSellProfileId: wallet.autoSellProfileId,
        notes: wallet.notes || `Auto-added by Bagsy - KOL consensus wallet`
      };

      await this.client.post('/mirror', payload);

      this.logger.info(`✓ Successfully created mirror for ${wallet.address}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to create mirror for ${wallet.address}`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return false;
    }
  }

  /**
   * Update an existing mirror
   */
  async updateMirror(address: string, updates: Partial<MirrorWallet>): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would update mirror for ${address}`);
      return false;
    }

    try {
      this.logger.info(`Updating mirror for ${address}`);
      await this.client.patch(`/mirror/${address}`, updates);
      this.logger.info(`✓ Successfully updated mirror for ${address}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to update mirror for ${address}`, {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Delete a mirror
   */
  async deleteMirror(address: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would delete mirror for ${address}`);
      return false;
    }

    try {
      this.logger.info(`Deleting mirror for ${address}`);
      await this.client.delete(`/mirror/${address}`);
      this.logger.info(`✓ Successfully deleted mirror for ${address}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to delete mirror for ${address}`, {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Batch create multiple mirrors
   */
  async createMirrorsBatch(wallets: MirrorWallet[]): Promise<{ success: number; failed: number }> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would create ${wallets.length} mirrors`);
      return { success: 0, failed: 0 };
    }

    this.logger.info(`Creating ${wallets.length} mirrors in batch...`);

    const results = {
      success: 0,
      failed: 0
    };

    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);

      const promises = batch.map(wallet =>
        this.createMirror(wallet)
          .then(success => {
            if (success) results.success++;
            else results.failed++;
          })
          .catch(() => results.failed++)
      );

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < wallets.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    this.logger.info(`Batch mirror creation complete: ${results.success} success, ${results.failed} failed`);
    return results;
  }

  /**
   * Get current OdinBot controls/settings
   */
  async getControls(): Promise<OdinBotControls | null> {
    if (!this.enabled) return null;

    try {
      const response = await this.client.get('/controls');
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching OdinBot controls', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Update OdinBot controls/settings
   */
  async updateControls(controls: OdinBotControls): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug('[DRY RUN] Would update OdinBot controls');
      return false;
    }

    try {
      await this.client.patch('/controls', controls);
      this.logger.info('✓ Successfully updated OdinBot controls');
      return true;
    } catch (error: any) {
      this.logger.error('Failed to update OdinBot controls', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Sync mirrors with a list of wallet addresses
   * Adds new wallets and removes old ones
   */
  async syncMirrors(desiredWallets: MirrorWallet[]): Promise<{
    added: number;
    removed: number;
    kept: number;
  }> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would sync ${desiredWallets.length} mirrors`);
      return { added: 0, removed: 0, kept: 0 };
    }

    this.logger.info(`Syncing mirrors with ${desiredWallets.length} desired wallets...`);

    const currentMirrors = await this.getAllMirrors();

    // Ensure currentMirrors is an array (defensive programming)
    if (!Array.isArray(currentMirrors)) {
      this.logger.error('Failed to get current mirrors - invalid response format');
      return { added: 0, removed: 0, kept: 0 };
    }

    const currentAddresses = new Set(currentMirrors.map(m => m.address));
    const desiredAddresses = new Set(desiredWallets.map(w => w.address));

    const stats = {
      added: 0,
      removed: 0,
      kept: 0
    };

    // Add new mirrors
    const toAdd = desiredWallets.filter(w => !currentAddresses.has(w.address));
    for (const wallet of toAdd) {
      const success = await this.createMirror(wallet);
      if (success) stats.added++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }

    // Remove old mirrors
    const toRemove = currentMirrors.filter(m => !desiredAddresses.has(m.address));
    for (const mirror of toRemove) {
      const success = await this.deleteMirror(mirror.address);
      if (success) stats.removed++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }

    // Count kept mirrors
    stats.kept = currentMirrors.filter(m => desiredAddresses.has(m.address)).length;

    this.logger.info('Mirror sync complete', stats);
    return stats;
  }

  /**
   * Check if OdinBot client is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
