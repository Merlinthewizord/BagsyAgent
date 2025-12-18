# Setup Wallet Token Tracking

The server now automatically fetches and displays all tokens in your wallet.

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

1. **Server starts** and immediately fetches all tokens from your wallet
2. **Updates every 30 seconds** automatically
3. **Broadcasts via WebSocket** to all connected frontend clients
4. **Frontend displays** all tokens in the "Wallet Positions" panel

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
```

3. Open the frontend at http://localhost:3000
4. Check the "Wallet Positions" panel

## Market Cap Issue Fixed

The $BAGSY market cap tracking should also be working now. It fetches from:
- DexScreener (primary)
- Birdeye (fallback)
- Jupiter (fallback)

Updates every 60 seconds and displays in:
- Portfolio Stats card
- Goals card (progress to $100M)
