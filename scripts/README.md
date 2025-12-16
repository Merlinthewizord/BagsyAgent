# Scripts

## Update KOL Wallets from Dune Analytics

The `update-kol-wallets.ts` script fetches top performing trader wallets from your Dune Analytics dashboards and automatically updates the KOL wallet list.

### Setup

1. **Get your Dune API key:**
   - Visit: https://dune.com/settings/api
   - Copy your API key

2. **Find your query IDs:**
   - Open each dashboard:
     - https://dune.com/couldbebasic/top-traders
     - https://dune.com/couldbebasic/wallet-analyzer-for-copy-traders
     - https://dune.com/couldbebasic/token-analyzer
   - Click on the main table/chart
   - Copy the query ID from the URL (e.g., `https://dune.com/queries/1234567` → query ID is `1234567`)
   - Update the `QUERY_IDS` object in `scripts/update-kol-wallets.ts`

3. **Run the script:**
   ```bash
   # Set your Dune API key (regular API, not Sim API)
   export DUNE_API_KEY="your_dune_api_key_here"

   # Run the update script
   npx tsx scripts/update-kol-wallets.ts

   # Rebuild the project
   npm run build
   ```

### What it does

- Fetches data from all configured Dune queries
- Merges wallet data from multiple sources
- Filters wallets based on performance criteria:
  - Win Rate ≥ 55%
  - Total PnL > 10 SOL
  - Number of Trades ≥ 5
- Sorts by performance score: `winRate × totalPnL × (1 + trades/100)`
- Takes top 50 wallets
- Updates `src/data/kol-wallets.ts` with fresh data

### Performance Criteria

The script automatically filters for high-quality wallets:
- **Minimum Win Rate**: 55%+
- **Minimum Profit**: 10+ SOL
- **Minimum Trades**: 5+ trades
- **Smart Scoring**: Balances win rate, profitability, and activity

### Recommended Update Frequency

Run this script:
- **Weekly**: To keep wallet list fresh with current top performers
- **After major market events**: To capture new emerging traders
- **Before deploying**: To ensure you're tracking the best wallets
