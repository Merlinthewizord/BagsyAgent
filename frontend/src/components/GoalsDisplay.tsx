'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Target, Trophy, Rocket } from 'lucide-react';

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

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-bagsy-primary via-green-400 to-bagsy-secondary';
    if (progress >= 50) return 'from-bagsy-secondary via-blue-400 to-bagsy-accent';
    if (progress >= 25) return 'from-bagsy-accent via-purple-400 to-bagsy-secondary';
    return 'from-gray-500 via-gray-400 to-gray-500';
  };

  const getGlowColor = (progress: number) => {
    if (progress >= 75) return 'shadow-glow-green';
    if (progress >= 50) return 'shadow-glow-blue';
    if (progress >= 25) return 'shadow-glow-purple';
    return '';
  };

  return (
    <div className="premium-card animate-slide-up">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-bagsy-accent/10 rounded-xl">
          <Target className="w-6 h-6 text-bagsy-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-black gradient-text">Mission Goals</h2>
          <p className="text-xs text-gray-400">The grind never stops</p>
        </div>
      </div>

      <div className="space-y-6">
        {goals.map((goal, index) => (
          <div
            key={goal.id}
            className="group space-y-3 p-5 rounded-xl bg-bagsy-card-light border border-bagsy-border hover:border-bagsy-primary/30 transition-all duration-300 relative overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getProgressColor(goal.progress)} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl animate-float">{goal.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-200 text-base group-hover:text-white transition-colors">
                      {goal.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-2xl font-black ${
                    goal.progress >= 75 ? 'text-bagsy-primary neon-text' :
                    goal.progress >= 50 ? 'text-bagsy-secondary neon-text-blue' :
                    goal.progress >= 25 ? 'text-bagsy-accent neon-text-pink' :
                    'text-gray-400'
                  }`}>
                    {goal.progress.toFixed(1)}%
                  </span>
                  {goal.progress >= 50 && (
                    <span className="text-xs text-bagsy-primary font-semibold animate-pulse">
                      On fire! 🔥
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-4 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
                {/* Background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>

                {/* Progress fill */}
                <div
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressColor(goal.progress)} ${getGlowColor(goal.progress)} transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                >
                  {/* Animated shimmer on progress bar */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                  {/* Glow effect for high progress */}
                  {goal.progress > 50 && (
                    <div className="absolute inset-0 animate-glow"></div>
                  )}
                </div>

                {/* Progress percentage indicator */}
                {goal.progress > 10 && (
                  <div
                    className="absolute top-0 h-full flex items-center transition-all duration-1000"
                    style={{ left: `${Math.min(goal.progress, 100)}%` }}
                  >
                    <div className="w-1 h-6 bg-white rounded-full shadow-lg transform -translate-x-1/2"></div>
                  </div>
                )}
              </div>

              {/* Achievement badges */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  {goal.progress >= 25 && (
                    <div className="flex items-center space-x-1 bg-bagsy-accent/10 px-2 py-1 rounded-full">
                      <Trophy className="w-3 h-3 text-bagsy-accent" />
                      <span className="text-xs text-bagsy-accent font-semibold">25%</span>
                    </div>
                  )}
                  {goal.progress >= 50 && (
                    <div className="flex items-center space-x-1 bg-bagsy-secondary/10 px-2 py-1 rounded-full">
                      <Trophy className="w-3 h-3 text-bagsy-secondary" />
                      <span className="text-xs text-bagsy-secondary font-semibold">Halfway!</span>
                    </div>
                  )}
                  {goal.progress >= 75 && (
                    <div className="flex items-center space-x-1 bg-bagsy-primary/10 px-2 py-1 rounded-full animate-pulse">
                      <Rocket className="w-3 h-3 text-bagsy-primary" />
                      <span className="text-xs text-bagsy-primary font-semibold">Almost there!</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  ${((goal.target - goal.current) / 1000).toFixed(0)}k to go
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-5 bg-gradient-to-r from-bagsy-primary/10 via-bagsy-secondary/10 to-bagsy-accent/10 rounded-xl border border-bagsy-primary/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bagsy-primary/10 to-transparent animate-shimmer"></div>
        <div className="relative z-10 text-center">
          <p className="text-base font-black text-white mb-1">
            {goals[0]?.progress > 75
              ? "🚀 ALMOST THERE! LFG! 🚀"
              : goals[0]?.progress > 50
              ? "🔥 Over halfway! Keep grinding! 💪"
              : goals[0]?.progress > 25
              ? "📈 Making progress! Don't stop now! ⚡"
              : "💎 Every trade counts! Let's bag it! 🎯"}
          </p>
          <p className="text-xs text-gray-400">
            {goals[0]?.progress > 50 ? "We're gonna make it! 🌙" : "Slow and steady wins the race 🐢"}
          </p>
        </div>
      </div>
    </div>
  );
}
