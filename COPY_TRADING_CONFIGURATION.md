# Copy Trading Configuration Update

## Summary
Updated BagsyAgent to use a curated list of 314 wallet addresses for copy trading with fixed buy amounts and profit targets.

## Changes Made

### 1. Wallet List (`src/data/kol-wallets.ts`)
- **REPLACED** entire file with 314 curated wallet addresses
- Removed performance-based filtering logic
- All wallets in the list are now tracked and mirrored
- Each wallet entry includes: address, name, and emoji identifier

### 2. Copy Trading Configuration (`src/services/CopyTradingManager.ts`)
- **Updated** `defaultBuyAmount` from `0.5` SOL to `0.01` SOL
- **Removed** dynamic buy amount scaling based on KOL trade size
- **Updated** `getWalletsToMirror()` to return all 314 wallets (no filtering)
- **Updated** sync to mirror all 314 wallets instead of just top 20

### 3. Profit Target (`src/config/index.ts`)
- **Updated** `takeProfitPercentage` from `50%` to `100%` (2x profit target)

### 4. Main Bot Configuration (`src/index.ts`)
- **Updated** default `ODINBOT_DEFAULT_BUY_AMOUNT` from `0.5` to `0.01`
- Kept `ODINBOT_DEFAULT_SELL_PERCENTAGE` at `100` (2x profit)

### 5. Bug Fixes
- **Fixed** import in `CopyTradingManager.ts` (removed `getWalletsByPerformance`)
- **Fixed** `KOLConsensusTracker.ts` to match new `getWalletStats()` return type

## Trading Behavior

### Buy Behavior
- Bot will mirror ALL 314 wallet addresses
- When any tracked wallet buys a token, bot will buy with **0.01 SOL**
- Fixed position sizing regardless of the tracked wallet's trade size

### Sell Behavior
The bot will sell in TWO scenarios:
1. **Mirror Sell (Primary)**: When the tracked wallet sells the same token
2. **Take Profit (Secondary)**: When the position reaches 100% profit (2x)

This ensures both copy trading behavior AND downside protection via profit taking.

## Configuration via Environment Variables

You can override these settings in your `.env` file:

```bash
# OdinBot Copy Trading Settings
ODINBOT_ENABLED=true
ODINBOT_API_KEY=your_api_key_here

# Buy amount per trade (default: 0.01 SOL)
ODINBOT_DEFAULT_BUY_AMOUNT=0.01

# Sell percentage for take profit (default: 100 = 2x)
ODINBOT_DEFAULT_SELL_PERCENTAGE=100

# How often to sync wallet list with OdinBot (default: 24 hours)
ODINBOT_SYNC_INTERVAL_HOURS=24

# General Trading Settings
TAKE_PROFIT_PERCENTAGE=100
```

## Testing

Build the project:
```bash
npm run build
```

Run the bot:
```bash
npm start
```

The bot will:
1. Sync all 314 wallets with OdinBot on startup
2. Monitor all tracked wallets for buy/sell transactions
3. Execute copy trades with 0.01 SOL per buy
4. Automatically sell when tracked wallet sells OR when position hits 2x

## Wallet List

The 314 wallets include notable traders such as:
- void (FtGWiQYZR8h1yVoSApwY2JPVrWXc7BJyvyiS3Xr1yZ7C)
- Marz (BHkqZzSzmQiNkehGUA3Krufmq5KGxdkNfRNCock6jbv1)
- dummydev (9TfRYUWoro1DiHGry3bdKDbvu2tXfarCXy8dnidi57VY)
- ...and 311 more

See `src/data/kol-wallets.ts` for the complete list.

## Notes

- OdinBot inherently mirrors both BUY and SELL actions of tracked wallets
- The 100% sell percentage is an ADDITIONAL safety mechanism for profit taking
- The bot will NOT use dynamic position sizing based on tracked wallet trade sizes
- All trades use a fixed 0.01 SOL buy amount
