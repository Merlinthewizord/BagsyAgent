# Solana RPC Configuration for Wallet Tracking

## Current Status

✅ **Wallet Positions**: Working - Successfully fetching tokens from Bagsy's wallet
❌ **Recent Trades**: Failing - RPC rate limiting (429 errors)

## The Issue

The free Solana RPC endpoint (`https://api.mainnet-beta.solana.com`) has very strict rate limits:
- **Wallet token fetching**: Works (1 request per 30 seconds)
- **Transaction history**: Fails (requires multiple rapid requests)

The server is getting `429 Too Many Requests` errors when trying to fetch transaction history because it needs to:
1. Get transaction signatures (1 request)
2. Fetch details for each transaction (20+ requests for 20 transactions)

## Solution: Use a Premium RPC Provider

You need a paid RPC service with higher rate limits. Here are recommended providers:

### 1. Helius (Recommended)
- **Free tier**: 100 requests/second
- **Pricing**: Free tier available, paid plans from $20/month
- **Sign up**: https://helius.dev
- **Setup**:
  ```bash
  # In server/.env
  SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
  ```

### 2. QuickNode
- **Free tier**: Limited requests
- **Pricing**: From $49/month for production
- **Sign up**: https://quicknode.com
- **Setup**:
  ```bash
  # In server/.env
  SOLANA_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_API_KEY/
  ```

### 3. Alchemy
- **Free tier**: 300 million compute units/month
- **Pricing**: Free tier generous, paid from $49/month
- **Sign up**: https://alchemy.com
- **Setup**:
  ```bash
  # In server/.env
  SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
  ```

### 4. GenesysGo (Shadow)
- **Pricing**: From $25/month
- **Sign up**: https://genesysgo.com
- **Setup**:
  ```bash
  # In server/.env
  SOLANA_RPC_URL=https://ssc-dao.genesysgo.net/YOUR_API_KEY
  ```

## Quick Fix: Get Helius Free Tier

1. Go to https://helius.dev
2. Sign up for free account
3. Create a new project
4. Copy your API key
5. Update both `.env` files:

**Main bot (`.env`):**
```bash
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
```

**Server (`server/.env`):**
```bash
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
```

## What Works Now (Even with Rate Limits)

✅ **Wallet Positions Panel**:
- Shows all tokens in Bagsy's wallet
- Updates every 30 seconds
- Displays token symbol, balance, price, and value
- Currently showing: 1 token

✅ **Portfolio Stats**:
- Total wallet value
- $BAGSY token market cap tracking
- Progress to goals

❌ **Recent Trades Panel** (needs RPC upgrade):
- Will show buy/sell transactions
- Transaction history with prices
- Fees paid
- Links to Solscan

## Testing After RPC Setup

Once you add a premium RPC endpoint:

1. Restart the server:
```bash
cd server
npm run dev
```

2. Look for these messages:
```
Fetching initial wallet tokens...
✅ Found X tokens in wallet
Fetching recent wallet transactions...
✅ Found X recent transactions  ← This should now work!
```

3. Check the dashboard at http://localhost:3000
   - Wallet Positions should show all tokens
   - Recent Trades should show transaction history

## Alternative: Reduce Transaction Polling

If you can't use a premium RPC right now, I can modify the code to:
- Reduce transaction polling frequency (from every 5 min to every 30 min)
- Fetch fewer transactions (from 20 to 5)
- Add exponential backoff for rate limits

Let me know if you want me to implement these temporary workarounds!

## Summary

- **Wallet positions**: ✅ Working perfectly
- **Transaction history**: ❌ Needs premium RPC
- **Quick fix**: Sign up for free Helius account
- **Cost**: Free tier available, $20-50/month for production use
