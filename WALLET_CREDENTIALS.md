# Bagsy Wallet Credentials - CONFIGURED ✅

## Wallet Information
- **Public Key**: `7ebKtZD4zdXxDxP4E4DcnPoAjp2mPER9471f36U56JHJ`
- **Private Key**: Configured in `.env` (DO NOT COMMIT)

## Configuration Status

### ✅ Main Bot (`.env`)
```bash
WALLET_PRIVATE_KEY=3ZrQmLth6jZ9fht2eup9hf6A21xKpUn8TUXf7CC7axZcBZa73j79Wtkx4GkmT66Cew8eqbnwBLCBPnhtAKxbSJZr
```

**Purpose**: Execute copy trades from the 314 tracked wallets
- Buy with 0.01 SOL when tracked wallets buy
- Sell when tracked wallets sell
- Also sell at 100% profit (2x)

### ✅ Server (` server/.env`)
```bash
WALLET_PUBLIC_KEY=7ebKtZD4zdXxDxP4E4DcnPoAjp2mPER9471f36U56JHJ
```

**Purpose**: Monitor wallet for dashboard display
- Track all token balances
- Monitor transaction history
- Display portfolio value
- Show buy/sell activities

## Copy Trading Configuration

The bot is configured to:
1. ✅ Track 314 curated KOL wallets
2. ✅ Buy with 0.01 SOL when any tracked wallet buys
3. ✅ Sell when tracked wallet sells (mirror behavior)
4. ✅ Also sell at 100% profit (2x) as safety mechanism

## Important Configuration Variables

### Main Bot Settings
- `MAX_POSITION_SIZE_SOL=1.0` - Maximum SOL per position
- `MAX_TOTAL_PORTFOLIO_SOL=10.0` - Maximum total portfolio size
- `TAKE_PROFIT_PERCENTAGE=100` - Sell at 2x (100% profit)
- `KOL_BUY_MIN_AMOUNT_SOL=0.01` - Minimum buy amount

### OdinBot Copy Trading
- `ODINBOT_ENABLED=true` - Enable copy trading
- `ODINBOT_DEFAULT_BUY_AMOUNT=0.01` - 0.01 SOL per trade
- `ODINBOT_DEFAULT_SELL_PERCENTAGE=100` - Sell at 2x
- `ODINBOT_SYNC_INTERVAL_HOURS=24` - Sync wallet list daily

### Bagsy Token
- `BAGSY_TOKEN_MINT=hqgZKMLZRN4tMf3vtnBzFL6L33cwPqHbR7t1LRrBAGS`

## Required API Keys (You Need to Add)

Before running the bot, you need to configure these API keys in `.env`:

1. **DUNE_API_KEY** - For Dune Analytics (if using Dune data)
2. **BAGS_API_KEY** - For Bags.fm trading API
3. **ODINBOT_API_KEY** - For OdinBot copy trading service
4. **ANTHROPIC_API_KEY** - For Bagsy's personality (server only)
5. **BOT_API_KEY** - Secret key for bot-to-server communication

## Starting the Bot

### 1. Start the Server (Dashboard)
```bash
cd server
npm install
npm run dev
```
Server runs on: http://localhost:3001
Dashboard: http://localhost:3000

### 2. Start the Main Trading Bot
```bash
npm install
npm run build
npm start
```

The bot will:
- Connect to OdinBot and sync all 314 wallets
- Monitor for buy signals from tracked wallets
- Execute trades with Bagsy's wallet
- Report all activity to the dashboard

## Security Notes

⚠️ **CRITICAL**:
- `.env` files are in `.gitignore` - DO NOT commit them
- Private key is sensitive - keep it secure
- Only share public key for monitoring purposes
- Ensure you have SOL in the wallet for trading and transaction fees

## Verification

Once running, check:
1. Server logs show wallet tokens and transactions
2. Dashboard displays Bagsy's positions
3. Bot logs show OdinBot sync with 314 wallets
4. Trades appear in both bot logs and dashboard

## View Wallet on Solscan
https://solscan.io/account/7ebKtZD4zdXxDxP4E4DcnPoAjp2mPER9471f36U56JHJ
