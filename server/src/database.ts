import Database from 'better-sqlite3';
import { BagsyThought, ChatMessage, TradeActivity } from './types';

export class BagsyDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './bagsy.db') {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS thoughts (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        relatedToken TEXT,
        sentiment TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        userName TEXT
      );

      CREATE TABLE IF NOT EXISTS trade_activity (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        tokenAddress TEXT NOT NULL,
        tokenSymbol TEXT NOT NULL,
        amountSol REAL NOT NULL,
        tokenAmount REAL,
        price REAL,
        txSignature TEXT,
        reason TEXT,
        pnl REAL,
        fee REAL
      );

      CREATE TABLE IF NOT EXISTS portfolio_history (
        timestamp INTEGER PRIMARY KEY,
        totalValueSol REAL NOT NULL,
        totalValueUsd REAL NOT NULL,
        positions INTEGER NOT NULL,
        bagsyTokenValue REAL,
        bagsyTokenMcap REAL
      );

      CREATE INDEX IF NOT EXISTS idx_thoughts_timestamp ON thoughts(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_messages(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trade_activity(timestamp DESC);
    `);
  }

  // Thoughts
  addThought(thought: BagsyThought): void {
    const stmt = this.db.prepare(`
      INSERT INTO thoughts (id, timestamp, type, content, relatedToken, sentiment)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      thought.id,
      thought.timestamp,
      thought.type,
      thought.content,
      thought.relatedToken || null,
      thought.sentiment
    );
  }

  getRecentThoughts(limit: number = 50): BagsyThought[] {
    const stmt = this.db.prepare(`
      SELECT * FROM thoughts
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit) as BagsyThought[];
  }

  // Chat Messages
  addChatMessage(message: ChatMessage): void {
    const stmt = this.db.prepare(`
      INSERT INTO chat_messages (id, timestamp, role, content, userName)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      message.id,
      message.timestamp,
      message.role,
      message.content,
      message.userName || null
    );
  }

  getChatHistory(limit: number = 100): ChatMessage[] {
    const stmt = this.db.prepare(`
      SELECT * FROM chat_messages
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const messages = stmt.all(limit) as ChatMessage[];
    return messages.reverse(); // Return in chronological order
  }

  // Trade Activity
  addTradeActivity(trade: TradeActivity): void {
    const stmt = this.db.prepare(`
      INSERT INTO trade_activity (
        id, timestamp, type, tokenAddress, tokenSymbol,
        amountSol, tokenAmount, price, txSignature, reason, pnl, fee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      trade.id,
      trade.timestamp,
      trade.type,
      trade.tokenAddress,
      trade.tokenSymbol,
      trade.amountSol,
      trade.tokenAmount || null,
      trade.price || null,
      trade.txSignature || null,
      trade.reason || null,
      trade.pnl || null,
      trade.fee || null
    );
  }

  getRecentTrades(limit: number = 50): TradeActivity[] {
    const stmt = this.db.prepare(`
      SELECT * FROM trade_activity
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit) as TradeActivity[];
  }

  getTradeStats(): {
    totalTrades: number;
    wins: number;
    losses: number;
    totalPnl: number;
  } {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as totalTrades,
        SUM(CASE WHEN type = 'sell' AND pnl > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN type = 'sell' AND pnl < 0 THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN type = 'sell' THEN pnl ELSE 0 END) as totalPnl
      FROM trade_activity
    `);
    return stmt.get() as any;
  }

  // Portfolio History
  addPortfolioSnapshot(
    totalValueSol: number,
    totalValueUsd: number,
    positions: number,
    bagsyTokenValue?: number,
    bagsyTokenMcap?: number
  ): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO portfolio_history
      (timestamp, totalValueSol, totalValueUsd, positions, bagsyTokenValue, bagsyTokenMcap)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      Date.now(),
      totalValueSol,
      totalValueUsd,
      positions,
      bagsyTokenValue || null,
      bagsyTokenMcap || null
    );
  }

  getPortfolioHistory(hours: number = 24): any[] {
    const since = Date.now() - hours * 3600000;
    const stmt = this.db.prepare(`
      SELECT * FROM portfolio_history
      WHERE timestamp > ?
      ORDER BY timestamp ASC
    `);
    return stmt.all(since);
  }

  close(): void {
    this.db.close();
  }
}
