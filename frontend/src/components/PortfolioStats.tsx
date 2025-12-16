'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Wallet, TrendingUp, TrendingDown, PieChart, Award, Zap, DollarSign } from 'lucide-react';

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
    <div className="premium-card animate-slide-up">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-bagsy-primary/10 rounded-xl">
          <Wallet className="w-6 h-6 text-bagsy-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black gradient-text">Portfolio</h2>
          <p className="text-xs text-gray-400">Live trading stats</p>
        </div>
      </div>

      {/* Main Value - Hero Section */}
      <div className="mb-8 p-8 bg-gradient-to-br from-bagsy-primary/10 via-bagsy-secondary/10 to-bagsy-accent/10 rounded-2xl border border-bagsy-primary/30 shadow-glow-green relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bagsy-primary/5 to-transparent animate-shimmer"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-5 h-5 text-bagsy-primary animate-pulse" />
            <span className="text-sm text-gray-300 font-semibold uppercase tracking-wider">Total Value</span>
          </div>
          <div className="text-5xl font-black neon-text text-bagsy-primary mb-3 animate-fade-in">
            ${portfolio.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg text-bagsy-secondary font-bold">
              {portfolio.totalValueSol.toFixed(4)} SOL
            </div>
            <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-300 font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Positions */}
        <div className="stat-card group cursor-pointer">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <PieChart className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xs text-gray-400 font-medium">Active</div>
          </div>
          <div className="text-3xl font-black text-white">{portfolio.positions}</div>
          <div className="text-xs text-gray-500 mt-1">Positions</div>
        </div>

        {/* Win Rate */}
        <div className="stat-card group cursor-pointer">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-bagsy-primary/10 rounded-lg group-hover:bg-bagsy-primary/20 transition-colors">
              <Award className="w-4 h-4 text-bagsy-primary" />
            </div>
            <div className="text-xs text-gray-400 font-medium">Win Rate</div>
          </div>
          <div className="text-3xl font-black text-bagsy-primary">
            {portfolio.winRate.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">{portfolio.totalTrades} trades</div>
        </div>

        {/* 24h P&L */}
        <div className="stat-card group cursor-pointer">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1.5 rounded-lg transition-colors ${
              portfolio.pnl24h >= 0
                ? 'bg-green-500/10 group-hover:bg-green-500/20'
                : 'bg-red-500/10 group-hover:bg-red-500/20'
            }`}>
              {portfolio.pnl24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="text-xs text-gray-400 font-medium">24h P&L</div>
          </div>
          <div
            className={`text-3xl font-black ${
              portfolio.pnl24h >= 0 ? 'text-bagsy-success' : 'text-bagsy-danger'
            }`}
          >
            {portfolio.pnl24h >= 0 ? '+' : ''}
            {portfolio.pnl24h.toFixed(1)}%
          </div>
          <div className={`text-xs mt-1 ${
            portfolio.pnl24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {portfolio.pnl24h >= 0 ? '↗' : '↘'} Last 24 hours
          </div>
        </div>

        {/* All Time P&L */}
        <div className="stat-card group cursor-pointer">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1.5 rounded-lg transition-colors ${
              portfolio.pnlAllTime >= 0
                ? 'bg-green-500/10 group-hover:bg-green-500/20'
                : 'bg-red-500/10 group-hover:bg-red-500/20'
            }`}>
              {portfolio.pnlAllTime >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="text-xs text-gray-400 font-medium">All Time</div>
          </div>
          <div
            className={`text-3xl font-black ${
              portfolio.pnlAllTime >= 0 ? 'text-bagsy-success' : 'text-bagsy-danger'
            }`}
          >
            {portfolio.pnlAllTime >= 0 ? '+' : ''}
            {portfolio.pnlAllTime.toFixed(1)}%
          </div>
          <div className={`text-xs mt-1 ${
            portfolio.pnlAllTime >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {portfolio.pnlAllTime >= 0 ? 'Profit' : 'Loss'} lifetime
          </div>
        </div>
      </div>

      {/* $BAGSY Token */}
      {portfolio.bagsyTokenMcap !== undefined && portfolio.bagsyTokenMcap > 0 && (
        <div className="mt-6 p-5 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-xl border border-purple-500/40 shadow-glow-purple animate-slide-up relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💎</span>
                <span className="text-base font-black text-white">$BAGSY Token</span>
              </div>
              <span className="text-xs text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full font-semibold">
                My Token
              </span>
            </div>
            <div className="text-3xl font-black neon-text-pink text-purple-400 mb-2">
              ${(portfolio.bagsyTokenMcap / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Market Cap</span>
              <span className="text-xs text-purple-300">🚀 To the moon!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
