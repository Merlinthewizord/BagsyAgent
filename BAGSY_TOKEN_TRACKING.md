# $BAGSY Token Market Cap Tracking

## Overview
The BagsyAgent now automatically tracks and displays the live market cap of the $BAGSY token.

**Token Contract Address:** `hqgZKMLZRN4tMf3vtnBzFL6L33cwPqHbR7t1LRrBAGS`

## How It Works

### Backend (Server)
1. **BagsyTokenService** (`server/src/bagsyTokenService.ts`)
   - Fetches market cap from multiple DEX APIs:
     - DexScreener (primary)
     - Birdeye (fallback)
     - Jupiter (fallback)
   - Caches data for 1 minute to avoid rate limits
   - Automatically retries different sources on failure

2. **Server Integration** (`server/src/server.ts`)
   - Fetches market cap on server startup
   - Updates every 60 seconds
   - Broadcasts updates via WebSocket to all connected clients
   - Updates both Portfolio stats and Mission Goals

### Frontend

1. **Portfolio Component** (`frontend/src/components/PortfolioStats.tsx`)
   - Displays market cap in a premium card with purple gradient
   - Shows "Live" badge to indicate real-time tracking
   - Includes clickable link to view token on Solscan
   - Format: `$X.XXM` (millions)

2. **Goals Component** (`frontend/src/components/GoalsDisplay.tsx`)
   - Tracks progress toward $100M market cap goal
   - Updates progress bar automatically
   - Shows achievement badges at 25%, 50%, 75%

## Expected Behavior

### When Server Starts:
```
🚀 Bagsy API Server running on port 3001
💬 WebSocket server ready
📊 Dashboard: http://localhost:3000
Fetching initial $BAGSY market cap...
📡 Attempting to fetch from DexScreener...
   Found X pairs on DexScreener
   ✅ BAGSY Market Cap from DexScreener: $X.XXM
✅ Initial $BAGSY market cap: $X.XXM
   Progress to $100M: X.X%
```

### Every Minute:
```
Updated $BAGSY market cap: $X.XXM
```

### On Frontend:
- **Portfolio Card**: Shows market cap under "$BAGSY Token" section with diamond emoji 💎
- **Goals Card**: Shows "$ BAGSY to $100M Market Cap" goal with rocket emoji 🚀
- **Real-time Updates**: Both components update automatically without page refresh

## Troubleshooting

### Market Cap Shows $0:
1. Check server logs for API errors
2. Verify the token has trading pairs on DexScreener
3. Check if APIs are rate-limiting (waits 1 minute between retries)
4. Ensure axios is installed: `cd server && npm install`

### No Updates:
1. Verify WebSocket connection in browser console
2. Check server is running: `cd server && npm run dev`
3. Confirm port 3001 is accessible

### API Debugging:
The server logs show detailed information:
- `📡 Attempting to fetch from DexScreener...` - Trying primary source
- `✅ BAGSY Market Cap from DexScreener...` - Success
- `❌ No pairs found...` - Token not found on that DEX
- `⚠️ Could not fetch...` - Will retry in 1 minute

## Manual Testing

### Start the Server:
```bash
cd BagsyAgent/server
npm install
npm run dev
```

### Watch the Logs:
You should see the market cap fetch on startup and every minute thereafter.

### Check the Frontend:
```bash
cd BagsyAgent/frontend
npm install
npm run dev
```

Open `http://localhost:3000` and check:
1. Portfolio card shows $BAGSY market cap
2. Goals card shows progress to $100M
3. Values update every minute

## Notes

- Market cap data comes from real DEX trading pairs
- Data updates every 60 seconds
- 1-minute cache prevents excessive API calls
- Multiple fallback sources ensure reliability
- Token address is clickable (links to Solscan)
