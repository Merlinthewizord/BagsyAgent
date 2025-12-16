# BagsyAgent Setup Guide

This guide will walk you through setting up BagsyAgent step-by-step.

## Step 1: Prerequisites

### Install Node.js

Download and install Node.js v18+ from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

### Create a Solana Wallet

If you don't have a Solana wallet:

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Create a new wallet
solana-keygen new --outfile ~/.config/solana/trading-bot.json

# Get your public address
solana-keygen pubkey ~/.config/solana/trading-bot.json

# Get your private key (base58)
cat ~/.config/solana/trading-bot.json
```

**⚠️ IMPORTANT**:
- Backup your wallet seed phrase securely
- Never share your private key
- Fund this wallet with SOL for trading

## Step 2: Get API Keys

### Dune Analytics API Key

1. Go to [https://dune.com](https://dune.com)
2. Sign up or log in
3. Navigate to Settings > API
4. Create a new API key
5. Copy the key (starts with `DUNE_`)

Your provided key: `5njv1Lb6dxqEF32tN185oFFSuFba1ITj`

### Bags.fm API Key

1. Go to [https://dev.bags.fm](https://dev.bags.fm)
2. Sign up for a developer account
3. Create a new API key
4. Copy the key for later use

### Solana RPC URL

Options:
- **Free Public**: `https://api.mainnet-beta.solana.com` (rate limited)
- **Helius**: [https://helius.dev](https://helius.dev) (recommended)
- **QuickNode**: [https://quicknode.com](https://quicknode.com)
- **Alchemy**: [https://alchemy.com](https://alchemy.com)

## Step 3: Create Dune Queries

You need to create custom Dune queries to track KOLs and trending tokens.

### Query 1: KOL Buys

Create a query that tracks recent token purchases by known KOL wallets:

```sql
-- Example KOL Buys Query
SELECT
    block_time as timestamp,
    token_bought_address as token_address,
    token_bought_symbol as token_symbol,
    trader as kol_wallet,
    token_bought_amount_usd / sol_price as amount_sol,
    tx_id as tx_signature
FROM solana.dex.trades
WHERE trader IN (
    -- Add known KOL wallet addresses here
    '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3',
    'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE'
    -- Add more KOL addresses
)
AND block_time > now() - interval '12' hour
AND token_bought_amount_usd > 100
ORDER BY block_time DESC
LIMIT 100
```

### Query 2: Trending Tokens by Volume

```sql
-- Example Trending Tokens Query
SELECT
    token_bought_address as token_address,
    token_bought_symbol as token_symbol,
    SUM(token_bought_amount_usd) as volume_24h,
    COUNT(*) as trade_count,
    AVG(token_bought_amount_usd) as avg_trade_size
FROM solana.dex.trades
WHERE block_time > now() - interval '24' hour
AND project IN ('raydium', 'orca', 'jupiter')
GROUP BY token_bought_address, token_bought_symbol
HAVING SUM(token_bought_amount_usd) > 100000
ORDER BY volume_24h DESC
LIMIT 50
```

### Query 3: Pump.fun Graduates

```sql
-- Example Pump.fun Query
SELECT
    token_address,
    token_symbol,
    market_cap,
    volume_24h,
    creation_time
FROM pump_fun.tokens
WHERE graduated = true
AND creation_time > now() - interval '24' hour
ORDER BY market_cap DESC
LIMIT 20
```

After creating these queries:
1. Note down the Query IDs (found in the URL)
2. Update `src/services/DuneClient.ts` with your query IDs

## Step 4: Configure the Bot

1. **Copy environment template**:
```bash
cp .env.example .env
```

2. **Edit `.env` file**:
```bash
nano .env  # or use your preferred editor
```

3. **Fill in your credentials**:

```env
# Replace with your actual values
DUNE_API_KEY=5njv1Lb6dxqEF32tN185oFFSuFba1ITj
BAGS_API_KEY=your_bags_api_key_from_step_2
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your_base58_private_key_from_step_1

# Trading parameters (start conservative!)
MAX_POSITION_SIZE_SOL=0.5
MAX_TOTAL_PORTFOLIO_SOL=2.0
MIN_LIQUIDITY_USD=50000
SLIPPAGE_BPS=100

# Risk management
STOP_LOSS_PERCENTAGE=20
TAKE_PROFIT_PERCENTAGE=50

# Agent settings
CHECK_INTERVAL_SECONDS=60
SIGNAL_SCORE_THRESHOLD=7
```

## Step 5: Install and Build

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

If you see any errors, check that:
- Node.js version is 18+
- All dependencies installed successfully

## Step 6: Test Run (DRY RUN)

Before trading real money, verify everything works:

```bash
# Start the bot
npm start
```

You should see:
```
Starting BagsyAgent - Autonomous Token Trading Bot
Configuration loaded
Wallet balance: X.XXXX SOL
=== Trading iteration 1 ===
Fetching market data...
```

**Verify**:
- ✅ Bot starts without errors
- ✅ Connects to Dune API successfully
- ✅ Fetches wallet balance
- ✅ Logs appear in console and files

**If there are errors**:
- Check API keys are correct
- Verify wallet private key is valid
- Ensure RPC URL is accessible
- Check Dune query IDs are correct

## Step 7: Update Dune Query IDs

Edit `src/services/DuneClient.ts`:

```typescript
// Line ~18
const queryId = 'YOUR_KOL_BUYS_QUERY_ID';

// Line ~38
const queryId = 'YOUR_TRENDING_TOKENS_QUERY_ID';

// Line ~58
const queryId = 'YOUR_PUMPFUN_QUERY_ID';
```

Then rebuild:
```bash
npm run build
```

## Step 8: Monitor First Trades

When you're ready to trade:

1. **Start small**: Set low limits in `.env`
```env
MAX_POSITION_SIZE_SOL=0.1
MAX_TOTAL_PORTFOLIO_SOL=0.5
```

2. **Start the bot**:
```bash
npm start
```

3. **Monitor actively**: Watch the logs for:
- Signal detection
- Trade execution
- Position management
- Errors or warnings

4. **Check log files**:
```bash
tail -f combined.log
tail -f error.log
```

## Step 9: Optimize Parameters

After observing the bot for a few hours/days:

### If too many trades:
- Increase `SIGNAL_SCORE_THRESHOLD` (try 8 or 9)
- Increase `KOL_BUY_MIN_AMOUNT_SOL`
- Increase `TRENDING_TOKEN_MIN_VOLUME_24H`

### If too few trades:
- Decrease `SIGNAL_SCORE_THRESHOLD` (try 6 or 5)
- Decrease `MIN_LIQUIDITY_USD`
- Add more KOL addresses to Dune query

### If losing money:
- Tighten `STOP_LOSS_PERCENTAGE` (try 15%)
- Widen `TAKE_PROFIT_PERCENTAGE` (try 100%)
- Reduce position sizes
- Review losing trades in logs

## Step 10: Production Deployment

### Run as a Service (Linux/Mac)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/bagsyagent.service
```

Add:
```ini
[Unit]
Description=BagsyAgent Trading Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/BagsyAgent
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable bagsyagent
sudo systemctl start bagsyagent
sudo systemctl status bagsyagent
```

### Run with PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start dist/index.js --name bagsyagent

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup

# Monitor
pm2 monit
pm2 logs bagsyagent
```

## Maintenance

### Daily Tasks
- Check bot is running
- Review trade performance in logs
- Verify wallet balance
- Monitor error logs

### Weekly Tasks
- Analyze P&L
- Adjust parameters if needed
- Update KOL list in Dune queries
- Backup logs

### Monthly Tasks
- Review overall performance
- Update dependencies: `npm update`
- Refine trading strategy
- Consider adding new data sources

## Troubleshooting

### Bot keeps buying the same tokens
- Add token blacklist feature
- Increase `CHECK_INTERVAL_SECONDS`
- Improve signal freshness checking

### High slippage on trades
- Increase `MIN_LIQUIDITY_USD`
- Reduce `MAX_POSITION_SIZE_SOL`
- Use better RPC endpoint

### Missing good opportunities
- Lower `SIGNAL_SCORE_THRESHOLD`
- Add more data sources
- Reduce `CHECK_INTERVAL_SECONDS`

### Bot crashes frequently
- Check RPC rate limits
- Verify API keys haven't expired
- Review error logs for patterns
- Ensure sufficient SOL for fees

## Security Checklist

- [ ] Private keys stored securely
- [ ] `.env` file in `.gitignore`
- [ ] API keys rotated regularly
- [ ] Wallet has only trading funds
- [ ] Logs don't contain sensitive data
- [ ] Server/computer is secure
- [ ] Backup of configuration exists

## Support

Need help? Check:
1. This guide thoroughly
2. Main README.md
3. Error logs: `error.log`
4. GitHub issues

---

Good luck and trade safely! 🚀
