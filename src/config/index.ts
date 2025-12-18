import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export function loadConfig(): Config {
  const requiredVars = [
    'DUNE_API_KEY',
    'SOLANA_RPC_URL',
    'WALLET_PRIVATE_KEY'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    duneApiKey: process.env.DUNE_API_KEY!,
    bagsApiKey: process.env.BAGS_API_KEY || '',
    bagsApiUrl: process.env.BAGS_API_URL || 'https://api.bags.fm',
    solanaRpcUrl: process.env.SOLANA_RPC_URL!,
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY!,
    maxPositionSizeSol: parseFloat(process.env.MAX_POSITION_SIZE_SOL || '1.0'),
    maxTotalPortfolioSol: parseFloat(process.env.MAX_TOTAL_PORTFOLIO_SOL || '10.0'),
    minLiquidityUsd: parseFloat(process.env.MIN_LIQUIDITY_USD || '50000'),
    slippageBps: parseInt(process.env.SLIPPAGE_BPS || '100'),
    stopLossPercentage: parseFloat(process.env.STOP_LOSS_PERCENTAGE || '20'),
    takeProfitPercentage: parseFloat(process.env.TAKE_PROFIT_PERCENTAGE || '100'),
    checkIntervalSeconds: parseInt(process.env.CHECK_INTERVAL_SECONDS || '60'),
    kolBuyMinAmountSol: parseFloat(process.env.KOL_BUY_MIN_AMOUNT_SOL || '0.1'),
    trendingTokenMinVolume24h: parseFloat(process.env.TRENDING_TOKEN_MIN_VOLUME_24H || '100000'),
    signalScoreThreshold: parseFloat(process.env.SIGNAL_SCORE_THRESHOLD || '7'),
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}
