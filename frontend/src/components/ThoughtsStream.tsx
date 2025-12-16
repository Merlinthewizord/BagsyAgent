'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Brain, Zap, TrendingUp, MessageCircle, Target } from 'lucide-react';

interface Thought {
  id: string;
  timestamp: number;
  type: 'analysis' | 'decision' | 'trade' | 'reflection' | 'goal';
  content: string;
  relatedToken?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'excited' | 'cautious';
}

interface ThoughtsStreamProps {
  socket: Socket | null;
}

export default function ThoughtsStream({ socket }: ThoughtsStreamProps) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Fetch initial thoughts
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/thoughts?limit=20`)
      .then((res) => res.json())
      .then((data) => setThoughts(data.reverse()))
      .catch(console.error);

    // Listen for new thoughts
    socket.on('thought', (thought: Thought) => {
      setThoughts((prev) => [thought, ...prev].slice(0, 50));
    });

    return () => {
      socket.off('thought');
    };
  }, [socket]);

  const getThoughtIcon = (type: string) => {
    switch (type) {
      case 'analysis':
        return <Brain className="w-4 h-4" />;
      case 'decision':
        return <Zap className="w-4 h-4" />;
      case 'trade':
        return <TrendingUp className="w-4 h-4" />;
      case 'reflection':
        return <MessageCircle className="w-4 h-4" />;
      case 'goal':
        return <Target className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      case 'excited':
        return 'text-yellow-500';
      case 'cautious':
        return 'text-orange-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card h-96">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-bagsy-secondary" />
        <h2 className="text-xl font-bold">Bagsy's Thoughts</h2>
        <div className="ml-auto flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Thoughts Stream */}
      <div className="space-y-3 overflow-y-auto h-full scrollbar-hide">
        {thoughts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Waiting for Bagsy's thoughts...</p>
            </div>
          </div>
        ) : (
          thoughts.map((thought) => (
            <div
              key={thought.id}
              className="thought-bubble animate-slide-in"
            >
              <div className="flex items-start space-x-2 mb-2">
                <div className={getSentimentColor(thought.sentiment)}>
                  {getThoughtIcon(thought.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase">
                      {thought.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(thought.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {thought.content}
                  </p>
                  {thought.relatedToken && (
                    <div className="mt-2 inline-block px-2 py-1 bg-gray-700 rounded text-xs text-bagsy-primary">
                      {thought.relatedToken.slice(0, 4)}...{thought.relatedToken.slice(-4)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
