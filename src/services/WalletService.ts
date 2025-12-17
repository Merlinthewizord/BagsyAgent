import { Connection, PublicKey } from '@solana/web3.js';
import { Logger } from 'winston';
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

export class WalletService {
  private connection: Connection;
  private walletPublicKey: PublicKey;
  private logger: Logger;

  constructor(connection: Connection, walletPublicKey: PublicKey, logger: Logger) {
    this.connection = connection;
    this.walletPublicKey = walletPublicKey;
    this.logger = logger;
  }

  async getAllWalletTokens(): Promise<WalletToken[]> {
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

        // Get token metadata (symbol, name)
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

      this.logger.info(`Found ${tokens.length} tokens in wallet`);
      return tokens;
    } catch (error: any) {
      this.logger.error('Error getting wallet tokens', { error: error.message });
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

      // Fallback: try to get metadata from chain
      return await this.getOnChainMetadata(mint);
    } catch (error: any) {
      this.logger.debug(`Could not fetch metadata for ${mint}:`, error.message);
      return {};
    }
  }

  private async getOnChainMetadata(mint: string): Promise<{
    symbol?: string;
    name?: string;
  }> {
    try {
      // Try to fetch from metaplex metadata
      const metadataPDA = await this.getMetadataPDA(mint);
      const accountInfo = await this.connection.getAccountInfo(metadataPDA);

      if (accountInfo && accountInfo.data) {
        // Parse metadata (simplified - full implementation would need proper deserialization)
        const data = accountInfo.data;
        // This is a simplified version - actual metadata parsing is more complex
        return {
          symbol: mint.slice(0, 8),
          name: 'Token'
        };
      }

      return {};
    } catch (error: any) {
      return {};
    }
  }

  private async getMetadataPDA(mint: string): Promise<PublicKey> {
    const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [pda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        new PublicKey(mint).toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
    return pda;
  }
}
