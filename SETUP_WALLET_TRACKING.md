# Setup Wallet Tracking

The server now automatically:
1. **Fetches and displays all tokens** in your wallet
2. **Monitors all transactions** and displays them in Recent Trades

## Configuration Required

You need to set these environment variables in `server/.env`:

```bash
# Copy the example file
cd server
cp .env.example .env
```

Then edit `.env` and add:

```bash
# Your Solana wallet public key (the wallet you want to track)
WALLET_PUBLIC_KEY=YourWalletPublicKeyHere

# Solana RPC URL (default works, or use your own)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## How It Works

Once configured:

### Wallet Positions:
1. **Server starts** and immediately fetches all tokens from your wallet
2. **Updates every 30 seconds** automatically
3. **Broadcasts via WebSocket** to all connected frontend clients
4. **Frontend displays** all tokens in the "Wallet Positions" panel

### Recent Trades:
1. **Server starts** and fetches 20 most recent transactions
2. **Checks for new transactions every 5 minutes**
3. **Parses all buy/sell/transfer transactions** from your wallet
4. **Saves to database** and displays in "Recent Trades" section
5. **Shows**: token symbol, type (buy/sell), amount, SOL spent, price, and fee

## What Gets Displayed

For each token in your wallet:
- Token symbol and name
- Balance (number of tokens)
- Current price (USD)
- Total value (USD)
- Token mint address (clickable link to Solscan)

## No Wallet Configured?

If you don't set `WALLET_PUBLIC_KEY`:
- Server logs: "No tokens found or wallet not configured"
- Frontend shows: "No tokens in wallet"

## Testing

1. Start the server:
```bash
cd server
npm install
npm run dev
```

2. Check the logs for:
```
Fetching initial wallet tokens...
✅ Found X tokens in wallet
Fetching recent wallet transactions...
✅ Found X recent transactions
```

3. Open the frontend at http://localhost:3000
4. Check the "Wallet Positions" panel for all your tokens
5. Check the "Recent Trades" panel for all your transaction history
6. Wait 5 minutes and make a trade - it should appear automatically

## Market Cap Issue Fixed

The $BAGSY market cap tracking should also be working now. It fetches from:
- DexScreener (primary)
- Birdeye (fallback)
- Jupiter (fallback)

Updates every 60 seconds and displays in:
- Portfolio Stats card
- Goals card (progress to $100M)
