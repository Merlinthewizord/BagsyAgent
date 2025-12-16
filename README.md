# BagsyAgent - Autonomous Token Trading Bot

An autonomous Solana token trading agent that follows KOL (Key Opinion Leader) buys and trending tokens to identify and execute profitable trades.

## Features

- **KOL Tracking**: Monitors wallet activities of influential traders and KOLs
- **Trend Analysis**: Tracks trending tokens across multiple DEXs (Raydium, PumpSwap, Pump.fun)
- **Signal Scoring**: Advanced algorithm to score trading opportunities based on multiple factors
- **Automated Trading**: Executes buy/sell orders via bags.fm API
- **Risk Management**: Built-in stop-loss, take-profit, and position sizing
- **Portfolio Management**: Tracks positions and manages multiple simultaneous trades

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BagsyAgent                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ DuneClient   │  │ BagsClient   │  │SignalAnalyzer│     │
│  │              │  │              │  │              │     │
│  │ - KOL Buys   │  │ - Get Quote  │  │ - Score      │     │
│  │ - Trending   │  │ - Execute    │  │ - Aggregate  │     │
│  │ - Pump.fun   │  │ - Balance    │  │ - Filter     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Trading Engine                           │   │
│  │  - Position Management                              │   │
│  │  - Entry/Exit Logic                                 │   │
│  │  - Risk Management                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Solana Wallet** with SOL for trading
3. **Dune Analytics API Key** - Get from [Dune Analytics](https://dune.com/settings/api)
4. **Bags.fm API Key** - Get from [Bags Developer Portal](https://dev.bags.fm)
5. **Solana RPC URL** - Use public or private RPC endpoint

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/BagsyAgent.git
cd BagsyAgent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# API Keys
DUNE_API_KEY=your_dune_api_key_here
BAGS_API_KEY=your_bags_api_key_here

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=your_base58_encoded_private_key

# Trading Parameters
MAX_POSITION_SIZE_SOL=1.0
MAX_TOTAL_PORTFOLIO_SOL=10.0
MIN_LIQUIDITY_USD=50000
SLIPPAGE_BPS=100

# Risk Management
STOP_LOSS_PERCENTAGE=20
TAKE_PROFIT_PERCENTAGE=50

# Signal Thresholds
KOL_BUY_MIN_AMOUNT_SOL=0.1
TRENDING_TOKEN_MIN_VOLUME_24H=100000
SIGNAL_SCORE_THRESHOLD=7

# Agent Settings
CHECK_INTERVAL_SECONDS=60
LOG_LEVEL=info
```

### 4. Build the Project

```bash
npm run build
```

## Usage

### Start the Bot

```bash
npm start
```

### Development Mode (with hot reload)

```bash
npm run dev
```

## How It Works

### 1. Data Collection

The agent continuously monitors:
- **KOL Buys**: Recent purchases by influential wallets
- **Trending Tokens**: High-volume tokens on Raydium, PumpSwap, and other DEXs
- **Pump.fun Graduates**: Newly launched tokens with momentum

### 2. Signal Analysis

Each token receives a score (0-15) based on:

| Factor | Max Points | Description |
|--------|------------|-------------|
| KOL Activity | 5 | Number and size of recent KOL buys |
| Volume | 5 | 24h trading volume |
| Multiple KOLs | 2 | Bonus if multiple KOLs are buying |
| Price Momentum | 3 | 24h price change |
| Volume Sources | 2 | Trending on multiple platforms |

Only tokens scoring above `SIGNAL_SCORE_THRESHOLD` (default: 7) are considered for trading.

### 3. Position Management

**Entry:**
- Position size scales with signal strength
- Maximum per-position limit enforced
- Portfolio-wide exposure cap

**Exit Conditions:**
- **Stop Loss**: Triggered at -20% (configurable)
- **Take Profit**: Triggered at +50% (configurable)
- **Trailing Stop**: Moves to breakeven at +30%
- **Time Limit**: Auto-exit after 24 hours

### 4. Risk Management

- Maximum position size per trade
- Maximum total portfolio exposure
- Minimum liquidity requirements
- Slippage protection
- Automatic position monitoring

## Configuration

### Trading Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MAX_POSITION_SIZE_SOL` | 1.0 | Maximum SOL per trade |
| `MAX_TOTAL_PORTFOLIO_SOL` | 10.0 | Maximum total exposure |
| `MIN_LIQUIDITY_USD` | 50000 | Minimum token liquidity |
| `SLIPPAGE_BPS` | 100 | Slippage tolerance (1%) |

### Risk Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `STOP_LOSS_PERCENTAGE` | 20 | Stop loss threshold |
| `TAKE_PROFIT_PERCENTAGE` | 50 | Take profit target |

### Signal Thresholds

| Parameter | Default | Description |
|-----------|---------|-------------|
| `KOL_BUY_MIN_AMOUNT_SOL` | 0.1 | Minimum KOL buy size to track |
| `TRENDING_TOKEN_MIN_VOLUME_24H` | 100000 | Minimum 24h volume |
| `SIGNAL_SCORE_THRESHOLD` | 7 | Minimum score to trade |

## Setting Up Dune Analytics Queries

The bot relies on custom Dune queries for KOL tracking and trending tokens. You'll need to create these queries in your Dune account:

### Required Queries

1. **KOL Buys Query**: Track recent purchases by known KOL wallets
2. **Trending Tokens Query**: Identify high-volume tokens
3. **Pump.fun Graduates Query**: Monitor newly launched tokens

After creating these queries, update the query IDs in `src/services/DuneClient.ts`:

```typescript
// Replace these with your actual Dune query IDs
const queryId = 'your_kol_buys_query_id';
const queryId = 'your_trending_tokens_query_id';
const queryId = 'your_pumpfun_marketcap_query_id';
```

## MCP Servers (Optional)

For enhanced functionality, you can integrate MCP servers:

### 1. Memecoin Radar MCP

Provides additional trending token data:

```bash
# Clone and install
git clone https://github.com/kukapay/memecoin-radar-mcp.git
cd memecoin-radar-mcp
uv sync
uv run mcp install main.py --name "Memecoin Radar"
```

### 2. GOAT MCP

For wallet operations and blockchain interactions:

```bash
git clone https://github.com/goat-sdk/goat.git
cd goat/typescript
pnpm install && pnpm build
cd examples/by-framework/model-context-protocol
```

### 3. Solana DeFi Analytics MCP

For wallet analysis and risk assessment:

```bash
git clone https://github.com/kirtiraj22/Solana-DeFi-Analytics-MCP-Server.git
cd Solana-DeFi-Analytics-MCP-Server
pnpm install
```

## Monitoring

The bot logs all activities to:
- **Console**: Real-time colored output
- **combined.log**: All log levels
- **error.log**: Errors only

### Log Levels

Set `LOG_LEVEL` in `.env`:
- `error`: Only errors
- `warn`: Warnings and errors
- `info`: General information (default)
- `debug`: Detailed debugging

## Safety & Warnings

⚠️ **IMPORTANT WARNINGS** ⚠️

1. **Test First**: Always test with small amounts on devnet/testnet
2. **Market Risk**: Crypto markets are highly volatile - you can lose money
3. **Smart Contract Risk**: DEX and token contracts may have vulnerabilities
4. **No Guarantees**: Past performance doesn't guarantee future results
5. **Monitor Actively**: Don't leave the bot running unattended initially
6. **Secure Keys**: Never share your private keys or commit them to git
7. **API Limits**: Be aware of rate limits on Dune and Bags.fm APIs

## Troubleshooting

### Common Issues

**"Missing required environment variable"**
- Ensure all required variables are set in `.env`

**"Failed to get quote"**
- Check your Bags.fm API key
- Verify you have sufficient SOL balance
- Check if token has enough liquidity

**"Error fetching KOL buys"**
- Verify Dune API key is valid
- Check if query IDs are correct
- Ensure queries are public or accessible

**Low signal scores**
- Market may be quiet
- Adjust `SIGNAL_SCORE_THRESHOLD` lower (with caution)
- Check if data sources are returning results

## Development

### Project Structure

```
BagsyAgent/
├── src/
│   ├── config/           # Configuration loader
│   ├── services/         # Core services
│   │   ├── BagsClient.ts       # Bags.fm API client
│   │   ├── DuneClient.ts       # Dune Analytics client
│   │   ├── SignalAnalyzer.ts   # Signal scoring
│   │   └── TradingEngine.ts    # Trade execution
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Utilities (logger, etc.)
│   └── index.ts          # Main entry point
├── .env.example          # Example environment file
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Disclaimer

This software is for educational purposes only. Use at your own risk. The authors are not responsible for any financial losses incurred while using this bot. Always do your own research and never invest more than you can afford to lose.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Read the documentation carefully
- Test with small amounts first

---

**Happy Trading! 🚀**

Remember: The best trade is often the one you don't make. Trade responsibly!
