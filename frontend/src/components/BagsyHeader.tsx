'use client';

import { Activity, Wallet } from 'lucide-react';
import Image from 'next/image';

interface BagsyHeaderProps {
  connected: boolean;
}

export default function BagsyHeader({ connected }: BagsyHeaderProps) {
  return (
    <header className="bg-bagsy-dark border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Bagsy Character */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for Bagsy image - replace with actual image */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bagsy-primary to-bagsy-secondary flex items-center justify-center text-3xl animate-pulse-slow">
                🤖
              </div>
              {connected && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-bagsy-dark animate-pulse"></div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-bagsy-primary to-bagsy-secondary">
                Bagsy
              </h1>
              <p className="text-sm text-gray-400">Autonomous AI Trader</p>
            </div>
          </div>

          {/* Center - Tagline */}
          <div className="hidden md:block">
            <p className="text-lg font-semibold text-gray-300">
              On a mission to <span className="text-bagsy-accent">$100k</span> 💰
            </p>
            <p className="text-xs text-gray-500 text-center">
              $BAGSY to $100M market cap 🚀
            </p>
          </div>

          {/* Right - Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {connected ? (
                <>
                  <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                  <span className="text-sm text-green-500 font-medium">Live</span>
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
              <span>View Wallet</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
