'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { PieChart, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

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
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <PieChart className="w-5 h-5 text-bagsy-secondary" />
        <h2 className="text-xl font-bold">Active Positions</h2>
        <div className="ml-auto">
          <span className="text-sm text-gray-400">{positions.length} open</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
        {positions.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active positions</p>
            </div>
          </div>
        ) : (
          positions.map((pos) => (
            <div
              key={pos.tokenAddress}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg">{pos.tokenSymbol}</span>
                  <a
                    href={`https://solscan.io/token/${pos.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-bagsy-primary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div
                  className={`flex items-center space-x-1 font-bold text-lg ${
                    pos.pnlPercentage >= 0 ? 'text-bagsy-success' : 'text-bagsy-danger'
                  }`}
                >
                  {pos.pnlPercentage >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {pos.pnlPercentage >= 0 ? '+' : ''}
                    {pos.pnlPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <div className="text-gray-400">Entry</div>
                  <div className="font-medium">{pos.entryPrice.toFixed(8)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Current</div>
                  <div className="font-medium">{pos.currentPrice.toFixed(8)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Size</div>
                  <div className="font-medium">{pos.amountSol.toFixed(4)} SOL</div>
                </div>
                <div>
                  <div className="text-gray-400">Hold Time</div>
                  <div className="font-medium">{formatDuration(pos.entryTime)}</div>
                </div>
              </div>

              {/* Stop Loss / Take Profit */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-red-400">SL:</span>
                  <span className="text-gray-300">{pos.stopLoss.toFixed(8)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-green-400">TP:</span>
                  <span className="text-gray-300">{pos.takeProfit.toFixed(8)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full transition-all ${
                    pos.pnlPercentage >= 0 ? 'bg-bagsy-success' : 'bg-bagsy-danger'
                  }`}
                  style={{
                    width: `${Math.min(Math.abs(pos.pnlPercentage) * 2, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
