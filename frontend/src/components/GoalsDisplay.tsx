'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Target } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  emoji: string;
}

interface GoalsDisplayProps {
  socket: Socket | null;
}

export default function GoalsDisplay({ socket }: GoalsDisplayProps) {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Fetch initial goals
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/goals`)
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch(console.error);

    // Listen for goal updates
    socket.on('goals', (updatedGoals: Goal[]) => {
      setGoals(updatedGoals);
    });

    return () => {
      socket.off('goals');
    };
  }, [socket]);

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-bagsy-accent" />
        <h2 className="text-xl font-bold">Mission Goals</h2>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{goal.emoji}</span>
                <span className="font-medium text-gray-300">{goal.name}</span>
              </div>
              <span className="text-sm font-semibold text-bagsy-primary">
                {goal.progress.toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-bagsy-primary to-bagsy-secondary transition-all duration-500 ease-out"
                style={{ width: `${Math.min(goal.progress, 100)}%` }}
              >
                {goal.progress > 50 && (
                  <div className="absolute inset-0 animate-glow"></div>
                )}
              </div>
            </div>

            {/* Values */}
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatValue(goal.current, goal.unit)}</span>
              <span>{formatValue(goal.target, goal.unit)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-bagsy-primary/10 to-bagsy-secondary/10 rounded-lg border border-bagsy-primary/20">
        <p className="text-sm text-center text-gray-300 font-medium">
          {goals[0]?.progress > 50
            ? "🔥 We're over halfway! LFG! 🚀"
            : "💪 The grind continues! Every trade counts! 📈"}
        </p>
      </div>
    </div>
  );
}
