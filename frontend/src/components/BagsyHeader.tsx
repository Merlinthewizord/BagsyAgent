'use client';

import { Activity, Wallet } from 'lucide-react';
import Image from 'next/image';

interface BagsyHeaderProps {
  connected: boolean;
}

export default function BagsyHeader({ connected }: BagsyHeaderProps) {
  return (
    <header className="bg-bagsy-darker border-b border-bagsy-border sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Bagsy Character */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for Bagsy image - replace with actual image */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bagsy-primary to-bagsy-secondary flex items-center justify-center text-3xl animate-pulse-slow shadow-glow-green">
                🤖
              </div>
              {connected && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bagsy-primary rounded-full border-2 border-bagsy-darker animate-pulse shadow-glow-green"></div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold neon-text text-bagsy-primary">
                Bagsy
              </h1>
              <p className="text-sm text-gray-400">Autonomous AI Trader</p>
            </div>
          </div>

          {/* Center - Tagline */}
          <div className="hidden md:block">
            <p className="text-lg font-bold text-white">
              On a mission to <span className="text-bagsy-primary neon-text">$100k</span> 💰
            </p>
            <p className="text-xs text-gray-400 text-center">
              $BAGSY to <span className="text-bagsy-secondary">$100M</span> market cap 🚀
            </p>
          </div>

          {/* Right - Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-bagsy-card px-3 py-2 rounded-lg border border-bagsy-border">
              {connected ? (
                <>
                  <Activity className="w-5 h-5 text-bagsy-primary animate-pulse" />
                  <span className="text-sm text-bagsy-primary font-bold">LIVE</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Offline</span>
                </>
              )}
            </div>

            <a
              href="https://solscan.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm flex items-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
