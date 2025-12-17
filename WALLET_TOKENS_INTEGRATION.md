# Wallet Tokens Integration Guide

## Overview

This document outlines the implementation of the "All Active Wallet Positions" feature for BagsyAgent. The feature displays all SPL tokens in the connected wallet at all times, alongside the bot's active trading positions.

## What Was Implemented

### 1. Backend Components

#### a. WalletService (`src/services/WalletService.ts`)
- New service that fetches all SPL tokens from the wallet
- Retrieves token metadata (symbol, name, price) from Jupiter API
- Returns token balances with USD values
- Located at: `BagsyAgent/src/services/WalletService.ts`

#### b. Server Updates (`server/src/server.ts`)
- Added `currentWalletTokens` state variable to track wallet tokens
- New GET endpoint: `/api/wallet-tokens` - returns current wallet tokens
- New POST endpoint: `/api/bot/wallet-tokens` - receives token updates from bot
- WebSocket event: `wallet-tokens` - broadcasts token updates to clients
- Changes made via `sed` commands (backup available at `server/src/server.ts.backup`)

### 2. Frontend Components

#### a. PositionsPanel Updates (`frontend/src/components/PositionsPanel.tsx`)
- Added tab interface to switch between "All Wallet" and "Bot Trades"
- Default view shows "All Wallet" tokens
- Displays:
  - Token symbol and name
  - Token balance
  - USD price (if available)
  - Total USD value (if available)
  - Token address with Solscan link
- Backup available at: `frontend/src/components/PositionsPanel.tsx.backup`

## Integration Steps

To complete the integration, you need to update the trading bot's main loop (`src/index.ts`) to fetch and report wallet tokens:

### Step 1: Import WalletService

Add to imports in `src/index.ts`:
```typescript
import { WalletService } from './services/WalletService';
```

### Step 2: Initialize WalletService

After initializing other services (around line 38), add:
```typescript
const walletService = new WalletService(
  bagsClient.connection,  // Note: You may need to expose connection as public
  bagsClient.wallet.publicKey,  // Note: You may need to expose wallet publicKey
  logger
);
```

**Important:** The `BagsClient` class currently has `connection` and `wallet` as private properties. You'll need to either:
- Make them public, OR
- Add getter methods, OR
- Pass them as constructor parameters to WalletService

### Step 3: Fetch and Report Wallet Tokens

In the main trading loop (around line 172, after reporting portfolio and positions), add:
```typescript
// Fetch and report all wallet tokens
const walletTokens = await walletService.getAllWalletTokens();
if (walletTokens.length > 0) {
  logger.info(`Wallet contains ${walletTokens.length} tokens`);
  await apiReporter.reportWalletTokens(walletTokens);
}
```

### Step 4: Add reportWalletTokens Method to ApiReporter

In `src/services/ApiReporter.ts`, add this method after `reportPositions`:
```typescript
async reportWalletTokens(tokens: Array<{
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  priceUsd?: number;
  valueUsd?: number;
}>): Promise<void> {
  if (!this.enabled) return;

  try {
    await this.client.post('/api/bot/wallet-tokens', tokens);
    this.logger.debug('Wallet tokens reported to API');
  } catch (error: any) {
    this.logger.error('Failed to report wallet tokens', { error: error.message });
  }
}
```

## Testing

### 1. Start the API Server
```bash
cd BagsyAgent/server
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd BagsyAgent/frontend
npm install
npm run dev
```

### 3. Start the Trading Bot
```bash
cd BagsyAgent
npm install
npm start
```

### 4. Verify

1. Open the frontend at `http://localhost:3000`
2. Check the "Positions" panel on the right
3. Click the "All Wallet" tab
4. You should see all SPL tokens in your wallet
5. Click the "Bot Trades" tab to see active bot positions

## Files Modified

- ✅ `server/src/server.ts` - Added wallet tokens endpoints and WebSocket support
- ✅ `frontend/src/components/PositionsPanel.tsx` - Added wallet tokens tab and display
- ✅ `src/services/WalletService.ts` - Created new service (NEW FILE)
- ⏳ `src/index.ts` - Needs integration (NOT YET DONE)
- ⏳ `src/services/ApiReporter.ts` - Needs reportWalletTokens method (NOT YET DONE)
- ⏳ `src/services/BagsClient.ts` - May need to expose connection/wallet (NOT YET DONE)

## Notes

- The wallet tokens are fetched every trading cycle (default: 60 seconds)
- Token prices are fetched from Jupiter API with a 5-second timeout
- If price data is unavailable, tokens are still displayed with balance only
- The display sorts tokens by USD value (highest first)
- All changes are backward-compatible - bot positions still work as before

## Rollback

If you need to rollback:
```bash
cd BagsyAgent
cp server/src/server.ts.backup server/src/server.ts
cp frontend/src/components/PositionsPanel.tsx.backup frontend/src/components/PositionsPanel.tsx
rm src/services/WalletService.ts
```
