import axios, { AxiosInstance } from 'axios';
import { KOLBuy, TrendingToken } from '../types';
import { Logger } from 'winston';

export class DuneClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.logger = logger;
    this.client = axios.create({
      baseURL: 'https://api.dune.com/api/v1',
      headers: {
        'X-Dune-API-Key': apiKey
      }
    });
  }

  async getRecentKOLBuys(limit: number = 20): Promise<KOLBuy[]> {
    try {
      this.logger.info('Fetching recent KOL buys from Dune');

      // Query ID for KOL buys - this would need to be created in Dune Analytics
      // For now, we'll use a placeholder structure
      const queryId = 'your_kol_buys_query_id';

      const response = await this.client.get(`/query/${queryId}/results`, {
        params: { limit }
      });

      const kolBuys: KOLBuy[] = response.data.result?.rows?.map((row: any) => ({
        tokenAddress: row.token_address,
        tokenSymbol: row.token_symbol,
        kolWallet: row.kol_wallet,
        amountSol: parseFloat(row.amount_sol),
        timestamp: new Date(row.timestamp).getTime(),
        txSignature: row.tx_signature
      })) || [];

      this.logger.info(`Fetched ${kolBuys.length} KOL buys`);
      return kolBuys;
    } catch (error: any) {
      this.logger.error('Error fetching KOL buys', { error: error.message });
      return [];
    }
  }

  async getTrendingTokensByVolume(timeframe: string = '24h', limit: number = 20): Promise<TrendingToken[]> {
    try {
      this.logger.info(`Fetching trending tokens by volume (${timeframe})`);

      // Query ID for trending tokens - placeholder
      const queryId = 'your_trending_tokens_query_id';

      const response = await this.client.get(`/query/${queryId}/results`, {
        params: { limit, timeframe }
      });

      const trendingTokens: TrendingToken[] = response.data.result?.rows?.map((row: any) => ({
        tokenAddress: row.token_address,
        tokenSymbol: row.token_symbol,
        marketCap: parseFloat(row.market_cap),
        volume24h: parseFloat(row.volume_24h),
        priceChange24h: parseFloat(row.price_change_24h),
        source: 'dune',
        timestamp: Date.now()
      })) || [];

      this.logger.info(`Fetched ${trendingTokens.length} trending tokens`);
      return trendingTokens;
    } catch (error: any) {
      this.logger.error('Error fetching trending tokens', { error: error.message });
      return [];
    }
  }

  async getPumpFunGraduatesByMarketCap(limit: number = 20): Promise<TrendingToken[]> {
    try {
      this.logger.info('Fetching Pump.fun graduates by market cap');

      const queryId = 'your_pumpfun_marketcap_query_id';

      const response = await this.client.get(`/query/${queryId}/results`, {
        params: { limit }
      });

      const tokens: TrendingToken[] = response.data.result?.rows?.map((row: any) => ({
        tokenAddress: row.token_address,
        tokenSymbol: row.token_symbol,
        marketCap: parseFloat(row.market_cap),
        volume24h: parseFloat(row.volume_24h),
        source: 'pumpfun',
        timestamp: Date.now()
      })) || [];

      this.logger.info(`Fetched ${tokens.length} Pump.fun tokens`);
      return tokens;
    } catch (error: any) {
      this.logger.error('Error fetching Pump.fun tokens', { error: error.message });
      return [];
    }
  }
}
