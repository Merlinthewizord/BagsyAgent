import { loadConfig } from './config';
import { createLogger } from './utils/logger';
import { DuneClient } from './services/DuneClient';
import { BagsClient } from './services/BagsClient';
import { SignalAnalyzer } from './services/SignalAnalyzer';
import { TradingEngine } from './services/TradingEngine';

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.logLevel);

  logger.info('Starting BagsyAgent - Autonomous Token Trading Bot');
  logger.info('Configuration loaded', {
    walletAddress: new BagsClient(
      config.bagsApiKey,
      config.bagsApiUrl,
      config.solanaRpcUrl,
      config.walletPrivateKey,
      logger
    ).getWalletAddress(),
    maxPositionSize: config.maxPositionSizeSol,
    maxPortfolio: config.maxTotalPortfolioSol,
    signalThreshold: config.signalScoreThreshold
  });

  // Initialize services
  const duneClient = new DuneClient(config.duneApiKey, logger);
  const bagsClient = new BagsClient(
    config.bagsApiKey,
    config.bagsApiUrl,
    config.solanaRpcUrl,
    config.walletPrivateKey,
    logger
  );
  const signalAnalyzer = new SignalAnalyzer(logger);
  const tradingEngine = new TradingEngine(bagsClient, config, logger);

  // Display initial wallet balance
  const initialBalance = await bagsClient.getWalletBalance();
  logger.info(`Wallet balance: ${initialBalance.toFixed(4)} SOL`);

  if (initialBalance < config.maxPositionSizeSol) {
    logger.warn('Wallet balance is below max position size!');
  }

  // Main trading loop
  let iteration = 0;

  const tradingLoop = async () => {
    try {
      iteration++;
      logger.info(`=== Trading iteration ${iteration} ===`);

      // 1. Fetch KOL buys and trending tokens
      logger.info('Fetching market data...');
      const [kolBuys, trendingTokens, pumpFunTokens] = await Promise.all([
        duneClient.getRecentKOLBuys(50),
        duneClient.getTrendingTokensByVolume('24h', 50),
        duneClient.getPumpFunGraduatesByMarketCap(20)
      ]);

      // Combine all trending sources
      const allTrendingTokens = [...trendingTokens, ...pumpFunTokens];

      logger.info('Market data fetched', {
        kolBuys: kolBuys.length,
        trendingTokens: allTrendingTokens.length
      });

      // 2. Analyze signals
      const signals = signalAnalyzer.analyzeSignals(
        kolBuys,
        allTrendingTokens,
        config.kolBuyMinAmountSol,
        config.trendingTokenMinVolume24h
      );

      // Log top signals
      const topSignals = signals.slice(0, 5);
      if (topSignals.length > 0) {
        logger.info('Top trading signals:');
        topSignals.forEach((signal, index) => {
          logger.info(`  ${index + 1}. ${signal.tokenSymbol} (Score: ${signal.score})`, {
            signals: signal.signals,
            kolBuyCount: signal.kolBuys.length,
            trendingSources: signal.trendingData.length
          });
        });
      } else {
        logger.info('No trading signals found');
      }

      // 3. Execute trades based on signals
      await tradingEngine.processSignals(signals);

      // 4. Display portfolio status
      const positions = tradingEngine.getPositions();
      const portfolioValue = tradingEngine.getPortfolioValue();
      const currentBalance = await bagsClient.getWalletBalance();

      logger.info('Portfolio status', {
        activePositions: positions.length,
        investedSol: portfolioValue.toFixed(4),
        availableSol: currentBalance.toFixed(4),
        totalSol: (portfolioValue + currentBalance).toFixed(4)
      });

      if (positions.length > 0) {
        logger.info('Active positions:');
        positions.forEach((pos, index) => {
          logger.info(`  ${index + 1}. ${pos.tokenSymbol}`, {
            invested: pos.amountSol.toFixed(4),
            pnl: pos.pnlPercentage.toFixed(2) + '%',
            entryPrice: pos.entryPrice.toFixed(8),
            currentPrice: pos.currentPrice.toFixed(8)
          });
        });
      }

      // 5. Cleanup old signals
      signalAnalyzer.clearOldSignals(3600000); // 1 hour

      logger.info(`Iteration ${iteration} complete. Next check in ${config.checkIntervalSeconds}s`);
    } catch (error: any) {
      logger.error('Error in trading loop', { error: error.message, stack: error.stack });
    }
  };

  // Run first iteration immediately
  await tradingLoop();

  // Schedule subsequent iterations
  setInterval(tradingLoop, config.checkIntervalSeconds * 1000);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down BagsyAgent...');
    logger.info('Closing all positions...');

    const positions = tradingEngine.getPositions();
    for (const position of positions) {
      logger.info(`Please manually close position: ${position.tokenSymbol}`);
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });
}

// Start the bot
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
