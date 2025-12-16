import axios, { AxiosInstance } from 'axios';
import { KOLBuy, TrendingToken } from '../types';
import { Logger } from 'winston';

export class DuneClient {
  private client: AxiosInstance;
  private logger: Logger;
  private walletAddress: string;

  constructor(apiKey: string, logger: Logger, walletAddress: string = '86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY') {
    this.logger = logger;
    this.walletAddress = walletAddress;
    this.client = axios.create({
      baseURL: 'https://api.sim.dune.com/beta/svm',
      headers: {
        'X-Sim-Api-Key': apiKey
      }
    });
  }

  async getRecentKOLBuys(limit: number = 20): Promise<KOLBuy[]> {
    try {
      this.logger.info('Fetching recent transactions from Dune Sim API');

      const response = await this.client.get(`/transactions/${this.walletAddress}`, {
        params: { limit }
      });

      // Parse transactions to identify potential KOL buys
      // Looking for large SOL transfers that might indicate token purchases
      const kolBuys: KOLBuy[] = response.data?.transactions?.filter((tx: any) => {
        // Filter for transactions with significant SOL amounts
        return tx.amount && parseFloat(tx.amount) >= 0.1;
      }).map((tx: any) => ({
        tokenAddress: tx.token_address || tx.to_address || '',
        tokenSymbol: tx.token_symbol || 'UNKNOWN',
        kolWallet: tx.from_address || this.walletAddress,
        amountSol: parseFloat(tx.amount || '0'),
        timestamp: new Date(tx.timestamp || Date.now()).getTime(),
        txSignature: tx.signature || tx.tx_hash || ''
      })) || [];

      this.logger.info(`Fetched ${kolBuys.length} recent transactions`);
      return kolBuys;
    } catch (error: any) {
      this.logger.error('Error fetching KOL buys', { error: error.message });
      return [];
    }
  }

  async getTrendingTokensByVolume(timeframe: string = '24h', limit: number = 20): Promise<TrendingToken[]> {
    try {
      this.logger.info(`Fetching token balances from Dune Sim API`);

      const response = await this.client.get(`/balances/${this.walletAddress}`);

      const trendingTokens: TrendingToken[] = response.data?.balances?.slice(0, limit).map((balance: any) => ({
        tokenAddress: balance.token_address || balance.mint || '',
        tokenSymbol: balance.token_symbol || balance.symbol || 'UNKNOWN',
        marketCap: parseFloat(balance.market_cap || '0'),
        volume24h: parseFloat(balance.volume_24h || '0'),
        priceChange24h: parseFloat(balance.price_change_24h || '0'),
        source: 'dune-sim',
        timestamp: Date.now()
      })) || [];

      this.logger.info(`Fetched ${trendingTokens.length} token balances`);
      return trendingTokens;
    } catch (error: any) {
      this.logger.error('Error fetching trending tokens', { error: error.message });
      return [];
    }
  }

  async getPumpFunGraduatesByMarketCap(limit: number = 20): Promise<TrendingToken[]> {
    try {
      this.logger.info('Fetching tokens from Dune Sim API');

      const response = await this.client.get(`/balances/${this.walletAddress}`);

      // Filter and sort by market cap
      const tokens: TrendingToken[] = response.data?.balances
        ?.filter((balance: any) => parseFloat(balance.market_cap || '0') > 0)
        ?.sort((a: any, b: any) => parseFloat(b.market_cap || '0') - parseFloat(a.market_cap || '0'))
        ?.slice(0, limit)
        ?.map((balance: any) => ({
          tokenAddress: balance.token_address || balance.mint || '',
          tokenSymbol: balance.token_symbol || balance.symbol || 'UNKNOWN',
          marketCap: parseFloat(balance.market_cap || '0'),
          volume24h: parseFloat(balance.volume_24h || '0'),
          source: 'dune-sim',
          timestamp: Date.now()
        })) || [];

      this.logger.info(`Fetched ${tokens.length} tokens`);
      return tokens;
    } catch (error: any) {
      this.logger.error('Error fetching Pump.fun tokens', { error: error.message });
      return [];
    }
  }
}
