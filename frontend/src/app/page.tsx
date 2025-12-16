'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import BagsyHeader from '@/components/BagsyHeader';
import ThoughtsStream from '@/components/ThoughtsStream';
// import ChatInterface from '@/components/ChatInterface';
import PortfolioStats from '@/components/PortfolioStats';
import GoalsDisplay from '@/components/GoalsDisplay';
import TradesPanel from '@/components/TradesPanel';
import PositionsPanel from '@/components/PositionsPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(API_URL);

    newSocket.on('connect', () => {
      console.log('Connected to Bagsy server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Bagsy server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <main className="min-h-screen bg-bagsy-darker">
      {/* Header */}
      <BagsyHeader connected={connected} />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Goals & Portfolio */}
          <div className="space-y-6">
            <GoalsDisplay socket={socket} />
            <PortfolioStats socket={socket} />
          </div>

          {/* Middle Column - Thoughts & Trades */}
          <div className="space-y-6">
            <ThoughtsStream socket={socket} />
            <TradesPanel socket={socket} />
          </div>

          {/* Right Column - Chat & Positions */}
          <div className="space-y-6">
            {/* <ChatInterface socket={socket} /> */}
            <PositionsPanel socket={socket} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-bagsy-dark border-t border-gray-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">
            🤖 Bagsy is an autonomous AI trading agent. Not financial advice. DYOR.
          </p>
          <p className="text-xs mt-2">
            Trade at your own risk. Past performance doesn't guarantee future results.
          </p>
        </div>
      </footer>
    </main>
  );
}
