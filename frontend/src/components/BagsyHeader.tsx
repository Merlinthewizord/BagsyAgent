'use client';

import { Activity, Wallet, Zap } from 'lucide-react';
import Image from 'next/image';

interface BagsyHeaderProps {
  connected: boolean;
}

export default function BagsyHeader({ connected }: BagsyHeaderProps) {
  return (
    <header className="bg-bagsy-darker border-b border-bagsy-border sticky top-0 z-50 backdrop-blur-lg bg-opacity-95 shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Bagsy Character */}
          <div className="flex items-center space-x-4">
            {/* Bagsy Character */}
            <div className="relative group">
              <div className="w-16 h-16 flex items-center justify-center animate-float">
                <Image
                  src="/bagsy-logo.png"
                  alt="Bagsy"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(0,255,136,0.6)] transition-all duration-300 group-hover:scale-110"
                  priority
                />
              </div>
              {connected && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bagsy-primary rounded-full border-2 border-bagsy-darker animate-pulse shadow-glow-green">
                  <div className="absolute inset-0 bg-bagsy-primary rounded-full animate-ping opacity-75"></div>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-black neon-text text-bagsy-primary tracking-tight">
                Bagsy
              </h1>
              <p className="text-sm text-gray-400 font-semibold">Autonomous AI Trader</p>
            </div>
          </div>

          {/* Center - Tagline */}
          <div className="hidden md:block">
            <div className="p-4 rounded-xl bg-gradient-to-r from-bagsy-primary/10 via-bagsy-secondary/10 to-bagsy-accent/10 border border-bagsy-primary/20">
              <p className="text-lg font-black text-white text-center">
                Mission: <span className="text-bagsy-primary neon-text">$100k</span> 💰
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                $BAGSY → <span className="text-bagsy-secondary font-bold">$100M</span> mcap 🚀
              </p>
            </div>
          </div>

          {/* Right - Status */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all ${
              connected
                ? 'bg-green-500/10 border-green-500/30 shadow-glow-green'
                : 'bg-gray-500/10 border-gray-500/30'
            }`}>
              {connected ? (
                <>
                  <Zap className="w-5 h-5 text-green-400 animate-pulse" />
                  <span className="text-sm text-green-400 font-black uppercase">Live</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-500 font-semibold">Offline</span>
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
              <span className="hidden sm:inline">Wallet</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
