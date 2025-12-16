import axios, { AxiosInstance } from 'axios';
import { Position, Trade } from '../types';
import { Logger } from 'winston';

export class ApiReporter {
  private client!: AxiosInstance;
  private logger: Logger;
  private enabled: boolean;

  constructor(
    apiUrl: string,
    apiKey: string,
    logger: Logger
  ) {
    this.logger = logger;
    this.enabled = !!apiUrl && !!apiKey;

    if (!this.enabled) {
      this.logger.warn('API Reporter disabled - missing API URL or key');
      return;
    }

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    this.logger.info('API Reporter initialized', { apiUrl });
  }

  async reportPortfolio(stats: {
    totalValueSol: number;
    totalValueUsd: number;
    positions: number;
    pnl24h: number;
    pnlAllTime: number;
    winRate: number;
    totalTrades: number;
    bagsyTokenValue?: number;
    bagsyTokenMcap?: number;
  }): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.client.post('/api/bot/portfolio', stats);
      this.logger.debug('Portfolio reported to API');
    } catch (error: any) {
      this.logger.error('Failed to report portfolio', { error: error.message });
    }
  }

  async reportThought(thought: {
    type: 'analysis' | 'decision' | 'trade' | 'reflection' | 'goal';
    content: string;
    relatedToken?: string;
    sentiment: 'bullish' | 'bearish' | 'neutral' | 'excited' | 'cautious';
  }): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.client.post('/api/bot/thought', thought);
      this.logger.debug('Thought reported to API');
    } catch (error: any) {
      this.logger.error('Failed to report thought', { error: error.message });
    }
  }

  async reportTrade(trade: {
    type: 'buy' | 'sell';
    tokenAddress: string;
    tokenSymbol: string;
    amountSol: number;
    tokenAmount?: number;
    price?: number;
    txSignature?: string;
    reason: string;
    pnl?: number;
  }): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.client.post('/api/bot/trade', trade);
      this.logger.debug('Trade reported to API');
    } catch (error: any) {
      this.logger.error('Failed to report trade', { error: error.message });
    }
  }

  async reportPositions(positions: Position[]): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.client.post('/api/bot/positions', positions);
      this.logger.debug('Positions reported to API');
    } catch (error: any) {
      this.logger.error('Failed to report positions', { error: error.message });
    }
  }
}
