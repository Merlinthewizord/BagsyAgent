# Bagsy Frontend & API Server

Welcome to Bagsy's interactive web dashboard! This is where you can watch Bagsy trade in real-time, chat with him, see his thoughts, and track his progress toward the $100k wallet and $100M token market cap goals.

## 🎯 Features

### Real-Time Dashboard
- **Live Portfolio Stats**: Watch Bagsy's wallet grow in real-time
- **Active Positions**: See all open trades with P&L
- **Trade History**: Complete log of all buys and sells
- **Goals Tracking**: Progress bars for the $100k and $100M goals

### Chat with Bagsy
- **AI Personality**: Powered by Claude, Bagsy has a quirky, determined personality
- **Interactive**: Ask him anything about his trades, strategy, or goals
- **Context-Aware**: He knows his current portfolio and can discuss his positions

### Bagsy's Thoughts Stream
- **Live Thoughts**: See Bagsy's analysis and decision-making process
- **Transparent**: Understand why he makes each trade
- **Entertaining**: Funny, determined, and always on-brand

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│  - Real-time dashboard                              │
│  - Chat interface                                   │
│  - WebSocket connection                             │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              API Server (Express)                    │
│  - REST API endpoints                               │
│  - WebSocket server (Socket.io)                     │
│  - Claude API integration                           │
│  - SQLite database                                  │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│            Trading Bot (BagsyAgent)                  │
│  - Reports trades, thoughts, portfolio              │
│  - Autonomous trading logic                         │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Server** (`server/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_anthropic_api_key_here
BOT_API_KEY=your_secret_bot_api_key_here
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Trading Bot** (main `.env`):
```env
API_SERVER_URL=http://localhost:3001
BOT_API_KEY=your_secret_bot_api_key_here
```

### 3. Start Services

**Terminal 1 - API Server**:
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

**Terminal 3 - Trading Bot**:
```bash
npm run dev
```

### 4. Open Dashboard

Navigate to `http://localhost:3000` in your browser!

## 📁 Project Structure

```
BagsyAgent/
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   │   ├── page.tsx      # Main dashboard page
│   │   │   ├── layout.tsx    # App layout
│   │   │   └── globals.css   # Global styles
│   │   └── components/       # React components
│   │       ├── BagsyHeader.tsx
│   │       ├── ChatInterface.tsx
│   │       ├── ThoughtsStream.tsx
│   │       ├── PortfolioStats.tsx
│   │       ├── GoalsDisplay.tsx
│   │       ├── TradesPanel.tsx
│   │       └── PositionsPanel.tsx
│   ├── package.json
│   └── tailwind.config.ts
│
├── server/                    # Express API server
│   ├── src/
│   │   ├── server.ts         # Main server file
│   │   ├── database.ts       # SQLite database
│   │   ├── bagsy-personality.ts  # AI personality
│   │   └── types.ts          # TypeScript types
│   └── package.json
│
└── src/                       # Trading bot (existing)
    └── services/
        └── ApiReporter.ts    # Reports to API server
```

## 🎨 Customizing Bagsy's Appearance

### Replace the Avatar

1. Add your Bagsy image to `frontend/public/bagsy-avatar.png`
2. Update `frontend/src/components/BagsyHeader.tsx`:

```tsx
// Replace the emoji div with:
<Image
  src="/bagsy-avatar.png"
  alt="Bagsy"
  width={64}
  height={64}
  className="rounded-full"
/>
```

### Personality Customization

Edit `server/src/bagsy-personality.ts` to adjust:
- Speaking style
- Humor level
- Emoji usage
- Response length
- Personality traits

## 🔧 API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio` | GET | Current portfolio stats |
| `/api/positions` | GET | Active positions |
| `/api/goals` | GET | Progress toward goals |
| `/api/thoughts` | GET | Recent thoughts stream |
| `/api/chat/history` | GET | Chat message history |
| `/api/chat` | POST | Send message to Bagsy |
| `/api/trades` | GET | Recent trade history |
| `/api/trades/stats` | GET | Trade statistics |
| `/api/portfolio/history` | GET | Portfolio history |

### Bot Integration Endpoints (Authenticated)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bot/portfolio` | POST | Update portfolio stats |
| `/api/bot/thought` | POST | Add new thought |
| `/api/bot/trade` | POST | Report trade |
| `/api/bot/positions` | POST | Update positions |

## 📡 WebSocket Events

### Client → Server
- `connection`: Initial connection
- `disconnect`: Client disconnected

### Server → Client
- `portfolio`: Portfolio stats updated
- `positions`: Positions updated
- `goals`: Goals progress updated
- `thought`: New thought posted
- `trade`: New trade executed
- `chat-message`: New chat message

## 💬 Chat with Bagsy

Bagsy is powered by Claude (Anthropic's AI) and has access to:
- Current portfolio value
- Active positions
- Recent trades
- Goal progress

Example prompts:
- "How's the trading going?"
- "What are you currently holding?"
- "Why did you buy that token?"
- "How close are you to $100k?"
- "What's your best trade so far?"

## 🎯 Bagsy's Goals

Bagsy has two main goals tracked in the dashboard:

1. **$100,000 Wallet** 💰
   - Grow total portfolio value to $100k USD
   - Progress bar shows current percentage

2. **$BAGSY to $100M Market Cap** 🚀
   - Grow Bagsy's own token to $100M
   - Separate progress tracking

## 📊 Database Schema

SQLite database (`bagsy.db`) stores:

**Thoughts**:
- id, timestamp, type, content, sentiment, relatedToken

**Chat Messages**:
- id, timestamp, role, content, userName

**Trade Activity**:
- id, timestamp, type, tokenAddress, tokenSymbol, amountSol, price, pnl, txSignature

**Portfolio History**:
- timestamp, totalValueSol, totalValueUsd, positions, bagsyTokenMcap

## 🚢 Production Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

### API Server

Options:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **DigitalOcean**: App Platform deployment
- **AWS**: EC2 + PM2

### Environment Variables

Don't forget to set all environment variables in your production environment:
- `ANTHROPIC_API_KEY`
- `BOT_API_KEY`
- `FRONTEND_URL`
- `PORT`

## 🔐 Security Notes

1. **API Key**: The `BOT_API_KEY` must match between bot and server
2. **CORS**: Frontend URL must be in server's CORS allowlist
3. **Rate Limiting**: Consider adding rate limits for chat endpoint
4. **Database Backups**: Regularly backup `bagsy.db`

## 🐛 Troubleshooting

### Frontend won't connect
- Check API server is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check browser console for WebSocket errors

### Chat not working
- Verify `ANTHROPIC_API_KEY` is set in server
- Check server logs for API errors
- Ensure you have Claude API credits

### Trades not appearing
- Verify `BOT_API_KEY` matches in bot and server
- Check bot is running and making trades
- Look for API reporter errors in bot logs

### Database errors
- Delete `bagsy.db` to reset (will lose history)
- Check file permissions on database
- Verify SQLite is installed

## 📈 Performance Tips

1. **Limit WebSocket Updates**: Don't update too frequently
2. **Database Cleanup**: Periodically archive old data
3. **Chat History**: Limit to recent messages
4. **Thoughts Stream**: Cap at 50-100 thoughts

## 🎨 Theme Customization

Edit `frontend/tailwind.config.ts` to change colors:

```ts
colors: {
  bagsy: {
    primary: '#10b981',    // Green
    secondary: '#3b82f6',  // Blue
    accent: '#f59e0b',     // Orange
    dark: '#111827',       // Dark gray
    darker: '#0f172a',     // Darker gray
  },
}
```

## 🤝 Contributing

To add new features:

1. **New Dashboard Widget**: Create component in `frontend/src/components/`
2. **New API Endpoint**: Add route in `server/src/server.ts`
3. **New Bot Event**: Add reporter call in bot code
4. **New Database Table**: Update `server/src/database.ts`

## 📝 License

MIT License - Same as main BagsyAgent project

---

## 🚀 Next Steps

1. Set up all three services (bot, server, frontend)
2. Configure your Anthropic API key for chat
3. Customize Bagsy's personality
4. Add your Bagsy avatar image
5. Start trading and watch the dashboard come alive!

**Let's get Bagsy to $100k! 💰🚀**
