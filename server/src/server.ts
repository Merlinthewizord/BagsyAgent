import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { BagsyDatabase } from './database';
import { BagsyPersonality } from './bagsy-personality';
import { BagsyThought, ChatMessage, TradeActivity, PortfolioStats, BagsyGoal } from './types';
import { v4 as uuidv4 } from 'crypto';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const db = new BagsyDatabase();
const bagsy = new BagsyPersonality(process.env.ANTHROPIC_API_KEY || '');

// In-memory state (synced with trading bot)
let currentPortfolio: PortfolioStats = {
  totalValueSol: 0,
  totalValueUsd: 0,
  positions: 0,
  pnl24h: 0,
  pnlAllTime: 0,
  winRate: 0,
  totalTrades: 0,
  bagsyTokenValue: 0,
  bagsyTokenMcap: 0
};

let currentPositions: any[] = [];

// Goals
const bagsyGoals: BagsyGoal[] = [
  {
    id: 'wallet-100k',
    name: 'Grow Wallet to $100k',
    target: 100000,
    current: 0,
    unit: 'USD',
    progress: 0,
    emoji: '💰'
  },
  {
    id: 'bagsy-100m',
    name: '$BAGSY to $100M Market Cap',
    target: 100000000,
    current: 0,
    unit: 'USD',
    progress: 0,
    emoji: '🚀'
  }
];

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial state
  socket.emit('portfolio', currentPortfolio);
  socket.emit('positions', currentPositions);
  socket.emit('goals', bagsyGoals);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Utility functions
function broadcastThought(thought: BagsyThought) {
  db.addThought(thought);
  io.emit('thought', thought);
}

function broadcastTrade(trade: TradeActivity) {
  db.addTradeActivity(trade);
  io.emit('trade', trade);
}

function updatePortfolio(stats: PortfolioStats) {
  currentPortfolio = stats;

  // Update goals
  bagsyGoals[0].current = stats.totalValueUsd;
  bagsyGoals[0].progress = (stats.totalValueUsd / bagsyGoals[0].target) * 100;

  if (stats.bagsyTokenMcap) {
    bagsyGoals[1].current = stats.bagsyTokenMcap;
    bagsyGoals[1].progress = (stats.bagsyTokenMcap / bagsyGoals[1].target) * 100;
  }

  io.emit('portfolio', currentPortfolio);
  io.emit('goals', bagsyGoals);

  db.addPortfolioSnapshot(
    stats.totalValueSol,
    stats.totalValueUsd,
    stats.positions,
    stats.bagsyTokenValue,
    stats.bagsyTokenMcap
  );
}

// REST API Endpoints

// Get portfolio stats
app.get('/api/portfolio', (req, res) => {
  res.json(currentPortfolio);
});

// Get current positions
app.get('/api/positions', (req, res) => {
  res.json(currentPositions);
});

// Get goals
app.get('/api/goals', (req, res) => {
  res.json(bagsyGoals);
});

// Get recent thoughts
app.get('/api/thoughts', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const thoughts = db.getRecentThoughts(limit);
  res.json(thoughts);
});

// Get chat history
app.get('/api/chat/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const history = db.getChatHistory(limit);
  res.json(history);
});

// Send chat message to Bagsy
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      role: 'user',
      content: message,
      userName: userName || 'Anon'
    };
    db.addChatMessage(userMsg);
    io.emit('chat-message', userMsg);

    // Get Bagsy's response
    const response = await bagsy.chat(message, {
      walletValue: currentPortfolio.totalValueUsd,
      bagsyTokenMcap: currentPortfolio.bagsyTokenMcap,
      currentPositions
    });

    // Save Bagsy's response
    const bagsyMsg: ChatMessage = {
      id: uuidv4(),
      timestamp: Date.now(),
      role: 'bagsy',
      content: response
    };
    db.addChatMessage(bagsyMsg);
    io.emit('chat-message', bagsyMsg);

    res.json({ message: response });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response from Bagsy' });
  }
});

// Get recent trades
app.get('/api/trades', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const trades = db.getRecentTrades(limit);
  res.json(trades);
});

// Get trade statistics
app.get('/api/trades/stats', (req, res) => {
  const stats = db.getTradeStats();
  res.json(stats);
});

// Get portfolio history
app.get('/api/portfolio/history', (req, res) => {
  const hours = parseInt(req.query.hours as string) || 24;
  const history = db.getPortfolioHistory(hours);
  res.json(history);
});

// Trading bot integration endpoints

// Update portfolio (called by trading bot)
app.post('/api/bot/portfolio', (req, res) => {
  const { apiKey } = req.headers;

  if (apiKey !== process.env.BOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  updatePortfolio(req.body);
  res.json({ success: true });
});

// Add thought (called by trading bot)
app.post('/api/bot/thought', (req, res) => {
  const { apiKey } = req.headers;

  if (apiKey !== process.env.BOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const thought: BagsyThought = {
    id: uuidv4(),
    timestamp: Date.now(),
    ...req.body
  };

  broadcastThought(thought);
  res.json({ success: true });
});

// Add trade (called by trading bot)
app.post('/api/bot/trade', (req, res) => {
  const { apiKey } = req.headers;

  if (apiKey !== process.env.BOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const trade: TradeActivity = {
    id: uuidv4(),
    timestamp: Date.now(),
    ...req.body
  };

  broadcastTrade(trade);

  // Generate Bagsy thought about the trade
  const thoughtContent = bagsy.generateThought('trade', {
    tokenSymbol: trade.tokenSymbol,
    price: trade.price,
    pnl: trade.pnl,
    amountSol: trade.amountSol
  });

  const thought: BagsyThought = {
    id: uuidv4(),
    timestamp: Date.now(),
    type: 'trade',
    content: thoughtContent,
    relatedToken: trade.tokenAddress,
    sentiment: trade.type === 'buy' ? 'bullish' : (trade.pnl && trade.pnl > 0 ? 'excited' : 'neutral')
  };

  broadcastThought(thought);

  res.json({ success: true });
});

// Update positions (called by trading bot)
app.post('/api/bot/positions', (req, res) => {
  const { apiKey } = req.headers;

  if (apiKey !== process.env.BOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  currentPositions = req.body;
  io.emit('positions', currentPositions);
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    connections: io.engine.clientsCount
  });
});

// Periodic updates
setInterval(() => {
  // Update trade stats
  const stats = db.getTradeStats();
  currentPortfolio.totalTrades = stats.totalTrades;
  currentPortfolio.winRate = stats.totalTrades > 0
    ? (stats.wins / (stats.wins + stats.losses)) * 100
    : 0;

  // Occasionally generate reflective thoughts
  if (Math.random() < 0.1 && currentPortfolio.totalValueUsd > 0) {
    const thoughtContent = bagsy.generateThought('reflection', {
      trending: currentPortfolio.pnl24h > 0 ? 'spicy 🌶️' : 'chill 😎',
      winRate: currentPortfolio.winRate.toFixed(1),
      trades: stats.totalTrades,
      value: currentPortfolio.totalValueUsd.toFixed(2)
    });

    const thought: BagsyThought = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: 'reflection',
      content: thoughtContent,
      sentiment: currentPortfolio.pnl24h > 0 ? 'excited' : 'neutral'
    };

    broadcastThought(thought);
  }
}, 300000); // Every 5 minutes

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Bagsy API Server running on port ${PORT}`);
  console.log(`💬 WebSocket server ready`);
  console.log(`📊 Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Bagsy API server...');
  db.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
