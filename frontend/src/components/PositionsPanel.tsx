'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { ExternalLink, Wallet } from 'lucide-react';

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
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);

  useEffect(() => {
    if (!socket) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/wallet-tokens`)
      .then((res) => res.json())
      .then((data) => setWalletTokens(data))
      .catch(console.error);

    socket.on('wallet-tokens', (updatedTokens: WalletToken[]) => {
      setWalletTokens(updatedTokens);
    });

    return () => {
      socket.off('wallet-tokens');
    };
  }, [socket]);

  return (
    <div className="premium-card animate-slide-up">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-bagsy-border">
        <div className="p-2 bg-bagsy-purple/10 rounded-xl">
          <Wallet className="w-6 h-6 text-bagsy-purple" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black gradient-text">Wallet Positions</h2>
          <p className="text-xs text-gray-400">{walletTokens.length} tokens</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {walletTokens.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
              <p className="text-lg font-semibold text-gray-400">No tokens in wallet</p>
              <p className="text-sm text-gray-600 mt-2">Wallet is empty</p>
            </div>
          </div>
        ) : (
          walletTokens.map((token, index) => (
            <div
              key={token.mint}
              className="group relative p-5 rounded-xl bg-bagsy-card-light border border-bagsy-border hover:border-bagsy-purple/30 transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-black text-white">{token.symbol}</span>
                  <a
                    href={`https://solscan.io/token/${token.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-bagsy-primary transition-colors"
                    title="View on Solscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {token.valueUsd && (
                  <div className="text-xl font-black text-bagsy-primary">
                    ${token.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-bagsy-card border border-bagsy-border">
                  <div className="text-xs text-gray-400 mb-1">Balance</div>
                  <div className="text-sm font-bold text-white">
                    {token.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </div>
                </div>
                {token.priceUsd && (
                  <div className="p-3 rounded-lg bg-bagsy-card border border-bagsy-border">
                    <div className="text-xs text-gray-400 mb-1">Price</div>
                    <div className="text-sm font-bold text-white">
                      ${token.priceUsd.toFixed(token.priceUsd < 0.01 ? 8 : 4)}
                    </div>
                  </div>
                )}
                <div className="col-span-2 p-3 rounded-lg bg-bagsy-card border border-bagsy-border">
                  <div className="text-xs text-gray-400 mb-1">Token Address</div>
                  <div className="font-mono text-xs text-gray-300">
                    {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
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
