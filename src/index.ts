import { loadConfig } from './config';
import { createLogger } from './utils/logger';
import { DuneClient } from './services/DuneClient';
import { BagsClient } from './services/BagsClient';
import { SignalAnalyzer } from './services/SignalAnalyzer';
import { TradingEngine } from './services/TradingEngine';
import { ApiReporter } from './services/ApiReporter';
import { BagsyTokenManager } from './services/BagsyTokenManager';
import { KOLConsensusTracker } from './services/KOLConsensusTracker';
import { OdinBotClient } from './services/OdinBotClient';
import { CopyTradingManager } from './services/CopyTradingManager';
import { Mem0Client } from './services/Mem0Client';
import { WalletMemoryTracker } from './services/WalletMemoryTracker';
import { WalletTestingSystem } from './services/WalletTestingSystem';

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
  const apiReporter = new ApiReporter(
    process.env.API_SERVER_URL || '',
    process.env.BOT_API_KEY || '',
    logger
  );
  const kolConsensusTracker = new KOLConsensusTracker(
    duneClient,
    logger,
    2, // Minimum 2 KOLs must buy for consensus
    900000 // Cache for 15 minutes (to reduce API rate limit issues)
  );

  logger.info('KOL Consensus Tracker initialized (2-KOL threshold, 15min cache)');

  // Initialize OdinBot copy trading
  const odinBotClient = new OdinBotClient(
    process.env.ODINBOT_API_KEY || '',
    logger,
    process.env.ODINBOT_ENABLED === 'true'
  );

  const copyTradingManager = new CopyTradingManager(
    odinBotClient,
    apiReporter,
    logger,
    parseFloat(process.env.ODINBOT_SYNC_INTERVAL_HOURS || '24'),
    parseFloat(process.env.ODINBOT_DEFAULT_BUY_AMOUNT || '0.5'),
    parseFloat(process.env.ODINBOT_DEFAULT_SELL_PERCENTAGE || '100')
  );

  if (odinBotClient.isEnabled()) {
    logger.info('OdinBot copy trading enabled');
    // Perform initial sync
    await copyTradingManager.forceSyncNow();
  } else {
    logger.info('OdinBot copy trading disabled');
  }

  // Initialize Mem0 AI memory layer
  const mem0Client = new Mem0Client(
    process.env.MEM0_API_KEY || '',
    logger,
    process.env.MEM0_AGENT_ID || 'bagsy-agent',
    process.env.MEM0_ENABLED === 'true'
  );

  const walletMemoryTracker = new WalletMemoryTracker(mem0Client, logger);

  if (mem0Client.isEnabled()) {
    logger.info('Mem0 AI memory layer enabled');
    // Get initial memory stats
    const memStats = await walletMemoryTracker.getMemoryStats();
    logger.info('Memory stats:', memStats);
  } else {
    logger.info('Mem0 AI memory layer disabled');
  }

  // Initialize wallet testing system
  const walletTestingSystem = new WalletTestingSystem(
    walletMemoryTracker,
    odinBotClient,
    logger
  );

  // Load previously approved wallets from memory
  await walletTestingSystem.loadFromMemory();

  const testingStats = walletTestingSystem.getStats();
  logger.info('Wallet testing system initialized', testingStats);

  // Initialize Bagsy token manager (if token mint is configured)
  let bagsyTokenManager: BagsyTokenManager | null = null;
  if (process.env.BAGSY_TOKEN_MINT) {
    bagsyTokenManager = new BagsyTokenManager(
      bagsClient,
      apiReporter,
      process.env.BAGSY_TOKEN_MINT,
      config.slippageBps,
      logger
    );

    const claimIntervalHours = parseFloat(process.env.FEE_CLAIM_INTERVAL_HOURS || '1');
    const minClaimAmount = parseFloat(process.env.MIN_CLAIM_AMOUNT_SOL || '0.01');

    bagsyTokenManager.setClaimInterval(claimIntervalHours * 3600000);
    bagsyTokenManager.setMinClaimAmount(minClaimAmount);

    logger.info('Bagsy token manager initialized', {
      tokenMint: process.env.BAGSY_TOKEN_MINT,
      claimInterval: `${claimIntervalHours}h`,
      minClaimAmount: `${minClaimAmount} SOL`
    });
  }

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

      // 1. Fetch KOL consensus signals and market data
      logger.info('Fetching market data and KOL consensus...');
      const [consensusSignals, kolBuys, trendingTokens, pumpFunTokens] = await Promise.all([
        kolConsensusTracker.getConsensusSignals(),
        duneClient.getRecentKOLBuys(50),
        duneClient.getTrendingTokensByVolume('24h', 50),
        duneClient.getPumpFunGraduatesByMarketCap(20)
      ]);

      // Combine all trending sources
      const allTrendingTokens = [...trendingTokens, ...pumpFunTokens];

      logger.info('Market data fetched', {
        consensusTokens: consensusSignals.length,
        kolBuys: kolBuys.length,
        trendingTokens: allTrendingTokens.length
      });

      // 2. Analyze signals (including consensus)
      const signals = signalAnalyzer.analyzeSignals(
        kolBuys,
        allTrendingTokens,
        config.kolBuyMinAmountSol,
        config.trendingTokenMinVolume24h,
        consensusSignals
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

          // Report analysis thought for top signal
          if (index === 0) {
            let content = `🔍 Analyzing ${signal.tokenSymbol}: Score ${signal.score}. ${signal.signals.join(', ')}`;

            if (signal.consensusBuyCount && signal.consensusBuyCount >= 2) {
              content = `🔥 CONSENSUS SIGNAL: ${signal.tokenSymbol} bought by ${signal.consensusBuyCount} KOLs! ${signal.signals[0]}`;
            }

            apiReporter.reportThought({
              type: 'analysis',
              content,
              relatedToken: signal.tokenAddress,
              sentiment: signal.consensusBuyCount && signal.consensusBuyCount >= 3 ? 'excited' : signal.score >= 10 ? 'bullish' : signal.score >= 7 ? 'neutral' : 'cautious'
            });
          }
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

      // Report portfolio and positions to API
      const solPrice = 150; // TODO: Fetch real SOL price
      apiReporter.reportPortfolio({
        totalValueSol: portfolioValue + currentBalance,
        totalValueUsd: (portfolioValue + currentBalance) * solPrice,
        positions: positions.length,
        pnl24h: 0, // TODO: Calculate from trades
        pnlAllTime: 0, // TODO: Calculate from all trades
        winRate: 0, // TODO: Calculate from closed trades
        totalTrades: 0 // TODO: Track total trades
      });

      apiReporter.reportPositions(positions);

      // 5. Check and claim $BAGSY fees (if configured)
      if (bagsyTokenManager) {
        await bagsyTokenManager.checkAndClaimFees();
      }

      // 6. Check and sync OdinBot copy trading mirrors
      await copyTradingManager.checkAndSync();

      // 7. Learn and store winning wallets to memory + testing system
      if (mem0Client.isEnabled() && consensusSignals.length > 0) {
        // Store top consensus tokens with multiple KOL buyers
        const topConsensus = consensusSignals
          .filter(c => c.buyCount >= 3) // At least 3 KOLs bought
          .slice(0, 5); // Top 5

        for (const consensus of topConsensus) {
          await walletMemoryTracker.learnFromConsensus(
            consensus.tokenSymbol,
            consensus.kolBuyers,
            'pending' // Will update with outcome later
          );
        }

        // Report stats every 10th iteration
        if (iteration % 10 === 0) {
          const memStats = await walletMemoryTracker.getMemoryStats();
          const testingStats = walletTestingSystem.getStats();

          logger.info('Memory stats:', memStats);
          logger.info('Testing stats:', testingStats);

          apiReporter.reportThought({
            type: 'reflection',
            content: `🧠 Memory: ${memStats.totalMemories} memories | ${memStats.winningWallets} winners | ${memStats.consensusPatterns} patterns | ` +
                     `🧪 Testing: ${testingStats.testing} testing, ${testingStats.approved} approved, ${testingStats.rejected} rejected`,
            sentiment: 'neutral'
          });
        }
      }

      // 8. Cleanup old signals
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
