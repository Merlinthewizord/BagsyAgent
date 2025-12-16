'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Yo! I'm Bagsy, your AI trading companion. Ask me anything about my trades, portfolio, or goals! 🚀",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Sorry, I had trouble responding. Try again!',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! My connection glitched. Hit me up again! 🤖",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="premium-card flex flex-col h-[600px] animate-slide-up">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-bagsy-border">
        <div className="p-2 bg-bagsy-secondary/10 rounded-xl">
          <MessageCircle className="w-6 h-6 text-bagsy-secondary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black gradient-text">Chat with Bagsy</h2>
          <p className="text-xs text-gray-400">AI-powered trading companion</p>
        </div>
        <div className="flex items-center space-x-2 bg-bagsy-secondary/10 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-bagsy-secondary rounded-full animate-pulse shadow-glow-blue"></div>
          <span className="text-xs text-bagsy-secondary font-semibold">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-slide-in ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-bagsy-secondary to-bagsy-primary shadow-glow-blue'
                  : 'bg-gradient-to-br from-bagsy-primary/20 to-bagsy-secondary/20 border border-bagsy-primary/30'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-black" />
              ) : (
                <Bot className="w-5 h-5 text-bagsy-primary" />
              )}
            </div>

            {/* Message Bubble */}
            <div className="flex-1 max-w-md">
              <div
                className={`${
                  message.role === 'user'
                    ? 'chat-bubble-user ml-auto'
                    : 'chat-bubble-bagsy'
                } group relative`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Timestamp on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3 animate-slide-in">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-bagsy-primary/20 to-bagsy-secondary/20 border border-bagsy-primary/30">
              <Bot className="w-5 h-5 text-bagsy-primary" />
            </div>
            <div className="chat-bubble-bagsy flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-bagsy-primary animate-spin" />
              <span className="text-sm text-gray-400">Bagsy is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 pt-4 border-t border-bagsy-border">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Bagsy anything..."
              disabled={isLoading}
              className="w-full bg-bagsy-card-light border border-bagsy-border rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-bagsy-primary/50 focus:ring-2 focus:ring-bagsy-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              Press Enter ↵
            </div>
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-glow-green"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Quick actions */}
        <div className="mt-3 flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {[
            "What's my portfolio?",
            "Show goals",
            "Recent trades?",
            "Win rate?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="flex-shrink-0 text-xs bg-bagsy-card-light hover:bg-bagsy-card border border-bagsy-border hover:border-bagsy-primary/30 text-gray-300 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
