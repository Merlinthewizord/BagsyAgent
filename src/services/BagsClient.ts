import axios, { AxiosInstance } from 'axios';
import { Connection, Keypair, VersionedTransaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { TradeQuote, Trade } from '../types';
import { Logger } from 'winston';

export class BagsClient {
  private client: AxiosInstance;
  private connection: Connection;
  private wallet: Keypair;
  private logger: Logger;
  private solMint = 'So11111111111111111111111111111111111111112';

  constructor(
    apiKey: string,
    apiUrl: string,
    rpcUrl: string,
    privateKey: string,
    logger: Logger
  ) {
    this.logger = logger;
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    this.connection = new Connection(rpcUrl, 'confirmed');
    this.wallet = Keypair.fromSecretKey(bs58.decode(privateKey));
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number
  ): Promise<TradeQuote | null> {
    try {
      this.logger.info('Getting trade quote', { inputMint, outputMint, amount });

      const response = await this.client.get('/trade/quote', {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageMode: 'manual',
          slippageBps
        }
      });

      const quote: TradeQuote = {
        inputMint: response.data.inputMint,
        outputMint: response.data.outputMint,
        amount: response.data.amount,
        expectedOutput: response.data.expectedOutput,
        minOutput: response.data.minOutput,
        priceImpact: response.data.priceImpact,
        route: response.data.route,
        requestId: response.data.requestId
      };

      this.logger.info('Quote received', {
        expectedOutput: quote.expectedOutput,
        priceImpact: quote.priceImpact
      });

      return quote;
    } catch (error: any) {
      this.logger.error('Error getting quote', { error: error.message });
      return null;
    }
  }

  async executeSwap(quote: TradeQuote): Promise<string | null> {
    try {
      this.logger.info('Creating swap transaction', { requestId: quote.requestId });

      const response = await this.client.post('/trade/swap', {
        quote,
        userPublicKey: this.wallet.publicKey.toBase58()
      });

      const { transaction, computeUnitLimit, prioritizationFee } = response.data;

      this.logger.info('Signing and sending transaction', {
        computeUnitLimit,
        prioritizationFee
      });

      const txSignature = await this.signAndSendTransaction(transaction);

      if (txSignature) {
        this.logger.info('Transaction sent successfully', { signature: txSignature });
        return txSignature;
      }

      return null;
    } catch (error: any) {
      this.logger.error('Error executing swap', { error: error.message });
      return null;
    }
  }

  async buyToken(
    tokenMint: string,
    amountSol: number,
    slippageBps: number
  ): Promise<Trade> {
    const trade: Trade = {
      type: 'buy',
      tokenAddress: tokenMint,
      tokenSymbol: 'UNKNOWN',
      amountSol,
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      const lamports = (amountSol * 1e9).toString();

      const quote = await this.getQuote(
        this.solMint,
        tokenMint,
        lamports,
        slippageBps
      );

      if (!quote) {
        trade.status = 'failed';
        trade.error = 'Failed to get quote';
        return trade;
      }

      const txSignature = await this.executeSwap(quote);

      if (txSignature) {
        trade.status = 'success';
        trade.txSignature = txSignature;
        trade.expectedTokens = parseFloat(quote.expectedOutput);
      } else {
        trade.status = 'failed';
        trade.error = 'Failed to execute swap';
      }

      return trade;
    } catch (error: any) {
      this.logger.error('Error buying token', { error: error.message });
      trade.status = 'failed';
      trade.error = error.message;
      return trade;
    }
  }

  async sellToken(
    tokenMint: string,
    tokenAmount: string,
    slippageBps: number
  ): Promise<Trade> {
    const trade: Trade = {
      type: 'sell',
      tokenAddress: tokenMint,
      tokenSymbol: 'UNKNOWN',
      amountSol: 0,
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      const quote = await this.getQuote(
        tokenMint,
        this.solMint,
        tokenAmount,
        slippageBps
      );

      if (!quote) {
        trade.status = 'failed';
        trade.error = 'Failed to get quote';
        return trade;
      }

      const txSignature = await this.executeSwap(quote);

      if (txSignature) {
        trade.status = 'success';
        trade.txSignature = txSignature;
        trade.amountSol = parseFloat(quote.expectedOutput) / 1e9;
      } else {
        trade.status = 'failed';
        trade.error = 'Failed to execute swap';
      }

      return trade;
    } catch (error: any) {
      this.logger.error('Error selling token', { error: error.message });
      trade.status = 'failed';
      trade.error = error.message;
      return trade;
    }
  }

  private async signAndSendTransaction(serializedTx: string): Promise<string | null> {
    try {
      const txBuffer = Buffer.from(serializedTx, 'base64');
      const tx = VersionedTransaction.deserialize(txBuffer);

      tx.sign([this.wallet]);

      const signature = await this.connection.sendTransaction(tx, {
        skipPreflight: false,
        maxRetries: 3
      });

      await this.connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error: any) {
      this.logger.error('Error signing and sending transaction', { error: error.message });
      return null;
    }
  }

  async getWalletBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      return balance / 1e9;
    } catch (error: any) {
      this.logger.error('Error getting wallet balance', { error: error.message });
      return 0;
    }
  }

  getWalletAddress(): string {
    return this.wallet.publicKey.toBase58();
  }

  async getClaimableFees(tokenMint: string): Promise<number> {
    try {
      this.logger.info('Checking claimable fees', { tokenMint });

      const response = await this.client.get('/fees/claimable', {
        params: {
          tokenMint,
          walletAddress: this.wallet.publicKey.toBase58()
        }
      });

      return response.data.claimableAmount || 0;
    } catch (error: any) {
      this.logger.error('Error getting claimable fees', { error: error.message });
      return 0;
    }
  }

  async claimFees(tokenMint: string): Promise<{ success: boolean; amount?: number; txSignature?: string; error?: string }> {
    try {
      this.logger.info('Claiming fees', { tokenMint });

      const response = await this.client.post('/fees/claim', {
        tokenMint,
        walletAddress: this.wallet.publicKey.toBase58()
      });

      const { transaction, amount } = response.data;

      if (!transaction) {
        return { success: false, error: 'No transaction returned from API' };
      }

      const txSignature = await this.signAndSendTransaction(transaction);

      if (txSignature) {
        this.logger.info('Fees claimed successfully', { amount, signature: txSignature });
        return { success: true, amount, txSignature };
      }

      return { success: false, error: 'Failed to send transaction' };
    } catch (error: any) {
      this.logger.error('Error claiming fees', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async burnTokens(tokenMint: string, amount: string): Promise<{ success: boolean; txSignature?: string; error?: string }> {
    try {
      this.logger.info('Burning tokens', { tokenMint, amount });

      // Solana incinerator address for burning tokens
      const incineratorAddress = '1nc1nerator11111111111111111111111111111111';

      // Use sell to incinerator as burn mechanism
      const quote = await this.getQuote(
        tokenMint,
        this.solMint,
        amount,
        9999 // High slippage for burn
      );

      if (!quote) {
        return { success: false, error: 'Failed to get burn quote' };
      }

      const txSignature = await this.executeSwap(quote);

      if (txSignature) {
        this.logger.info('Tokens burned successfully', { signature: txSignature });
        return { success: true, txSignature };
      }

      return { success: false, error: 'Failed to execute burn transaction' };
    } catch (error: any) {
      this.logger.error('Error burning tokens', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}
