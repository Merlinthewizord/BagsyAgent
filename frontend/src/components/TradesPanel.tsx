'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Activity, ArrowUpCircle, ArrowDownCircle, ExternalLink, TrendingUp } from 'lucide-react';

interface Trade {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell';
  tokenAddress: string;
  tokenSymbol: string;
  amountSol: number;
  tokenAmount?: number;
  price?: number;
  txSignature?: string;
  reason: string;
  pnl?: number;
}

interface TradesPanelProps {
  socket: Socket | null;
}

export default function TradesPanel({ socket }: TradesPanelProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Fetch initial trades
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trades?limit=20`)
      .then((res) => res.json())
      .then((data) => setTrades(data))
      .catch(console.error);

    // Listen for new trades
    socket.on('trade', (trade: Trade) => {
      setTrades((prev) => [trade, ...prev].slice(0, 50));
    });

    return () => {
      socket.off('trade');
    };
  }, [socket]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="premium-card h-[500px] flex flex-col animate-slide-up">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-bagsy-border">
        <div className="p-2 bg-bagsy-accent/10 rounded-xl">
          <Activity className="w-6 h-6 text-bagsy-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black gradient-text">Recent Trades</h2>
          <p className="text-xs text-gray-400">Latest trading activity</p>
        </div>
        <div className="flex items-center space-x-2 bg-bagsy-accent/10 px-3 py-1.5 rounded-full border border-bagsy-accent/20">
          <TrendingUp className="w-3 h-3 text-bagsy-accent" />
          <span className="text-xs text-bagsy-accent font-semibold">{trades.length}</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
              <p className="text-lg font-semibold text-gray-400">No trades yet...</p>
              <p className="text-sm text-gray-600 mt-2">Waiting for trading opportunities 📊</p>
            </div>
          </div>
        ) : (
          trades.map((trade, index) => (
            <div
              key={trade.id}
              className={`trade-item group ${
                trade.type === 'buy' ? 'trade-buy' : 'trade-sell'
              } animate-slide-in`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between">
                {/* Left side - Trade info */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    trade.type === 'buy'
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    {trade.type === 'buy' ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        trade.type === 'buy'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type}
                      </span>
                      <span className="text-sm font-bold text-white truncate">
                        {trade.tokenSymbol}
                      </span>
                      {trade.txSignature && (
                        <a
                          href={`https://solscan.io/tx/${trade.txSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-bagsy-primary transition-colors"
                          title="View on Solscan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-xs text-gray-400 font-semibold mb-1">
                      {trade.amountSol.toFixed(4)} SOL
                      {trade.price && (
                        <span className="text-gray-600 ml-2">@ ${trade.price.toFixed(6)}</span>
                      )}
                    </div>

                    {/* Reason */}
                    {trade.reason && (
                      <div className="text-xs text-gray-500 italic leading-relaxed">
                        {trade.reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - PnL and time */}
                <div className="text-right ml-3 flex-shrink-0">
                  {trade.pnl !== undefined && (
                    <div
                      className={`font-black text-base mb-1 ${
                        trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {trade.pnl >= 0 ? '+' : ''}
                      {trade.pnl.toFixed(1)}%
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {formatTime(trade.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
