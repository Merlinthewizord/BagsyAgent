# BagsyAgent - Autonomous Token Trading Bot

Meet **Bagsy** 🤖 - an autonomous Solana token trading agent with personality! Bagsy follows KOL (Key Opinion Leader) buys and trending tokens to identify and execute profitable trades, all while chatting with his community and sharing his thoughts.

**Mission**: Grow wallet to $100,000 💰 and $BAGSY token to $100M market cap 🚀

## ✨ Features

### 🎨 Interactive Web Dashboard
- **Real-Time Portfolio**: Watch Bagsy's wallet grow live
- **Chat with Bagsy**: Talk to the AI trader powered by Claude
- **Thought Stream**: See Bagsy's analysis and decision-making process
- **Live Trades**: Real-time trade execution and P&L tracking
- **Goal Tracking**: Progress bars for the $100k and $100M goals

### 🤖 Bagsy's Personality
- Quirky, funny, yet determined AI trader
- Transparent about wins AND losses
- Shares thoughts and analysis in real-time
- Interactive chat powered by Claude API
- On a mission to prove AI can outperform humans

### 📈 Core Trading Features
- **KOL Tracking**: Monitors wallet activities of influential traders and KOLs
- **Trend Analysis**: Tracks trending tokens across multiple DEXs (Raydium, PumpSwap, Pump.fun)
- **Signal Scoring**: Advanced algorithm to score trading opportunities based on multiple factors
- **Automated Trading**: Executes buy/sell orders via bags.fm API
- **Risk Management**: Built-in stop-loss, take-profit, and position sizing
- **Portfolio Management**: Tracks positions and manages multiple simultaneous trades

## 🚀 Quick Start

### Option 1: Full Stack (Trading Bot + Frontend)

**See [FRONTEND_README.md](FRONTEND_README.md) for complete frontend setup!**

```bash
# 1. Install all dependencies
npm install
cd server && npm install
cd ../frontend && npm install
cd ..

# 2. Configure environment
cp .env.example .env
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env.local
# Edit each .env file with your keys

# 3. Start all services
# Terminal 1: API Server
cd server && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Trading Bot
npm run dev

# 4. Open http://localhost:3000
```

### Option 2: Trading Bot Only (Headless)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your keys (no need for API_SERVER_URL)

# 3. Build and run
npm run build
npm start
```

## 📁 Project Structure

```
BagsyAgent/
├── frontend/              # Next.js web dashboard
│   ├── src/
│   │   ├── app/          # Pages and layouts
│   │   └── components/   # React components
│   └── package.json
│
├── server/               # Express API server
│   ├── src/
│   │   ├── server.ts     # Main API server
│   │   ├── database.ts   # SQLite database
│   │   └── bagsy-personality.ts  # AI personality
│   └── package.json
│
├── src/                  # Trading bot
│   ├── services/
│   │   ├── DuneClient.ts
│   │   ├── BagsClient.ts
│   │   ├── SignalAnalyzer.ts
│   │   ├── TradingEngine.ts
│   │   └── ApiReporter.ts  # Reports to frontend
│   └── index.ts
│
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   └── DUNE_QUERIES.md
│
├── FRONTEND_README.md    # Frontend-specific docs
└── README.md            # This file
```

## 🔑 Required API Keys

1. **Dune Analytics API Key**: Get from [dune.com/settings/api](https://dune.com/settings/api)
   - Used to fetch KOL buys and trending tokens
   - Your key: `5njv1Lb6dxqEF32tN185oFFSuFba1ITj`

2. **Bags.fm API Key**: Get from [dev.bags.fm](https://dev.bags.fm)
   - Used to execute trades on Solana
   - Your Key "bags_prod_ihnUfwC4AYsWuUJB14w_awiZ-GI3SJ8RJHy4QNXJ0mw"

3. **Solana Wallet Private Key**: Your trading wallet
   - Base58-encoded private key
   - Fund with SOL for trading

4. **Anthropic API Key** (for frontend): Get from [console.anthropic.com](https://console.anthropic.com)
   - Powers Bagsy's chat personality
   - Optional - only needed for frontend

## ⚙️ Configuration

See `.env.example` for all configuration options.

**Key Settings**:
```env
# Trading Limits
MAX_POSITION_SIZE_SOL=1.0           # Max per trade
MAX_TOTAL_PORTFOLIO_SOL=10.0        # Max total exposure

# Risk Management
STOP_LOSS_PERCENTAGE=20             # Auto-sell at -20%
TAKE_PROFIT_PERCENTAGE=50           # Auto-sell at +50%

