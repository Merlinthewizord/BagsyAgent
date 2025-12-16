# Dune Analytics Queries for BagsyAgent

This document contains example Dune queries you can use with BagsyAgent.

## Overview

BagsyAgent requires custom Dune queries to track:
1. KOL (Key Opinion Leader) wallet activities
2. Trending tokens by trading volume
3. Pump.fun token graduates
4. Market analytics

## Setting Up Queries

1. Go to [https://dune.com](https://dune.com) and log in
2. Click "New Query" in the dashboard
3. Copy one of the queries below
4. Run the query to test it
5. Save the query with a descriptive name
6. Copy the Query ID from the URL
7. Update your `DuneClient.ts` with the Query IDs

## Query 1: KOL Buys Tracking

This query tracks recent token purchases by known influential wallets.

```sql
-- KOL Token Purchases
-- Tracks recent buys by known Key Opinion Leaders

WITH kol_wallets AS (
    SELECT * FROM (VALUES
        ('7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3'),
        ('GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE'),
        ('BonK1YhkXEGLZzwtcvRTip3gAL9nCeQD7ppZBLXhtTs'),
        -- Add more KOL wallet addresses here
        ('Add_More_Wallet_Addresses_Here')
    ) AS t(wallet_address)
),

recent_trades AS (
    SELECT
        t.block_time,
        t.tx_id,
        t.trader,
        t.token_bought_address,
        t.token_bought_symbol,
        t.token_bought_amount,
        t.token_bought_amount_usd,
        t.token_sold_address,
        t.amount_usd,
        p.price as sol_price
    FROM solana.dex.trades t
    LEFT JOIN prices.usd p ON
        p.blockchain = 'solana'
        AND p.symbol = 'SOL'
        AND DATE_TRUNC('hour', p.minute) = DATE_TRUNC('hour', t.block_time)
    WHERE t.trader IN (SELECT wallet_address FROM kol_wallets)
        AND t.block_time > NOW() - INTERVAL '12' HOUR
        AND t.token_bought_amount_usd > 50  -- Minimum buy amount in USD
        AND t.token_sold_address = 'So11111111111111111111111111111111111111112'  -- Buying with SOL
)

SELECT
    block_time as timestamp,
    token_bought_address as token_address,
    COALESCE(token_bought_symbol, 'UNKNOWN') as token_symbol,
    trader as kol_wallet,
    CASE
        WHEN sol_price > 0 THEN token_bought_amount_usd / sol_price
        ELSE amount_usd / sol_price
    END as amount_sol,
    tx_id as tx_signature,
    token_bought_amount_usd as amount_usd
FROM recent_trades
ORDER BY block_time DESC
LIMIT 100
```

**Customization**:
- Add more KOL wallet addresses to the `kol_wallets` CTE
- Adjust `INTERVAL '12' HOUR` to track longer/shorter timeframes
- Change minimum buy amount (`token_bought_amount_usd > 50`)

## Query 2: Trending Tokens by Volume

Tracks tokens with high trading volume across major DEXs.

```sql
-- Trending Tokens by 24h Volume
-- Identifies tokens with significant trading activity

WITH token_volumes AS (
    SELECT
        token_bought_address as token_address,
        token_bought_symbol as token_symbol,
        SUM(token_bought_amount_usd) as buy_volume,
        COUNT(DISTINCT tx_id) as trade_count,
        COUNT(DISTINCT trader) as unique_traders,
        AVG(token_bought_amount_usd) as avg_trade_size,
        MAX(token_bought_amount_usd) as max_trade_size,
        MIN(block_time) as first_trade,
        MAX(block_time) as last_trade
    FROM solana.dex.trades
    WHERE block_time > NOW() - INTERVAL '24' HOUR
        AND project IN ('raydium', 'orca', 'jupiter', 'phoenix')
        AND token_bought_amount_usd > 10
    GROUP BY token_bought_address, token_bought_symbol
),

token_prices AS (
    SELECT
        token_address,
        token_symbol,
        buy_volume as volume_24h,
        trade_count,
        unique_traders,
        avg_trade_size,
        max_trade_size,
        EXTRACT(EPOCH FROM (last_trade - first_trade)) / 3600 as hours_active
    FROM token_volumes
    WHERE buy_volume > 100000  -- Minimum 24h volume
)

SELECT
    token_address,
    COALESCE(token_symbol, 'UNKNOWN') as token_symbol,
    ROUND(volume_24h, 2) as volume_24h,
    trade_count,
    unique_traders,
    ROUND(avg_trade_size, 2) as avg_trade_size,
    ROUND(max_trade_size, 2) as max_trade_size,
    ROUND(hours_active, 2) as hours_active,
    ROUND(volume_24h / NULLIF(hours_active, 0), 2) as volume_per_hour
FROM token_prices
ORDER BY volume_24h DESC
LIMIT 50
```

**Customization**:
- Adjust `INTERVAL '24' HOUR` for different timeframes
- Change minimum volume threshold (`buy_volume > 100000`)
- Add/remove DEX projects in the `project IN (...)` clause

## Query 3: Pump.fun Graduates by Market Cap

Tracks newly graduated tokens from Pump.fun.

```sql
-- Pump.fun Token Graduates
-- Monitors tokens that have graduated from Pump.fun bonding curve

WITH pumpfun_tokens AS (
    SELECT
        t.token_address,
        t.token_symbol,
        t.block_time as creation_time,
        SUM(t.token_bought_amount_usd) as volume_24h,
        COUNT(DISTINCT t.tx_id) as trade_count
    FROM solana.dex.trades t
    WHERE t.project = 'pump'
        AND t.block_time > NOW() - INTERVAL '48' HOUR
    GROUP BY t.token_address, t.token_symbol, t.block_time
),

graduated_tokens AS (
    SELECT
        p.token_address,
        p.token_symbol,
        p.creation_time,
        p.volume_24h,
        p.trade_count,
        -- Estimate market cap from recent trades
        p.volume_24h * 10 as estimated_market_cap
    FROM pumpfun_tokens p
    WHERE p.volume_24h > 10000  -- Minimum volume filter
)

SELECT
    token_address,
    COALESCE(token_symbol, 'UNKNOWN') as token_symbol,
    ROUND(estimated_market_cap, 2) as market_cap,
    ROUND(volume_24h, 2) as volume_24h,
    trade_count,
    creation_time
FROM graduated_tokens
ORDER BY estimated_market_cap DESC
LIMIT 20
```

**Customization**:
- Adjust time range in `INTERVAL '48' HOUR`
- Change volume filter (`volume_24h > 10000`)
- Modify market cap estimation formula

## Query 4: KOL Trading Volume by Token

Shows which tokens KOLs are trading most.

```sql
-- KOL Trading Volume by Token
-- Aggregates KOL trading activity by token

WITH kol_wallets AS (
    SELECT * FROM (VALUES
        ('7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3'),
        ('GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE'),
        -- Add more KOL addresses
        ('Add_More_Here')
    ) AS t(wallet_address)
)

SELECT
    t.token_bought_address as token_address,
    COALESCE(t.token_bought_symbol, 'UNKNOWN') as token_symbol,
    COUNT(DISTINCT t.trader) as kol_count,
    SUM(t.token_bought_amount_usd) as total_kol_volume,
    COUNT(DISTINCT t.tx_id) as kol_trade_count,
    AVG(t.token_bought_amount_usd) as avg_kol_buy_size,
    MAX(t.token_bought_amount_usd) as max_kol_buy_size,
    MIN(t.block_time) as first_kol_buy,
    MAX(t.block_time) as last_kol_buy
FROM solana.dex.trades t
WHERE t.trader IN (SELECT wallet_address FROM kol_wallets)
    AND t.block_time > NOW() - INTERVAL '24' HOUR
    AND t.token_sold_address = 'So11111111111111111111111111111111111111112'
GROUP BY t.token_bought_address, t.token_bought_symbol
HAVING COUNT(DISTINCT t.trader) >= 2  -- At least 2 different KOLs
ORDER BY total_kol_volume DESC
LIMIT 30
```

## Query 5: Raydium High Volume Tokens

Specific to Raydium DEX trending tokens.

```sql
-- Raydium Trending Tokens
-- High volume tokens on Raydium over various timeframes

SELECT
    t.token_bought_address as token_address,
    COALESCE(t.token_bought_symbol, 'UNKNOWN') as token_symbol,
    SUM(CASE WHEN t.block_time > NOW() - INTERVAL '5' HOUR
        THEN t.token_bought_amount_usd ELSE 0 END) as volume_5h,
    SUM(CASE WHEN t.block_time > NOW() - INTERVAL '12' HOUR
        THEN t.token_bought_amount_usd ELSE 0 END) as volume_12h,
    SUM(CASE WHEN t.block_time > NOW() - INTERVAL '24' HOUR
        THEN t.token_bought_amount_usd ELSE 0 END) as volume_24h,
    COUNT(DISTINCT t.tx_id) as trade_count,
    COUNT(DISTINCT t.trader) as unique_traders
FROM solana.dex.trades t
WHERE t.project = 'raydium'
    AND t.block_time > NOW() - INTERVAL '24' HOUR
GROUP BY t.token_bought_address, t.token_bought_symbol
HAVING SUM(CASE WHEN t.block_time > NOW() - INTERVAL '24' HOUR
           THEN t.token_bought_amount_usd ELSE 0 END) > 50000
ORDER BY volume_24h DESC
LIMIT 50
```

## Finding KOL Wallets

To populate your KOL wallet list, you can:

1. **Manual Research**: Follow Twitter/X crypto influencers and note their wallet addresses
2. **Top Traders Query**: Find wallets with high successful trade rates
3. **Whale Wallets**: Track large holders of successful tokens

Example query to find potential KOLs:

```sql
-- Find Potential KOL Wallets
-- Identifies wallets with high trading success

WITH trader_performance AS (
    SELECT
        trader,
        COUNT(DISTINCT tx_id) as trade_count,
        SUM(token_bought_amount_usd) as total_volume,
        AVG(token_bought_amount_usd) as avg_trade_size,
        COUNT(DISTINCT token_bought_address) as unique_tokens
    FROM solana.dex.trades
    WHERE block_time > NOW() - INTERVAL '30' DAY
        AND token_bought_amount_usd > 100
    GROUP BY trader
    HAVING COUNT(DISTINCT tx_id) > 50
        AND SUM(token_bought_amount_usd) > 100000
)

SELECT
    trader as wallet_address,
    trade_count,
    ROUND(total_volume, 2) as total_volume_30d,
    ROUND(avg_trade_size, 2) as avg_trade_size,
    unique_tokens
FROM trader_performance
ORDER BY total_volume DESC
LIMIT 100
```

## Updating Query IDs in Code

After creating your queries in Dune:

1. Note the Query ID from the URL (e.g., `https://dune.com/queries/123456`)
2. Open `src/services/DuneClient.ts`
3. Replace placeholder IDs:

```typescript
// Line ~18
const queryId = '123456';  // Your KOL Buys query ID

// Line ~38
const queryId = '234567';  // Your Trending Tokens query ID

// Line ~58
const queryId = '345678';  // Your Pump.fun query ID
```

4. Rebuild the project: `npm run build`

## Tips for Query Optimization

1. **Use Indexed Columns**: Filter on `block_time`, `project`, `trader` for better performance
2. **Limit Time Ranges**: Don't query more than 7-30 days of data
3. **Use LIMIT**: Always limit results to what you need
4. **Test First**: Run queries in Dune UI before using in bot
5. **Cache Results**: Dune has rate limits; don't query too frequently
6. **Monitor Credits**: Check your Dune API credit usage regularly

## Troubleshooting Queries

**"Query timed out"**
- Reduce time range
- Add more specific filters
- Use indexed columns

**"No results returned"**
- Check wallet addresses are correct
- Verify time ranges include recent data
- Lower threshold amounts

**"Too many results"**
- Increase minimum amounts
- Shorten time ranges
- Add more filters

---

For more Dune query examples, visit:
- [Dune Docs](https://docs.dune.com/)
- [Dune Discord](https://discord.gg/dune)
- [Solana Queries](https://dune.com/browse/dashboards?q=solana)
