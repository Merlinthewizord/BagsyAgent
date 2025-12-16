'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { PieChart, TrendingUp, TrendingDown, ExternalLink, Clock, DollarSign } from 'lucide-react';

interface Position {
  tokenAddress: string;
  tokenSymbol: string;
  entryPrice: number;
  currentPrice: number;
  amountSol: number;
  tokenAmount: number;
  entryTime: number;
  stopLoss: number;
  takeProfit: number;
  pnlPercentage: number;
}

interface PositionsPanelProps {
  socket: Socket | null;
}

export default function PositionsPanel({ socket }: PositionsPanelProps) {
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Fetch initial positions
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/positions`)
      .then((res) => res.json())
      .then((data) => setPositions(data))
      .catch(console.error);

    // Listen for position updates
    socket.on('positions', (updatedPositions: Position[]) => {
      setPositions(updatedPositions);
    });

    return () => {
      socket.off('positions');
    };
  }, [socket]);

  const formatDuration = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="premium-card animate-slide-up">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-bagsy-border">
        <div className="p-2 bg-bagsy-purple/10 rounded-xl">
          <PieChart className="w-6 h-6 text-bagsy-purple" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black gradient-text">Active Positions</h2>
          <p className="text-xs text-gray-400">Current open trades</p>
        </div>
        <div className="flex items-center space-x-2 bg-bagsy-purple/10 px-3 py-1.5 rounded-full border border-bagsy-purple/20">
          <div className="w-2 h-2 bg-bagsy-purple rounded-full animate-pulse"></div>
          <span className="text-xs text-bagsy-purple font-semibold">{positions.length} open</span>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {positions.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <PieChart className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
              <p className="text-lg font-semibold text-gray-400">No active positions</p>
              <p className="text-sm text-gray-600 mt-2">Waiting for trade signals 🎯</p>
            </div>
          </div>
        ) : (
          positions.map((pos, index) => (
            <div
              key={pos.tokenAddress}
              className="group relative p-5 rounded-xl bg-bagsy-card-light border border-bagsy-border hover:border-bagsy-purple/30 transition-all duration-300 animate-slide-in overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${
                pos.pnlPercentage >= 0
                  ? 'from-green-500/5 to-transparent'
                  : 'from-red-500/5 to-transparent'
              } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-black text-white">{pos.tokenSymbol}</span>
                    <a
                      href={`https://solscan.io/token/${pos.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-bagsy-primary transition-colors"
                      title="View on Solscan"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-black text-lg ${
                      pos.pnlPercentage >= 0
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {pos.pnlPercentage >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span>
                      {pos.pnlPercentage >= 0 ? '+' : ''}
                      {pos.pnlPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-bagsy-card border border-bagsy-border">
                    <div className="text-xs text-gray-400 mb-1">Entry Price</div>
                    <div className="text-sm font-bold text-white">${pos.entryPrice.toFixed(8)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-bagsy-card border border-bagsy-border">
                    <div className="text-xs text-gray-400 mb-1">Current Price</div>
                    <div className="text-sm font-bold text-white">${pos.currentPrice.toFixed(8)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-bagsy-card border border-bagsy-border">
                    <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Position Size</span>
                    </div>
                    <div className="text-sm font-bold text-bagsy-secondary">{pos.amountSol.toFixed(4)} SOL</div>
                  </div>
                  <div className="p-3 rounded-lg bg-bagsy-card border border-bagsy-border">
                    <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Hold Time</span>
                    </div>
                    <div className="text-sm font-bold text-white">{formatDuration(pos.entryTime)}</div>
                  </div>
                </div>

                {/* Stop Loss / Take Profit */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    <div>
                      <div className="text-xs text-red-300 font-semibold">Stop Loss</div>
                      <div className="text-xs text-red-400 font-mono">${pos.stopLoss.toFixed(8)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <div>
                      <div className="text-xs text-green-300 font-semibold">Take Profit</div>
                      <div className="text-xs text-green-400 font-mono">${pos.takeProfit.toFixed(8)}</div>
                    </div>
                  </div>
                </div>

                {/* PnL Progress Bar */}
                <div className="relative w-full h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                      pos.pnlPercentage >= 0
                        ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-glow-green'
                        : 'bg-gradient-to-r from-red-500 to-red-400 shadow-glow-pink'
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(pos.pnlPercentage) * 3, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
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
