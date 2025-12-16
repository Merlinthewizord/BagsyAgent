# BagsyAgent Architecture

## System Overview

BagsyAgent is an autonomous trading system that monitors multiple data sources to identify profitable token trading opportunities on Solana.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BagsyAgent                              │
│                      (Main Orchestrator)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   DuneClient     │ │   BagsClient     │ │ SignalAnalyzer   │
│                  │ │                  │ │                  │
│ - KOL Tracking   │ │ - Get Quotes     │ │ - Score Signals  │
│ - Trending Data  │ │ - Execute Swaps  │ │ - Rank Tokens    │
│ - Market Stats   │ │ - Manage Wallet  │ │ - Filter Noise   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌──────────────────┐ ┌──────────────────┐
         │ TradingEngine    │ │ Position Manager │
         │                  │ │                  │
         │ - Entry Logic    │ │ - Track P&L      │
         │ - Exit Logic     │ │ - Risk Limits    │
         │ - Risk Mgmt      │ │ - Stop Loss/TP   │
         └──────────────────┘ └──────────────────┘
```

## Component Details

### 1. Main Orchestrator (`src/index.ts`)

**Responsibilities**:
- Initialize all services
- Run the main trading loop
- Handle graceful shutdown
- Log high-level events

**Trading Loop**:
```
1. Fetch market data (KOLs, trending tokens)
2. Analyze and score signals
3. Process high-score signals
4. Manage existing positions
5. Log portfolio status
6. Wait for next interval
```

**Frequency**: Configurable via `CHECK_INTERVAL_SECONDS` (default: 60s)

### 2. DuneClient (`src/services/DuneClient.ts`)

**Purpose**: Interface with Dune Analytics API to fetch on-chain data

**Methods**:

```typescript
getRecentKOLBuys(limit: number): Promise<KOLBuy[]>
```
- Fetches recent token purchases by KOL wallets
- Returns: Token address, symbol, KOL wallet, amount, timestamp

```typescript
getTrendingTokensByVolume(timeframe: string, limit: number): Promise<TrendingToken[]>
```
- Gets tokens with high trading volume
- Supports: 5h, 12h, 24h timeframes
- Returns: Token data with volume, market cap, price change

```typescript
getPumpFunGraduatesByMarketCap(limit: number): Promise<TrendingToken[]>
```
- Monitors newly launched Pump.fun tokens
- Sorted by market cap
- Returns: Token data with graduation info

**Error Handling**:
- Returns empty array on API errors
- Logs all errors for debugging
- Continues execution (non-blocking)

### 3. BagsClient (`src/services/BagsClient.ts`)

**Purpose**: Execute trades via bags.fm API

**Methods**:

```typescript
getQuote(inputMint, outputMint, amount, slippageBps): Promise<TradeQuote>
```
- Gets swap quote before execution
- Includes price impact and expected output
- Validates slippage tolerance

```typescript
buyToken(tokenMint, amountSol, slippageBps): Promise<Trade>
```
- Executes buy order (SOL → Token)
- Returns trade details and transaction signature
- Handles errors gracefully

```typescript
sellToken(tokenMint, tokenAmount, slippageBps): Promise<Trade>
```
- Executes sell order (Token → SOL)
- Closes position
- Returns SOL received

```typescript
getWalletBalance(): Promise<number>
```
- Fetches current SOL balance
- Used for risk management

**Transaction Flow**:
```
1. Get quote from bags.fm API
2. Validate quote (price impact, slippage)
3. Create swap transaction
4. Sign with wallet keypair
5. Send to Solana network
6. Confirm transaction
7. Return signature
```

### 4. SignalAnalyzer (`src/services/SignalAnalyzer.ts`)

**Purpose**: Analyze market data and generate trading signals

**Signal Scoring System**:

| Factor | Max Points | Description |
|--------|------------|-------------|
| **KOL Activity** | 5 | Multiple KOLs buying = stronger signal |
| **Large KOL Buy** | 2 | Single large buy (>5 SOL) |
| **High Volume** | 5 | 24h volume >$500k |
| **Price Momentum** | 3 | Positive 24h price change |
| **Multi-Source** | 2 | Trending on multiple DEXs |
| **Market Cap Penalty** | -2 | High market cap reduces score |

**Total Possible Score**: 0-15 points

**Methods**:

```typescript
analyzeSignals(kolBuys, trendingTokens, minKolBuy, minVolume): TokenSignal[]
```
- Aggregates data from all sources
- Calculates score for each token
- Returns sorted list of signals

```typescript
calculateTokenSignal(tokenAddress, kolBuys, trendingData): TokenSignal
```
- Internal scoring logic
- Applies all scoring factors
- Returns signal with score and reasons

**Signal Structure**:
```typescript
{
  tokenAddress: string,
  tokenSymbol: string,
  score: number,
  signals: string[],  // Human-readable reasons
  kolBuys: KOLBuy[],
  trendingData: TrendingToken[],
  timestamp: number
}
```

### 5. TradingEngine (`src/services/TradingEngine.ts`)

**Purpose**: Execute trades and manage positions

**Entry Logic**:
```
IF signal.score >= SIGNAL_SCORE_THRESHOLD
AND not already in position
AND portfolio has room (< MAX_TOTAL_PORTFOLIO_SOL)
THEN
  positionSize = calculatePositionSize(signal.score)
  buyToken(tokenAddress, positionSize)
  createPosition()
