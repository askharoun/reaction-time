
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Clock, RotateCcw } from 'lucide-react';

type GameState = 'waiting' | 'ready' | 'active' | 'result' | 'too-early';

interface ReactionResult {
  time: number;
  rating: string;
  color: string;
  emoji: string;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [allTimes, setAllTimes] = useState<number[]>([]);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getRating = (time: number): ReactionResult => {
    if (time < 150) return { time, rating: "Lightning Ninja ⚡", color: "bg-yellow-400", emoji: "⚡" };
    if (time < 200) return { time, rating: "Speed Demon 🔥", color: "bg-orange-400", emoji: "🔥" };
    if (time < 250) return { time, rating: "Quick Draw 🎯", color: "bg-red-400", emoji: "🎯" };
    if (time < 300) return { time, rating: "Sharp Shooter 🏹", color: "bg-purple-400", emoji: "🏹" };
    if (time < 400) return { time, rating: "Average Human 👤", color: "bg-blue-400", emoji: "👤" };
    if (time < 500) return { time, rating: "Casual Clicker 🖱️", color: "bg-green-400", emoji: "🖱️" };
    if (time < 600) return { time, rating: "Sleepy Panda 🐼", color: "bg-gray-400", emoji: "🐼" };
    return { time, rating: "Sleepy Sloth 🦥", color: "bg-gray-600", emoji: "🦥" };
  };

  const startGame = useCallback(() => {
    if (gameState === 'active') {
      // Too early click
      setGameState('too-early');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    setGameState('ready');
    setReactionTime(null);
    
    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('active');
      startTimeRef.current = performance.now();
    }, delay);
  }, [gameState]);

  const handleClick = useCallback(() => {
    if (gameState === 'active') {
      const endTime = performance.now();
      const reaction = Math.round(endTime - startTimeRef.current);
      setReactionTime(reaction);
      setGameState('result');
      setAttempts(prev => prev + 1);
      
      // Update statistics
      const newTimes = [...allTimes, reaction];
      setAllTimes(newTimes);
      
      if (!bestTime || reaction < bestTime) {
        setBestTime(reaction);
      }
      
      const average = Math.round(newTimes.reduce((sum, time) => sum + time, 0) / newTimes.length);
      setAverageTime(average);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [gameState, allTimes, bestTime]);

  const resetGame = () => {
    setGameState('waiting');
    setReactionTime(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetStats = () => {
    setBestTime(null);
    setAttempts(0);
    setAverageTime(null);
    setAllTimes([]);
    resetGame();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getStateConfig = () => {
    switch (gameState) {
      case 'waiting':
        return {
          bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
          text: 'Click to Start!',
          subtext: 'Test your reaction speed',
          action: startGame
        };
      case 'ready':
        return {
          bgColor: 'bg-gradient-to-br from-red-500 to-pink-600',
          text: 'Wait for GREEN...',
          subtext: 'Get ready... Don\'t click yet!',
          action: startGame
        };
      case 'active':
        return {
          bgColor: 'bg-gradient-to-br from-green-400 to-emerald-600',
          text: 'CLICK NOW!',
          subtext: 'React as fast as you can!',
          action: handleClick
        };
      case 'too-early':
        return {
          bgColor: 'bg-gradient-to-br from-red-600 to-red-800',
          text: 'Too Early!',
          subtext: 'Wait for the green signal',
          action: resetGame
        };
      case 'result':
        const result = reactionTime ? getRating(reactionTime) : null;
        return {
          bgColor: result?.color || 'bg-gray-400',
          text: `${reactionTime}ms`,
          subtext: result?.rating || '',
          action: resetGame
        };
      default:
        return {
          bgColor: 'bg-blue-500',
          text: 'Click to Start',
          subtext: '',
          action: startGame
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* SEO Content Header */}
      <div className="text-center mb-8 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
          Reaction Speed Test
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-2">
          Test your reflexes and see how fast you can react! 
        </p>
        <p className="text-gray-400">
          Challenge yourself and get rated from Lightning Ninja ⚡ to Sleepy Sloth 🦥
        </p>
      </div>

      {/* Statistics Bar */}
      {attempts > 0 && (
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Best: {bestTime}ms
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
            <Zap className="w-4 h-4 text-blue-500" />
            Average: {averageTime}ms
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
            <Clock className="w-4 h-4 text-green-500" />
            Attempts: {attempts}
          </Badge>
        </div>
      )}

      {/* Main Game Area */}
      <Card className="w-full max-w-md h-80 p-0 overflow-hidden shadow-2xl border-4 border-white/20">
        <div 
          className={`w-full h-full ${config.bgColor} cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-white relative overflow-hidden`}
          onClick={config.action}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-white rounded-full animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
          
          <div className="text-center z-10">
            <div className="text-3xl md:text-4xl font-bold mb-3 animate-pulse">
              {config.text}
            </div>
            <div className="text-lg md:text-xl opacity-90">
              {config.subtext}
            </div>
            
            {gameState === 'result' && reactionTime && (
              <div className="mt-4 text-6xl animate-bounce">
                {getRating(reactionTime).emoji}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <div className="mt-8 text-center max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">How to Play</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">1️⃣</div>
            <p>Click the button to start the test</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">2️⃣</div>
            <p>Wait for the screen to turn GREEN</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl mb-2">3️⃣</div>
            <p>Click as fast as you can when it's green!</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        {gameState === 'result' && (
          <Button 
            onClick={resetGame}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3 text-lg shadow-lg"
          >
            Try Again
          </Button>
        )}
        
        {attempts > 0 && (
          <Button 
            onClick={resetStats}
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Stats
          </Button>
        )}
      </div>

      {/* SEO Footer Content */}
      <footer className="mt-16 text-center max-w-4xl text-gray-400 text-sm">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-2">About Reaction Speed</h3>
            <p>
              Reaction time is the time between a stimulus and your response. 
              Average human reaction time is around 250ms. Professional gamers often achieve under 200ms!
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Improve Your Reflexes</h3>
            <p>
              Regular practice, adequate sleep, and staying hydrated can help improve your reaction speed. 
              This free reaction time test helps you track your progress!
            </p>
          </div>
        </div>
        <p className="border-t border-gray-700 pt-4">
          Free online reaction speed test - Test your reflexes and compare with friends! 
          Share your best scores and challenge others to beat your reaction time.
        </p>
      </footer>
    </div>
  );
};

export default Index;
