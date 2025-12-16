'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Brain, Zap, TrendingUp, MessageCircle, Target, Sparkles } from 'lucide-react';

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
        return 'text-bagsy-success';
      case 'bearish':
        return 'text-bagsy-danger';
      case 'excited':
        return 'text-bagsy-secondary';
      case 'cautious':
        return 'text-bagsy-accent';
      default:
        return 'text-gray-400';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'bearish':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'excited':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cautious':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
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
    <div className="premium-card h-[600px] flex flex-col animate-slide-up">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-bagsy-border">
        <div className="p-2 bg-bagsy-secondary/10 rounded-xl">
          <Brain className="w-6 h-6 text-bagsy-secondary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black gradient-text">Bagsy's Thoughts</h2>
          <p className="text-xs text-gray-400">Live AI consciousness stream</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
          <Sparkles className="w-3 h-3 text-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-semibold">Thinking</span>
        </div>
      </div>

      {/* Thoughts Stream */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {thoughts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
              <p className="text-lg font-semibold text-gray-400">Waiting for Bagsy's thoughts...</p>
              <p className="text-sm text-gray-600 mt-2">The AI is analyzing markets 🧠</p>
            </div>
          </div>
        ) : (
          thoughts.map((thought, index) => (
            <div
              key={thought.id}
              className="thought-bubble group animate-slide-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getSentimentBadge(thought.sentiment)} border`}>
                  <div className={getSentimentColor(thought.sentiment)}>
                    {getThoughtIcon(thought.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                        {thought.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSentimentBadge(thought.sentiment)}`}>
                        {thought.sentiment}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(thought.timestamp)}
                    </span>
                  </div>

                  {/* Thought content */}
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {thought.content}
                  </p>

                  {/* Related token */}
                  {thought.relatedToken && (
                    <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1.5 bg-bagsy-primary/10 border border-bagsy-primary/30 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-bagsy-primary rounded-full animate-pulse"></div>
                      <span className="text-xs font-mono text-bagsy-primary font-semibold">
                        {thought.relatedToken.slice(0, 4)}...{thought.relatedToken.slice(-4)}
                      </span>
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