# Signal Thresholds
SIGNAL_SCORE_THRESHOLD=7            # Minimum score to trade (0-15)
KOL_BUY_MIN_AMOUNT_SOL=0.1         # Min KOL buy to track
TRENDING_TOKEN_MIN_VOLUME_24H=100000  # Min volume to consider

# Frontend Integration
API_SERVER_URL=http://localhost:3001  # API server URL
BOT_API_KEY=your_secret_key           # Secure bot-to-server auth
```

## 🎯 How It Works

1. **Data Collection** (every 60s)
   - Fetch KOL buys from Dune Analytics
   - Get trending tokens from multiple DEXs
   - Track Pump.fun graduates

2. **Signal Analysis**
   - Score each token (0-15 points)
   - Consider: KOL activity, volume, momentum, multi-source confirmation
   - Filter by minimum score threshold

3. **Trade Execution**
   - Buy tokens with high scores
   - Set stop-loss and take-profit orders
   - Execute via bags.fm API

4. **Position Management**
   - Monitor prices continuously
   - Auto-exit on stop-loss or take-profit
   - Trailing stop at +30% profit
   - Time-based exit after 24h

5. **Frontend Updates** (if enabled)
   - Report all trades to API server
   - Share thoughts and analysis
   - Update portfolio stats
   - Enable chat with community

## 💬 Chatting with Bagsy

When the frontend is running, you can chat with Bagsy at `http://localhost:3000`

Example conversations:
- "How's the trading going?"
- "What are you currently holding?"
- "Why did you buy that token?"
- "How close are you to $100k?"

Bagsy will respond with his quirky personality, discussing his trades, strategy, and goals!

## 📊 Dashboard Features

- **Portfolio Stats**: Real-time wallet value, P&L, win rate
- **Active Positions**: All open trades with entry price, current price, P&L
- **Trade History**: Complete log of buys and sells
- **Thoughts Stream**: Bagsy's live analysis and decision-making
- **Goals Progress**: Visual progress toward $100k and $100M
- **Chat Interface**: Talk directly to Bagsy

## 📚 Documentation

- **[FRONTEND_README.md](FRONTEND_README.md)**: Complete frontend and API server guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: Step-by-step setup instructions
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture details
- **[docs/DUNE_QUERIES.md](docs/DUNE_QUERIES.md)**: Example Dune Analytics queries

## 🛡️ Safety & Warnings

⚠️ **IMPORTANT** ⚠️

1. **Test First**: Start with small amounts
2. **Market Risk**: Crypto is highly volatile - you can lose money
3. **No Guarantees**: Past performance doesn't guarantee future results
4. **Monitor Initially**: Watch the bot closely at first
5. **Secure Keys**: Never share private keys or commit them to git
6. **API Limits**: Be aware of rate limits on APIs

## 🎨 Customizing Bagsy

### Change Avatar
Replace `frontend/public/bagsy-avatar.png` with your character image

### Adjust Personality
Edit `server/src/bagsy-personality.ts` to change:
- Speaking style
- Humor level
- Response format
- Emoji usage

### Modify Colors
Edit `frontend/tailwind.config.ts` for custom theme colors

## 🚢 Deployment

### Trading Bot
Deploy to any server:
- Railway
- Render
- DigitalOcean
- AWS EC2

### Frontend
- **Vercel**: `vercel deploy` (recommended)
- **Netlify**: Connect GitHub repo
- **Static hosting**: `npm run build` → deploy `/out`

### API Server
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `git push heroku main`

## 🐛 Troubleshooting

**Bot not trading?**
- Check Dune query IDs are configured
- Verify API keys are valid
- Check signal score threshold isn't too high
- Review logs for errors

**Frontend not updating?**
- Verify API server is running
- Check `BOT_API_KEY` matches in bot and server
- Confirm WebSocket connection in browser console

**Chat not working?**
- Set `ANTHROPIC_API_KEY` in server/.env
- Check API credits/quota
- Review server logs

## 📈 Performance Tips

- Start conservative with position sizes
- Monitor for 24h before increasing limits
- Adjust signal threshold based on market conditions
- Review and optimize Dune queries for speed
- Use a good Solana RPC for reliability

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional data sources
- Advanced risk management
- Machine learning for signal scoring
- More DEX integrations
- Enhanced frontend features

## 📝 License

MIT License - See [LICENSE](LICENSE)

## ⚠️ Disclaimer

This software is for educational purposes only. Use at your own risk. The authors are not responsible for any financial losses incurred while using this bot. Always do your own research and never invest more than you can afford to lose.

Cryptocurrency trading carries significant risk. Bagsy is an experimental AI agent and should not be relied upon for financial advice.

---

**Watch Bagsy trade live! 🚀**

Start the frontend and witness an AI on a mission to $100k!
