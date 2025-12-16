'use client';

import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ChatMessage {
  id: string;
  timestamp: number;
  role: 'user' | 'bagsy';
  content: string;
  userName?: string;
}

interface ChatInterfaceProps {
  socket: Socket | null;
}

export default function ChatInterface({ socket }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get or set username
    const stored = localStorage.getItem('bagsyUserName');
    if (stored) {
      setUserName(stored);
    } else {
      const randomName = `Anon${Math.floor(Math.random() * 10000)}`;
      setUserName(randomName);
      localStorage.setItem('bagsyUserName', randomName);
    }

    // Fetch chat history
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/chat/history?limit=50`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/chat`,
        {
          message,
          userName,
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-700">
        <MessageCircle className="w-5 h-5 text-bagsy-accent" />
        <h2 className="text-xl font-bold">Chat with Bagsy</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation with Bagsy!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  msg.role === 'user'
                    ? 'chat-bubble-user'
                    : 'chat-bubble-bagsy'
                }`}
              >
                {msg.role === 'bagsy' && (
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs font-bold text-bagsy-primary">
                      Bagsy
                    </span>
                    <span className="text-xs text-gray-400">🤖</span>
                  </div>
                )}
                {msg.role === 'user' && msg.userName && (
                  <div className="text-xs text-blue-300 mb-1">
                    {msg.userName}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <div className="text-xs opacity-60 mt-1">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Bagsy anything..."
          disabled={isLoading}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bagsy-primary disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="mt-2 flex flex-wrap gap-2">
        {['What are you trading?', 'How's it going?', 'Show me your best trade'].map(
          (prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            >
              {prompt}
            </button>
          )
        )}
      </div>
    </div>
  );
}