```

**Position Structure**:
```typescript
{
  tokenAddress: string,
  tokenSymbol: string,
  entryPrice: number,
  currentPrice: number,
  amountSol: number,
  tokenAmount: number,
  entryTime: number,
  stopLoss: number,
  takeProfit: number,
  pnlPercentage: number
}
```

**Exit Logic**:

1. **Stop Loss**: Price <= stopLoss → Sell immediately
2. **Take Profit**: Price >= takeProfit → Sell and lock profit
3. **Trailing Stop**: If P&L > 30%, move stop to breakeven
4. **Time Limit**: Close after 24h regardless of P&L

**Position Sizing**:
```
baseSize = MAX_POSITION_SIZE_SOL
scoreMultiplier = min(score / 10, 1.5)
adjustedSize = baseSize * scoreMultiplier
finalSize = min(adjustedSize, availableCapital)
```

**Methods**:

```typescript
processSignals(signals: TokenSignal[]): Promise<void>
```
- Main entry point for new signals
- Opens positions for high-score signals
- Manages existing positions

```typescript
openPosition(signal: TokenSignal): Promise<void>
```
- Calculates position size
- Executes buy order
- Creates position tracking

```typescript
managePositions(): Promise<void>
```
- Updates position prices
- Checks exit conditions
- Executes sells when needed

```typescript
closePosition(tokenAddress: string, reason: string): Promise<void>
```
- Sells entire position
- Logs P&L
- Removes from tracking

## Data Flow

### Complete Trade Flow

```
1. COLLECTION
   DuneClient fetches:
   - Recent KOL buys (last 12h)
   - Trending tokens (24h volume)
   - Pump.fun graduates

2. ANALYSIS
   SignalAnalyzer:
   - Aggregates data by token
   - Calculates scores
   - Ranks opportunities

3. FILTERING
   TradingEngine:
   - Filters by score threshold
   - Checks existing positions
   - Validates portfolio limits

4. EXECUTION
   BagsClient:
   - Gets quote from bags.fm
   - Signs transaction
   - Sends to Solana
   - Confirms execution

5. TRACKING
   TradingEngine:
   - Creates position record
   - Sets stop loss / take profit
   - Begins monitoring

6. MANAGEMENT
   Loop (every iteration):
   - Update current price
   - Check exit conditions
   - Execute sells if needed
   - Update position tracking

7. EXIT
   When condition met:
   - Sell position via BagsClient
   - Calculate P&L
   - Log results
   - Free up capital
```

## Configuration System

**Environment Variables** → **Config Object** → **Service Initialization**

```typescript
// .env file
DUNE_API_KEY=...
MAX_POSITION_SIZE_SOL=1.0

// config/index.ts
loadConfig() {
  return {
    duneApiKey: process.env.DUNE_API_KEY,
    maxPositionSizeSol: parseFloat(process.env.MAX_POSITION_SIZE_SOL)
  }
}

// index.ts
const config = loadConfig();
const tradingEngine = new TradingEngine(bagsClient, config, logger);
```

## Logging System

**Winston Logger** with multiple transports:

1. **Console**: Real-time colored output
2. **combined.log**: All events (info, warn, error)
3. **error.log**: Errors only

**Log Levels**:
- `error`: Critical failures
- `warn`: Important warnings
- `info`: General operations (default)
- `debug`: Detailed debugging

**Key Events Logged**:
- Agent start/stop
- Market data fetches
- Signal generation
- Trade execution
- Position updates
- Errors and warnings

## Error Handling Strategy

**Philosophy**: Never stop the bot for recoverable errors

1. **API Failures**: Log and continue with empty data
2. **Trade Failures**: Log and skip that trade
3. **Network Issues**: Retry with backoff
4. **Invalid Data**: Filter and log

**Critical Failures** (stop bot):
- Invalid configuration
- Missing API keys
- Invalid wallet key

## Security Considerations

1. **Private Key**: Stored in environment, never logged
2. **API Keys**: Environment variables only
3. **Transaction Signing**: Local signing, never share key
4. **Input Validation**: All external data validated
5. **Rate Limiting**: Respects API rate limits

## Performance Optimizations

1. **Parallel Fetching**: All data sources queried simultaneously
2. **Efficient Filtering**: Early filtering of low-score signals
3. **Position Caching**: In-memory position tracking
4. **Signal Cleanup**: Old signals removed to save memory

## Extensibility Points

### Adding New Data Sources

1. Create new client in `src/services/`
2. Implement data fetching methods
3. Add to main orchestrator
4. Update `SignalAnalyzer` to include new data

### Adding New Signal Factors

1. Update `calculateTokenSignal()` in `SignalAnalyzer`
2. Add new scoring logic
3. Document in README
4. Adjust max score if needed

### Adding New Exit Strategies

1. Update `managePositions()` in `TradingEngine`
2. Add condition checks
3. Call `closePosition()` when triggered
4. Log reasoning

## Testing Strategy

### Manual Testing
1. Dry run with logs
2. Small position sizes
3. Monitor for 24h
4. Review logs for issues

### Integration Points to Test
- [ ] Dune API connection
- [ ] Bags.fm API quotes
- [ ] Transaction signing
- [ ] Position tracking
- [ ] Signal scoring
- [ ] Exit conditions

## Future Enhancements

Potential improvements:
- WebSocket for real-time price updates
- Advanced technical indicators
- Machine learning for signal scoring
- Backtesting framework
- Web dashboard for monitoring
- Multi-wallet support
- Copy trading feature
- Telegram notifications

---

This architecture is designed to be:
- **Modular**: Easy to replace components
- **Extensible**: Simple to add features
- **Robust**: Handles errors gracefully
- **Transparent**: Comprehensive logging
- **Efficient**: Optimized performance
