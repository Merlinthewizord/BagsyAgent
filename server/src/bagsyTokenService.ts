import axios from 'axios';

const BAGSY_TOKEN_ADDRESS = 'hqgZKMLZRN4tMf3vtnBzFL6L33cwPqHbR7t1LRrBAGS';

interface TokenData {
  marketCap: number;
  price: number;
  priceChange24h: number;
}

export class BagsyTokenService {
  private cachedData: TokenData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  async getMarketCap(): Promise<number> {
    try {
      const now = Date.now();

      // Return cached data if fresh
      if (this.cachedData && (now - this.lastFetch) < this.CACHE_DURATION) {
        return this.cachedData.marketCap;
      }

      // Try multiple data sources
      const marketCap = await this.fetchFromMultipleSources();

      if (marketCap > 0) {
        this.cachedData = {
          marketCap,
          price: 0,
          priceChange24h: 0
        };
        this.lastFetch = now;
      }

      return marketCap;
    } catch (error) {
      console.error('Error fetching BAGSY market cap:', error);
      return this.cachedData?.marketCap || 0;
    }
  }

  private async fetchFromMultipleSources(): Promise<number> {
    // Try Jupiter first
    try {
      const jupiterData = await this.fetchFromJupiter();
      if (jupiterData > 0) return jupiterData;
    } catch (error) {
      console.debug('Jupiter fetch failed:', error);
    }

    // Try DexScreener
    try {
      const dexScreenerData = await this.fetchFromDexScreener();
      if (dexScreenerData > 0) return dexScreenerData;
    } catch (error) {
      console.debug('DexScreener fetch failed:', error);
    }

    // Try Birdeye
    try {
      const birdeyeData = await this.fetchFromBirdeye();
      if (birdeyeData > 0) return birdeyeData;
    } catch (error) {
      console.debug('Birdeye fetch failed:', error);
    }

    return 0;
  }

  private async fetchFromJupiter(): Promise<number> {
    const response = await axios.get(
      `https://price.jup.ag/v6/price?ids=${BAGSY_TOKEN_ADDRESS}`,
      { timeout: 5000 }
    );

    if (response.data?.data?.[BAGSY_TOKEN_ADDRESS]) {
      const tokenData = response.data.data[BAGSY_TOKEN_ADDRESS];
      // Jupiter doesn't provide market cap directly, but we can estimate
      // This would need total supply to calculate accurately
      return 0; // Jupiter doesn't have market cap data
    }

    return 0;
  }

  private async fetchFromDexScreener(): Promise<number> {
    console.log('📡 Attempting to fetch from DexScreener...');
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${BAGSY_TOKEN_ADDRESS}`,
      { timeout: 5000 }
    );

    if (response.data?.pairs && response.data.pairs.length > 0) {
      console.log(`   Found ${response.data.pairs.length} pairs on DexScreener`);
      // Get the pair with highest liquidity
      const bestPair = response.data.pairs.reduce((best: any, current: any) => {
        const currentLiq = parseFloat(current.liquidity?.usd || '0');
        const bestLiq = parseFloat(best?.liquidity?.usd || '0');
        return currentLiq > bestLiq ? current : best;
      });

      const marketCap = parseFloat(bestPair.fdv || bestPair.marketCap || '0');
      if (marketCap > 0) {
        console.log(`   ✅ BAGSY Market Cap from DexScreener: $${(marketCap / 1000000).toFixed(2)}M`);
        return marketCap;
      } else {
        console.log(`   ⚠️  No market cap data in best pair`);
      }
    } else {
      console.log('   ❌ No pairs found on DexScreener');
    }

    return 0;
  }

  private async fetchFromBirdeye(): Promise<number> {
    // Birdeye requires API key for full data, but has some public endpoints
    const response = await axios.get(
      `https://public-api.birdeye.so/public/token_overview?address=${BAGSY_TOKEN_ADDRESS}`,
      {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (response.data?.data?.mc) {
      const marketCap = response.data.data.mc;
      console.log(`BAGSY Market Cap from Birdeye: $${(marketCap / 1000000).toFixed(2)}M`);
      return marketCap;
    }

    return 0;
  }

  async getTokenData(): Promise<TokenData | null> {
    try {
      const marketCap = await this.getMarketCap();
      return this.cachedData || { marketCap, price: 0, priceChange24h: 0 };
    } catch (error) {
      return null;
    }
  }
}
