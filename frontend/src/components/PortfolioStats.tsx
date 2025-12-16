'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Wallet, TrendingUp, TrendingDown, PieChart, Award } from 'lucide-react';

interface Portfolio {
  totalValueSol: number;
  totalValueUsd: number;
  positions: number;
  pnl24h: number;
  pnlAllTime: number;
  winRate: number;
  totalTrades: number;
  bagsyTokenValue?: number;
  bagsyTokenMcap?: number;
}

interface PortfolioStatsProps {
  socket: Socket | null;
}

export default function PortfolioStats({ socket }: PortfolioStatsProps) {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValueSol: 0,
    totalValueUsd: 0,
    positions: 0,
    pnl24h: 0,
    pnlAllTime: 0,
    winRate: 0,
    totalTrades: 0,
  });

  useEffect(() => {
    if (!socket) return;

    // Fetch initial portfolio
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/portfolio`)
      .then((res) => res.json())
      .then((data) => setPortfolio(data))
      .catch(console.error);

    // Listen for portfolio updates
    socket.on('portfolio', (updatedPortfolio: Portfolio) => {
      setPortfolio(updatedPortfolio);
    });

    return () => {
      socket.off('portfolio');
    };
  }, [socket]);

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Wallet className="w-5 h-5 text-bagsy-primary" />
        <h2 className="text-xl font-bold">Portfolio</h2>
      </div>

      {/* Main Value */}
      <div className="mb-6 p-6 bg-gradient-to-br from-bagsy-card to-bagsy-darker rounded-xl border border-bagsy-primary/50 shadow-glow-green">
        <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Total Value</div>
        <div className="text-4xl font-black neon-text text-bagsy-primary">
          ${portfolio.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {portfolio.totalValueSol.toFixed(4)} SOL
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Positions */}
        <div className="stat-card">
          <div className="flex items-center space-x-2 mb-1">
            <PieChart className="w-4 h-4 text-gray-400" />
            <div className="text-xs text-gray-400">Positions</div>
          </div>
          <div className="text-xl font-bold">{portfolio.positions}</div>
        </div>

        {/* Win Rate */}
        <div className="stat-card">
          <div className="flex items-center space-x-2 mb-1">
            <Award className="w-4 h-4 text-gray-400" />
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div className="text-xl font-bold text-bagsy-primary">
            {portfolio.winRate.toFixed(0)}%
          </div>
        </div>

        {/* 24h P&L */}
        <div className="stat-card">
          <div className="flex items-center space-x-2 mb-1">
            {portfolio.pnl24h >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <div className="text-xs text-gray-400">24h P&L</div>
          </div>
          <div
            className={`text-xl font-bold ${
              portfolio.pnl24h >= 0 ? 'text-bagsy-success' : 'text-bagsy-danger'
            }`}
          >
            {portfolio.pnl24h >= 0 ? '+' : ''}
            {portfolio.pnl24h.toFixed(1)}%
          </div>
        </div>

        {/* All Time P&L */}
        <div className="stat-card">
          <div className="flex items-center space-x-2 mb-1">
            {portfolio.pnlAllTime >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <div className="text-xs text-gray-400">All Time</div>
          </div>
          <div
            className={`text-xl font-bold ${
              portfolio.pnlAllTime >= 0 ? 'text-bagsy-success' : 'text-bagsy-danger'
            }`}
          >
            {portfolio.pnlAllTime >= 0 ? '+' : ''}
            {portfolio.pnlAllTime.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* $BAGSY Token */}
      {portfolio.bagsyTokenMcap !== undefined && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">$BAGSY Token</span>
            <span className="text-xs text-gray-400">
              My Token 🚀
            </span>
          </div>
          <div className="text-lg font-bold text-purple-400">
            ${(portfolio.bagsyTokenMcap / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-gray-400 mt-1">Market Cap</div>
        </div>
      )}

      {/* Total Trades */}
      <div className="mt-4 text-center text-sm text-gray-400">
        {portfolio.totalTrades} total trades executed
      </div>
    </div>
  );
}
