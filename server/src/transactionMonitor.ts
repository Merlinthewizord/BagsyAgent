import { Connection, PublicKey, ParsedTransactionWithMeta, PartiallyDecodedInstruction } from '@solana/web3.js';
import axios from 'axios';

export interface WalletTransaction {
  signature: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol?: number;
  tokenAmount?: number;
  price?: number;
  fee: number;
}

export class TransactionMonitor {
  private connection: Connection;
  private walletPublicKey: PublicKey | null = null;
  private lastCheckedSignature: string | null = null;
  private tokenCache: Map<string, { symbol: string; decimals: number }> = new Map();

  constructor(rpcUrl: string, walletAddress?: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    if (walletAddress) {
      try {
        this.walletPublicKey = new PublicKey(walletAddress);
      } catch (error) {
        console.error('Invalid wallet address:', error);
      }
    }
  }

  setWalletAddress(walletAddress: string) {
    try {
      this.walletPublicKey = new PublicKey(walletAddress);
      this.lastCheckedSignature = null; // Reset when wallet changes
    } catch (error) {
      console.error('Invalid wallet address:', error);
      throw error;
    }
  }

  async getRecentTransactions(limit: number = 20): Promise<WalletTransaction[]> {
    if (!this.walletPublicKey) {
      console.log('No wallet address configured for transaction monitoring');
      return [];
    }

    try {
      // Get recent transaction signatures
      const signatures = await this.connection.getSignaturesForAddress(
        this.walletPublicKey,
        { limit },
        'confirmed'
      );

      if (signatures.length === 0) {
        return [];
      }

      // Update last checked signature
      if (!this.lastCheckedSignature && signatures.length > 0) {
        this.lastCheckedSignature = signatures[0].signature;
      }

      const transactions: WalletTransaction[] = [];

      // Fetch and parse each transaction
      for (const sigInfo of signatures) {
        try {
          const tx = await this.parseTransaction(sigInfo.signature);
          if (tx) {
            transactions.push(tx);
          }
        } catch (error) {
          console.debug(`Could not parse transaction ${sigInfo.signature}:`, error);
        }
      }

      console.log(`Found ${transactions.length} wallet transactions`);
      return transactions;
    } catch (error: any) {
      console.error('Error getting wallet transactions:', error.message);
      return [];
    }
  }

  async getNewTransactions(): Promise<WalletTransaction[]> {
    if (!this.walletPublicKey) {
      return [];
    }

    try {
      const options = this.lastCheckedSignature
        ? { until: this.lastCheckedSignature, limit: 20 }
        : { limit: 5 };

      const signatures = await this.connection.getSignaturesForAddress(
        this.walletPublicKey,
        options,
        'confirmed'
      );

      if (signatures.length === 0) {
        return [];
      }

      // Update last checked signature
      this.lastCheckedSignature = signatures[0].signature;

      const transactions: WalletTransaction[] = [];

      for (const sigInfo of signatures) {
        try {
          const tx = await this.parseTransaction(sigInfo.signature);
          if (tx) {
            transactions.push(tx);
          }
        } catch (error) {
          console.debug(`Could not parse transaction ${sigInfo.signature}:`, error);
        }
      }

      if (transactions.length > 0) {
        console.log(`Found ${transactions.length} new transactions`);
      }

      return transactions;
    } catch (error: any) {
      console.error('Error checking for new transactions:', error.message);
      return [];
    }
  }

  private async parseTransaction(signature: string): Promise<WalletTransaction | null> {
    try {
      const tx = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });

      if (!tx || !tx.meta || !tx.blockTime) {
        return null;
      }

      // Check if transaction failed
      if (tx.meta.err) {
        return null;
      }

      const timestamp = tx.blockTime * 1000;
      const fee = tx.meta.fee / 1e9; // Convert lamports to SOL

      // Parse token transfers
      const tokenTransfer = this.parseTokenTransfer(tx);
      if (tokenTransfer) {
        return {
          signature,
          timestamp,
          fee,
          ...tokenTransfer
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private parseTokenTransfer(tx: ParsedTransactionWithMeta): Omit<WalletTransaction, 'signature' | 'timestamp' | 'fee'> | null {
    if (!tx.meta || !this.walletPublicKey) return null;

    // Look for token balance changes
    const preTokenBalances = tx.meta.preTokenBalances || [];
    const postTokenBalances = tx.meta.postTokenBalances || [];

    // Find token balance changes for our wallet
    for (const postBalance of postTokenBalances) {
      const preBalance = preTokenBalances.find(
        (pre) => pre.accountIndex === postBalance.accountIndex
      );

      if (!preBalance || !postBalance.uiTokenAmount.uiAmount) continue;

      const preAmount = preBalance.uiTokenAmount.uiAmount || 0;
      const postAmount = postBalance.uiTokenAmount.uiAmount || 0;
      const change = postAmount - preAmount;

      if (Math.abs(change) < 0.000001) continue; // Ignore dust

      const tokenMint = postBalance.mint;

      // Determine if this is a buy or sell
      const type: 'buy' | 'sell' | 'transfer' = change > 0 ? 'buy' : 'sell';

      // Get SOL balance change
      const preSolBalance = tx.meta.preBalances[0] || 0;
      const postSolBalance = tx.meta.postBalances[0] || 0;
      const solChange = Math.abs((postSolBalance - preSolBalance) / 1e9);

      // Calculate price if we have both amounts
      const price = solChange > 0 && Math.abs(change) > 0
        ? solChange / Math.abs(change)
        : undefined;

      return {
        type,
        tokenAddress: tokenMint,
        tokenSymbol: tokenMint.slice(0, 6),
        amountSol: solChange,
        tokenAmount: Math.abs(change),
        price
      };
    }

    return null;
  }

  private async getTokenMetadata(mint: string): Promise<{ symbol?: string; decimals?: number }> {
    // Check cache first
    if (this.tokenCache.has(mint)) {
      return this.tokenCache.get(mint)!;
    }

    try {
      const response = await axios.get(`https://price.jup.ag/v6/price?ids=${mint}`, {
        timeout: 3000
      });

      if (response.data?.data?.[mint]) {
        const data = {
          symbol: response.data.data[mint].mintSymbol,
          decimals: response.data.data[mint].decimals
        };
        this.tokenCache.set(mint, data);
        return data;
      }
    } catch (error) {
      // Silently fail
    }

    return {};
  }
}
