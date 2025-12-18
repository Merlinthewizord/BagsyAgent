#!/usr/bin/env python3

content = """'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { PieChart, TrendingUp, TrendingDown, ExternalLink, Wallet } from 'lucide-react';

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

interface WalletToken {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  priceUsd?: number;
  valueUsd?: number;
}

interface PositionsPanelProps {
  socket: Socket | null;
}

export default function PositionsPanel({ socket }: PositionsPanelProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
  const [activeTab, setActiveTab] = useState<'bot' | 'wallet'>('wallet');

  useEffect(() => {
    if (!socket) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/positions`)
      .then((res) => res.json())
      .then((data) => setPositions(data))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/wallet-tokens`)
      .then((res) => res.json())
      .then((data) => setWalletTokens(data))
      .catch(console.error);

    socket.on('positions', (updatedPositions: Position[]) => {
      setPositions(updatedPositions);
    });

    socket.on('wallet-tokens', (updatedTokens: WalletToken[]) => {
      setWalletTokens(updatedTokens);
    });

    return () => {
      socket.off('positions');
      socket.off('wallet-tokens');
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
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <PieChart className="w-5 h-5 text-bagsy-secondary" />
          <h2 className="text-xl font-bold">Positions</h2>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'wallet'
                ? 'bg-bagsy-primary text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>All Wallet</span>
              <span className="text-xs">({walletTokens.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bot')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'bot'
                ? 'bg-bagsy-primary text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span>Bot Trades</span>
              <span className="text-xs">({positions.length})</span>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
        {activeTab === 'bot' ? (
          positions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active bot positions</p>
              </div>
            </div>
          ) : (
            positions.map((pos) => (
              <div
                key={pos.tokenAddress}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
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
          )
        ) : (
          walletTokens.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tokens in wallet</p>
              </div>
            </div>
          ) : (
            walletTokens.map((token) => (
              <div
                key={token.mint}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">{token.symbol}</span>
                    <a
                      href={`https://solscan.io/token/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-bagsy-primary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {token.valueUsd && (
                    <div className="font-bold text-lg text-bagsy-primary">
                      ${token.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Balance</div>
                    <div className="font-medium">
                      {token.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                  </div>
                  {token.priceUsd && (
                    <div>
                      <div className="text-gray-400">Price</div>
                      <div className="font-medium">
                        ${token.priceUsd.toFixed(token.priceUsd < 0.01 ? 8 : 4)}
                      </div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <div className="text-gray-400">Token Address</div>
                    <div className="font-mono text-xs text-gray-300">
                      {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
"""

with open('frontend/src/components/PositionsPanel.tsx', 'w') as f:
    f.write(content)

print("PositionsPanel.tsx updated successfully!")
