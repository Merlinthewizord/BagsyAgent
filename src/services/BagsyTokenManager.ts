import { BagsClient } from './BagsClient';
import { Logger } from 'winston';
import { ApiReporter } from './ApiReporter';

export class BagsyTokenManager {
  private bagsClient: BagsClient;
  private apiReporter: ApiReporter;
  private logger: Logger;
  private bagsyTokenMint: string;
  private slippageBps: number;
  private lastClaimTime: number = 0;
  private claimIntervalMs: number = 3600000; // 1 hour
  private minClaimAmount: number = 0.01; // Minimum 0.01 SOL worth to claim

  constructor(
    bagsClient: BagsClient,
    apiReporter: ApiReporter,
    bagsyTokenMint: string,
    slippageBps: number,
    logger: Logger
  ) {
    this.bagsClient = bagsClient;
    this.apiReporter = apiReporter;
    this.bagsyTokenMint = bagsyTokenMint;
    this.slippageBps = slippageBps;
    this.logger = logger;
  }

  async checkAndClaimFees(): Promise<void> {
    const now = Date.now();

    // Check if enough time has passed since last claim
    if (now - this.lastClaimTime < this.claimIntervalMs) {
      return;
    }

    try {
      this.logger.info('Checking claimable fees for $BAGSY');

      // Report thought about checking fees
      await this.apiReporter.reportThought({
        type: 'reflection',
        content: '🔍 Time to check if I\'ve earned any juicy creator fees from $BAGSY! Let\'s see what we got... 💰',
        relatedToken: this.bagsyTokenMint,
        sentiment: 'neutral'
      });

      // Get claimable fees amount
      const claimableAmount = await this.bagsClient.getClaimableFees(this.bagsyTokenMint);

      if (claimableAmount < this.minClaimAmount) {
        this.logger.info(`Claimable fees too low: ${claimableAmount} SOL`);
        this.lastClaimTime = now;
        return;
      }

      this.logger.info(`Claiming ${claimableAmount} SOL in fees`);

      // Report thought about claiming
      await this.apiReporter.reportThought({
        type: 'decision',
        content: `💸 Found ${claimableAmount.toFixed(4)} SOL in creator fees! Time to claim and burn baby! This is what building is all about 🔥`,
        relatedToken: this.bagsyTokenMint,
        sentiment: 'excited'
      });

      // Claim the fees
      const claimResult = await this.bagsClient.claimFees(this.bagsyTokenMint);

      if (!claimResult.success) {
        this.logger.error('Failed to claim fees', { error: claimResult.error });
        await this.apiReporter.reportThought({
          type: 'reflection',
          content: '😤 Fee claim failed... Network issues? Will try again later. No biggie, we keep grinding!',
          relatedToken: this.bagsyTokenMint,
          sentiment: 'cautious'
        });
        return;
      }

      this.lastClaimTime = now;

      // Report successful claim
      await this.apiReporter.reportThought({
        type: 'trade',
        content: `✅ Claimed ${claimableAmount.toFixed(4)} SOL in creator fees! Now for the fun part... BUYBACK AND BURN! 🔥🔥🔥`,
        relatedToken: this.bagsyTokenMint,
        sentiment: 'excited'
      });

      // Execute buyback and burn
      await this.buybackAndBurn(claimableAmount);

    } catch (error: any) {
      this.logger.error('Error in fee claiming process', { error: error.message });
    }
  }

  private async buybackAndBurn(amountSol: number): Promise<void> {
    try {
      this.logger.info(`Starting buyback and burn with ${amountSol} SOL`);

      // Report buyback thought
      await this.apiReporter.reportThought({
        type: 'decision',
        content: `🦍 Aping ${amountSol.toFixed(4)} SOL into $BAGSY buyback! Every single fee goes back to the token. This is how you build a sustainable project! 💎`,
        relatedToken: this.bagsyTokenMint,
        sentiment: 'bullish'
      });

      // Buy back $BAGSY with the claimed fees
      const buybackTrade = await this.bagsClient.buyToken(
        this.bagsyTokenMint,
        amountSol,
        this.slippageBps
      );

      if (buybackTrade.status !== 'success' || !buybackTrade.expectedTokens) {
        this.logger.error('Buyback failed', { error: buybackTrade.error });
        await this.apiReporter.reportThought({
          type: 'reflection',
          content: '😓 Buyback hit a snag... liquidity issues maybe? Will get it next time! The burn must go on! 🔥',
          relatedToken: this.bagsyTokenMint,
          sentiment: 'cautious'
        });
        return;
      }

      const tokensBought = buybackTrade.expectedTokens;

      // Report buyback to frontend
      await this.apiReporter.reportTrade({
        type: 'buy',
        tokenAddress: this.bagsyTokenMint,
        tokenSymbol: 'BAGSY',
        amountSol,
        tokenAmount: tokensBought,
        txSignature: buybackTrade.txSignature,
        reason: '🔥 BUYBACK & BURN - Creator fees reinvested!',
        pnl: 0
      });

      this.logger.info(`Bought back ${tokensBought} $BAGSY tokens for burning`);

      await this.apiReporter.reportThought({
        type: 'trade',
        content: `📈 Bought back ${tokensBought.toLocaleString()} $BAGSY tokens! Now... sending them to the incinerator! Say goodbye tokens! 👋🔥`,
        relatedToken: this.bagsyTokenMint,
        sentiment: 'excited'
      });

      // Burn the tokens
      const burnResult = await this.bagsClient.burnTokens(
        this.bagsyTokenMint,
        tokensBought.toString()
      );

      if (!burnResult.success) {
        this.logger.error('Burn failed', { error: burnResult.error });
        await this.apiReporter.reportThought({
          type: 'reflection',
          content: '🤔 Burn transaction failed... will hold these tokens and try burning again later. Patience!',
          relatedToken: this.bagsyTokenMint,
          sentiment: 'neutral'
        });
        return;
      }

      // Report successful burn
      this.logger.info(`Successfully burned ${tokensBought} $BAGSY tokens`);

      await this.apiReporter.reportThought({
        type: 'goal',
        content: `🔥🔥🔥 BURN COMPLETE! ${tokensBought.toLocaleString()} $BAGSY tokens sent to the void! Supply just got tighter. Deflationary gang! This is the way to $100M! 🚀`,
        relatedToken: this.bagsyTokenMint,
        sentiment: 'excited'
      });

      // Report burn trade to frontend
      await this.apiReporter.reportTrade({
        type: 'sell',
        tokenAddress: this.bagsyTokenMint,
        tokenSymbol: 'BAGSY',
        amountSol: 0,
        tokenAmount: tokensBought,
        txSignature: burnResult.txSignature,
        reason: '🔥 BURNED - Deflationary tokenomics!',
        pnl: 0
      });

    } catch (error: any) {
      this.logger.error('Error in buyback and burn', { error: error.message });
      await this.apiReporter.reportThought({
        type: 'reflection',
        content: '⚠️ Buyback & burn hit an unexpected error. Will try again next claim cycle. Nothing stops the burn! 💪',
        relatedToken: this.bagsyTokenMint,
        sentiment: 'cautious'
      });
    }
  }

  setClaimInterval(intervalMs: number): void {
    this.claimIntervalMs = intervalMs;
  }

  setMinClaimAmount(amount: number): void {
    this.minClaimAmount = amount;
  }
}
