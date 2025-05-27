import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Clock, RotateCcw, ExternalLink, Target, Timer, Award } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* SEO-Optimized Header with Brand */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            Reaction-Time.Click
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-200 mb-4 max-w-4xl mx-auto font-semibold">
            Free Online Reaction Speed Test Game
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Test your reflexes with the ultimate reaction time game! Measure how fast you can react and get rated from Lightning Ninja ⚡ to Sleepy Sloth 🦥
          </p>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Challenge yourself, compete with friends, and improve your gaming skills with our free reaction speed test
          </p>
        </header>

        {/* Game Statistics Dashboard */}
        {attempts > 0 && (
          <section className="mb-12" aria-label="Game Statistics">
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="flex items-center gap-3 px-6 py-3 text-lg font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Best: {bestTime}ms
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-3 px-6 py-3 text-lg font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                <Zap className="w-6 h-6 text-blue-400" />
                Average: {averageTime}ms
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-3 px-6 py-3 text-lg font-medium bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                <Clock className="w-6 h-6 text-green-400" />
                Attempts: {attempts}
              </Badge>
            </div>
          </section>
        )}

        {/* Main Game Interface */}
        <main className="flex justify-center mb-16">
          <Card className="w-full max-w-lg h-96 p-0 overflow-hidden shadow-2xl border-4 border-white/30 bg-transparent" role="main">
            <div 
              className={`w-full h-full ${config.bgColor} cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center text-white relative overflow-hidden rounded-lg`}
              onClick={config.action}
              role="button"
              tabIndex={0}
              aria-label={`Reaction test area - ${config.text}`}
              onKeyDown={(e) => e.key === 'Enter' && config.action()}
            >
              {/* Background Animation */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 bg-white rounded-full animate-pulse`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="text-center z-10 px-8">
                <div className="text-4xl md:text-5xl font-bold mb-4 animate-pulse leading-tight">
                  {config.text}
                </div>
                <div className="text-xl md:text-2xl opacity-90 leading-relaxed">
                  {config.subtext}
                </div>
                
                {gameState === 'result' && reactionTime && (
                  <div className="mt-6 text-7xl animate-bounce">
                    {getRating(reactionTime).emoji}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </main>

        {/* How to Play Instructions */}
        <section className="mb-16" aria-labelledby="instructions-heading">
          <h3 id="instructions-heading" className="text-3xl font-bold text-white mb-8 text-center">How to Play Reaction-Time.Click</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <Target className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h4 className="text-xl font-semibold text-white mb-3">Step 1: Start</h4>
              <p className="text-gray-200 text-lg leading-relaxed">Click the reaction test button to begin your speed challenge</p>
            </div>
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <Timer className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h4 className="text-xl font-semibold text-white mb-3">Step 2: Wait</h4>
              <p className="text-gray-200 text-lg leading-relaxed">Wait patiently for the screen to turn GREEN - don't click early!</p>
            </div>
            <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <Award className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h4 className="text-xl font-semibold text-white mb-3">Step 3: React</h4>
              <p className="text-gray-200 text-lg leading-relaxed">Click instantly when it turns green to test your reaction speed!</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex justify-center gap-6 mb-16">
          {gameState === 'result' && (
            <Button 
              onClick={resetGame}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-10 py-4 text-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              Test Again
            </Button>
          )}
          
          {attempts > 0 && (
            <Button 
              onClick={resetStats}
              variant="outline"
              size="lg"
              className="border-2 border-red-400/60 text-red-300 hover:bg-red-500/20 hover:border-red-400 hover:text-red-200 font-semibold px-10 py-4 text-xl flex items-center gap-4 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm bg-red-900/20"
            >
              <RotateCcw className="w-6 h-6" />
              Reset Statistics
            </Button>
          )}
        </section>

        {/* SEO Content Sections */}
        <section className="mb-16" aria-labelledby="about-section">
          <div className="grid md:grid-cols-2 gap-12">
            <article className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
              <h3 id="about-section" className="text-white font-bold mb-4 text-2xl flex items-center gap-3">
                <Target className="w-6 h-6 text-yellow-400" />
                About Reaction Speed Testing
              </h3>
              <p className="leading-relaxed text-lg text-gray-200 mb-4">
                Reaction time is the duration between a stimulus appearing and your physical response. The average human reaction time ranges from 200-250 milliseconds, but with practice, you can significantly improve your reflexes.
              </p>
              <p className="leading-relaxed text-lg text-gray-200">
                Professional gamers and athletes often achieve reaction times under 200ms, giving them a competitive edge in fast-paced scenarios.
              </p>
            </article>
            <article className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
              <h3 className="text-white font-bold mb-4 text-2xl flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-400" />
                How to Improve Your Reflexes
              </h3>
              <p className="leading-relaxed text-lg text-gray-200 mb-4">
                Regular practice with reaction time tests like Reaction-Time.Click can help improve your reflexes. Factors that enhance reaction speed include adequate sleep, proper hydration, and consistent training.
              </p>
              <p className="leading-relaxed text-lg text-gray-200">
                Use our free reaction speed test daily to track your progress and challenge yourself to achieve faster times!
              </p>
            </article>
          </div>
        </section>

        {/* Additional SEO Content */}
        <section className="mb-16" aria-labelledby="benefits-section">
          <h3 id="benefits-section" className="text-3xl font-bold text-white mb-8 text-center">Why Test Your Reaction Speed?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Gaming Performance</h4>
              <p className="text-gray-300">Improve your competitive gaming skills and achieve faster response times in esports</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Daily Training</h4>
              <p className="text-gray-300">Use our free reaction test as part of your daily cognitive training routine</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Challenge Friends</h4>
              <p className="text-gray-300">Share your scores and compete with friends to see who has the fastest reflexes</p>
            </div>
          </div>
        </section>

        {/* Footer with Enhanced SEO */}
        <footer className="text-center max-w-5xl mx-auto text-gray-400 border-t border-gray-600/50 pt-8">
          <div className="mb-8">
            <h4 className="text-2xl font-bold text-white mb-4">Reaction-Time.Click - The Ultimate Reflex Test</h4>
            <p className="text-lg leading-relaxed mb-4">
              Free online reaction speed test game designed to measure and improve your reflexes. Perfect for gamers, athletes, and anyone looking to enhance their reaction time. Test yourself daily and track your progress!
            </p>
            <p className="text-base leading-relaxed text-gray-300">
              Keywords: reaction time test, reflex game, speed test, online reaction game, free reaction test, gaming reflexes, esports training, click speed test, human reaction time, improve reflexes
            </p>
          </div>
          <div className="space-y-4">
            <p className="flex items-center justify-center gap-2 text-gray-500 text-base">
              Created by 
              <a 
                href="https://askharoun.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300 flex items-center gap-1 underline font-medium"
              >
                askharoun.dev
                <ExternalLink className="w-4 h-4" />
              </a>
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Reaction-Time.Click - All Rights Reserved | Free Reaction Speed Test Game
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
