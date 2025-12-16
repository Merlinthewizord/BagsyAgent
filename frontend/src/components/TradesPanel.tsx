'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Activity, ArrowUpCircle, ArrowDownCircle, ExternalLink } from 'lucide-react';

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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card h-96">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-bagsy-accent" />
        <h2 className="text-xl font-bold">Recent Trades</h2>
      </div>

      <div className="space-y-2 overflow-y-auto h-full scrollbar-hide">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No trades yet...</p>
            </div>
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className={`trade-item ${
                trade.type === 'buy' ? 'trade-buy' : 'trade-sell'
              } animate-slide-in`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  {trade.type === 'buy' ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-300">
                        {trade.tokenSymbol}
                      </span>
                      {trade.txSignature && (
                        <a
                          href={`https://solscan.io/tx/${trade.txSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-bagsy-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {trade.amountSol.toFixed(4)} SOL
                    </div>
                    {trade.reason && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        {trade.reason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-2 flex-shrink-0">
                  {trade.pnl !== undefined && (
                    <div
                      className={`font-semibold text-sm ${
                        trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
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
