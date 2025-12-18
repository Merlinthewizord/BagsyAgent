import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

export interface WalletToken {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  priceUsd?: number;
  valueUsd?: number;
}

export class WalletTokenService {
  private connection: Connection;
  private walletPublicKey: PublicKey | null = null;

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
    } catch (error) {
      console.error('Invalid wallet address:', error);
      throw error;
    }
  }

  async getAllWalletTokens(): Promise<WalletToken[]> {
    if (!this.walletPublicKey) {
      console.log('No wallet address configured');
      return [];
    }

    try {
      // Get all SPL token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        this.walletPublicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const tokens: WalletToken[] = [];

      for (const account of tokenAccounts.value) {
        const parsedInfo = account.account.data.parsed.info;
        const mint = parsedInfo.mint;
        const tokenAmount = parsedInfo.tokenAmount;

        // Skip tokens with zero balance
        if (!tokenAmount.uiAmount || tokenAmount.uiAmount === 0) {
          continue;
        }

        // Get token metadata (symbol, name, price)
        const metadata = await this.getTokenMetadata(mint);

        tokens.push({
          mint,
          symbol: metadata.symbol || mint.slice(0, 8),
          name: metadata.name || 'Unknown Token',
          amount: tokenAmount.amount,
          decimals: tokenAmount.decimals,
          uiAmount: tokenAmount.uiAmount,
          priceUsd: metadata.priceUsd,
          valueUsd: metadata.priceUsd ? tokenAmount.uiAmount * metadata.priceUsd : undefined
        });
      }

      // Sort by value (USD) descending
      tokens.sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0));

      console.log(`Found ${tokens.length} tokens in wallet`);
      return tokens;
    } catch (error: any) {
      console.error('Error getting wallet tokens:', error.message);
      return [];
    }
  }

  private async getTokenMetadata(mint: string): Promise<{
    symbol?: string;
    name?: string;
    priceUsd?: number;
  }> {
    try {
      // Try to get token info from Jupiter API
      const response = await axios.get(`https://price.jup.ag/v6/price?ids=${mint}`, {
        timeout: 5000
      });

      if (response.data && response.data.data && response.data.data[mint]) {
        const tokenData = response.data.data[mint];
        return {
          symbol: tokenData.mintSymbol,
          name: tokenData.mintSymbol,
          priceUsd: tokenData.price
        };
      }

      return {};
    } catch (error: any) {
      // Silently fail for metadata fetch
      return {};
    }
  }
}
