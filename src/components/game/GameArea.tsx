import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, Award, Zap, Target } from "lucide-react";
import { GameState } from '@/hooks/useReactionGame';

interface GameAreaProps {
  gameState: GameState;
  onGameStart: () => void;
  onResetGame: () => void;
  onGameClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAdvanceTutorial: () => void;
  onSkipTutorial: () => void;
  onTimeout: () => void;
  showStats?: boolean;
}

const GameArea = ({ 
  gameState, 
  onGameStart, 
  onResetGame,
  onGameClick,
  onAdvanceTutorial,
  onSkipTutorial,
}: GameAreaProps) => {
  const { 
    showTarget, isPlaying, 
    reactionTime, targetSize, gameOver,
    firstTime, tutorialStep, targetPosition,
    lastTargetHit, level,
    timeoutOccurred, justLeveledUp, score
  } = gameState;

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const [nextParticleId, setNextParticleId] = useState(0);

  // Create sound wave effect on target hit
  const createSoundWave = (x: number, y: number) => {
    if (!gameAreaRef.current) return;
    
    const soundWave = document.createElement('div');
    soundWave.classList.add('sound-wave');
    soundWave.style.left = `${x}px`;
    soundWave.style.top = `${y}px`;
    
    gameAreaRef.current.appendChild(soundWave);
    
    // Remove after animation completes
    setTimeout(() => {
      if (gameAreaRef.current && soundWave) {
        gameAreaRef.current.removeChild(soundWave);
      }
    }, 1000);
  };
  
  // Create explosion particles when target is hit
  const createExplosion = (x: number, y: number) => {
    if (!lastTargetHit || !gameAreaRef.current) return;
    
    const colors = ['#ff4d4d', '#ffff4d', '#4dff4d', '#4dffff', '#4d4dff', '#ff4dff'];
    const newParticles = [];
    
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: nextParticleId + i,
        x: x + (Math.random() * 40 - 20),
        y: y + (Math.random() * 40 - 20),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    setNextParticleId(nextParticleId + 15);
    
    // Clean up particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1000);
  };
  
  // Show level up notification
  useEffect(() => {
    if (justLeveledUp) {
      setShowLevelUp(true);
      setTimeout(() => {
        setShowLevelUp(false);
      }, 2000);
    }
  }, [justLeveledUp]);

  // Get encouraging message based on reaction time or timeout
  const getMessage = () => {
    if (timeoutOccurred) return "TOO SLOW!";
    if (!lastTargetHit) return "MISSED!";
    if (!reactionTime) return "";
    if (reactionTime < 200) return "SUPERHUMAN!";
    if (reactionTime < 250) return "LIGHTNING FAST!";
    if (reactionTime < 300) return "EXCELLENT!";
    if (reactionTime < 350) return "GREAT JOB!";
    if (reactionTime < 400) return "GOOD REFLEXES!";
    return "KEEP PRACTICING!";
  };

  // Get color for reaction time message
  const getMessageColor = () => {
    if (timeoutOccurred || !lastTargetHit) return "text-red-300";
    if (!reactionTime) return "";
    if (reactionTime < 200) return "text-purple-300";
    if (reactionTime < 250) return "text-cyan-300";
    if (reactionTime < 300) return "text-green-300";
    if (reactionTime < 350) return "text-yellow-300";
    if (reactionTime < 400) return "text-blue-300";
    return "text-white";
  };
  
  // Reference for creating sound waves
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Custom click handler to add sound wave effect
  const handleGameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Create sound wave at click position
    createSoundWave(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    
    // If a target is showing, create explosion effect
    if (showTarget) {
      const targetX = (targetPosition.x / 100) * e.currentTarget.offsetWidth;
      const targetY = (targetPosition.y / 100) * e.currentTarget.offsetHeight;
      createExplosion(targetX, targetY);
    }
    
    // Call the original click handler
    onGameClick(e);
  };

  // Render tutorial if it's the user's first time
  if (firstTime) {
    return (
      <div className="arcade-game-container tutorial-container relative overflow-hidden">
        {/* Background pattern for tutorial */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-gray-900 opacity-70"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMSAxaDQ4djQ4SDFWMXptMSAxdjE4aDhWMmg4djhoOFYyaDIwdjQ2SDJ2LTI4aDhWMTB6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')]"></div>
        
        <div className="pixel-header p-4 text-center relative z-10">
          <div className="text-4xl sm:text-5xl font-bold arcade-text text-white glow-text animate-pulse">REACTION MASTER</div>
          <div className="relative">
            <p className="text-cyan-300 pixel-text text-lg sm:text-xl mt-2">TUTORIAL</p>
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-1 w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-1 w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 bg-gray-900 bg-opacity-80 text-white arcade-panel tutorial-panel relative z-10 border-t-4 border-b-4 border-cyan-500 shadow-lg shadow-cyan-900/50">
          {tutorialStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl arcade-text text-cyan-300 glow-text-cyan">How To Play</h2>
              <p className="pixel-text text-lg">Welcome to Reaction Master! This game tests how quickly you can react.</p>
              <div className="border-l-4 border-cyan-400 pl-6 my-4 bg-cyan-900 bg-opacity-20 py-3">
                <p className="pixel-text text-cyan-200 text-lg">The goal is simple: click on targets as fast as you can before they disappear!</p>
              </div>
              <div className="my-4 flex justify-center">
                <Target className="text-cyan-400 animate-pulse" size={60} />
              </div>
              <div className="mt-8 flex justify-center gap-6">
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-900 text-white arcade-btn text-lg border-b-4 border-purple-900 hover:from-purple-600 hover:to-purple-800 transition-all"
                  onClick={onSkipTutorial}
                >
                  SKIP
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white arcade-btn text-lg border-b-4 border-cyan-900 hover:from-cyan-500 hover:to-cyan-700 transition-all"
                  onClick={onAdvanceTutorial}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl arcade-text text-cyan-300 glow-text-cyan">Game Rules</h2>
              <ol className="list-decimal pl-6 space-y-3 pixel-text text-lg">
                <li>Click <span className="text-green-400 font-bold">START</span> to begin</li>
                <li>Targets will appear in <span className="text-yellow-400 font-bold">RANDOM LOCATIONS</span></li>
                <li>Each target has <span className="text-yellow-400 font-bold">5 SECONDS</span> to be clicked</li>
                <li>Time decreases by <span className="text-red-400 font-bold">0.5 SECONDS</span> each level</li>
                <li>Missed targets cost you a <span className="text-red-400 font-bold">LIFE</span></li>
                <li>Game ends after <span className="text-red-400 font-bold">3 MISSES</span></li>
              </ol>
              <div className="flex justify-center py-6">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-300 rounded-full animate-pulse shadow-lg shadow-green-500/50 relative">
                  <div className="absolute inset-2 rounded-full border-4 border-white border-opacity-30"></div>
                  <div className="absolute inset-4 rounded-full border-2 border-white border-opacity-20"></div>
                </div>
              </div>
              <div className="mt-8 flex justify-center gap-6">
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-900 text-white arcade-btn text-lg border-b-4 border-purple-900 hover:from-purple-600 hover:to-purple-800 transition-all"
                  onClick={() => onAdvanceTutorial()}
                >
                  BACK
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white arcade-btn text-lg border-b-4 border-cyan-900 hover:from-cyan-500 hover:to-cyan-700 transition-all"
                  onClick={onAdvanceTutorial}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl arcade-text text-cyan-300 glow-text-cyan">Leveling Up</h2>
              <p className="pixel-text text-lg">Each successful click earns you experience points.</p>
              <div className="my-4 bg-gray-800 h-6 rounded-none relative overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-6" style={{ width: '60%' }}></div>
                <div className="absolute top-0 left-0 h-full w-full bg-grid-pattern"></div>
                {[25, 50, 75].map(marker => (
                  <div 
                    key={marker} 
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-600" 
                    style={{ left: `${marker}%` }}
                  />
                ))}
              </div>
              <p className="pixel-text text-lg">Fill the bar to level up! Each level:</p>
              <ul className="list-disc pl-6 space-y-2 pixel-text text-lg">
                <li>Makes targets <span className="text-yellow-400 font-bold">smaller</span></li>
                <li>Reduces time by <span className="text-red-400 font-bold">0.5 seconds</span> per level</li>
                <li>Increases point <span className="text-yellow-400 font-bold">multipliers</span></li>
              </ul>
              <div className="mt-8 flex justify-center gap-6">
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-900 text-white arcade-btn text-lg border-b-4 border-purple-900 hover:from-purple-600 hover:to-purple-800 transition-all"
                  onClick={() => onAdvanceTutorial()}
                >
                  BACK
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white arcade-btn text-lg border-b-4 border-green-900 hover:from-green-500 hover:to-green-700 transition-all"
                  onClick={onSkipTutorial}
                >
                  START PLAYING
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      </div>
    );
  }

  return (
    <div className="arcade-game-container relative">
      {/* Header with enhanced styling */}
      <div className="pixel-header p-3 sm:p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 opacity-50"></div>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold arcade-text text-white glow-text">REACTION MASTER</h1>
          <div className="flex items-center justify-center mt-2">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-cyan-300 mr-3"></div>
            <p className="text-cyan-300 pixel-text text-lg sm:text-xl">TEST YOUR REFLEXES</p>
            <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-cyan-300 ml-3"></div>
          </div>
        </div>
      </div>

      {/* Feedback messages with enhanced styling */}
      {(reactionTime || timeoutOccurred) && !gameOver && (
        <div className={`p-2 sm:p-3 text-center relative overflow-hidden ${
          lastTargetHit ? 'bg-indigo-900' : 'bg-red-900'
        } font-medium pixel-text text-lg sm:text-xl`}>
          <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
          <div className={`relative z-10 ${getMessageColor()} animate-pulse font-bold tracking-wider`}>
            {getMessage()}
          </div>
        </div>
      )}
      
      {/* Game area with improved styling */}
      <div
        ref={gameAreaRef}
        className={`relative w-full min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[540px] cursor-pointer transition-colors duration-300 arcade-game-area overflow-hidden ${
          showTarget 
            ? "game-area-active" 
            : lastTargetHit 
              ? "game-area-success" 
              : timeoutOccurred
                ? "game-area-error"
                : "game-area-idle"
        }`}
        style={{height: 'calc(min(70vh, 700px))'}}
        onClick={handleGameClick}
      >
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        {/* CRT scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanlines"></div>
        <div className="absolute inset-0 pointer-events-none crt-glow"></div>
        
        {/* Explosion particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full animate-particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 8px 2px ${particle.color}`
            }}
          />
        ))}
        
        {/* Target */}
        {showTarget && (
          <div 
            className="absolute arcade-target"
            style={{
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
              width: `${targetSize}px`,
              height: `${targetSize}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="target-outer animate-pulse"></div>
            <div className="target-middle"></div>
            <div className="target-inner"></div>
            <div className="target-bullseye"></div>
            
            {/* Pulsing glow around target */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white"></div>
          </div>
        )}
        
        {/* Start button with enhanced styling */}
        {!isPlaying && !showTarget && !gameOver && !reactionTime && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-600/30 arcade-btn text-2xl start-game-btn border-b-4 border-purple-800 transition-all duration-200 transform hover:scale-105"
              onClick={onGameStart}
            >
              <Play className="mr-3" size={30} />
              <span className="arcade-text">START GAME</span>
            </button>
          </div>
        )}
        
        {/* Timeout message with enhanced styling */}
        {timeoutOccurred && !showTarget && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-80 p-6 rounded-lg border-2 border-red-500 flex flex-col items-center shadow-lg shadow-red-500/30">
              <AlertTriangle className="text-red-400 mb-3 animate-pulse" size={50} />
              <div className="text-red-400 font-mono text-3xl glow-text-red">TIME&apos;S UP!</div>
              <div className="text-red-300 font-mono mt-2 text-xl">Life Lost!</div>
            </div>
          </div>
        )}
        
        {/* Level Up notification with enhanced styling */}
        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black bg-opacity-80 p-8 rounded-lg flex flex-col items-center level-up-notification border-2 border-yellow-400 shadow-lg shadow-yellow-500/50">
              <div className="level-up-star"></div>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 animate-spin-slow bg-radial-star"></div>
              </div>
              <Award className="text-yellow-400 mb-3 animate-bounce" size={50} />
              <div className="text-yellow-300 font-mono text-3xl glow-text-yellow">LEVEL UP!</div>
              <div className="text-yellow-200 font-mono mt-2 text-2xl">Level {level}</div>
              <div className="mt-3 flex">
                {[...Array(Math.min(level, 5))].map((_, i) => (
                  <Zap key={i} className="text-yellow-400" size={16} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Game Over popup with enhanced styling */}
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-lg border-4 border-red-500 w-[85%] sm:w-4/5 max-w-md text-center arcade-gameover shadow-2xl shadow-red-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
              <div className="relative z-10">
                <div className="text-5xl arcade-text text-red-500 animate-glitch glow-text-red mb-6">GAME OVER</div>
                <div className="text-white pixel-text mb-4 text-3xl font-bold">FINAL SCORE: <span className="text-yellow-300 glow-text-yellow">{score}</span></div>
                <div className="text-cyan-300 pixel-text mb-6 text-2xl">LEVEL: <span className="text-cyan-400">{level}</span></div>
                <button
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg arcade-btn text-xl mb-4 w-full border-b-4 border-purple-800 hover:from-red-500 hover:to-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/30"
                  onClick={onResetGame}
                >
                  <RotateCcw className="mr-3 inline" size={24} />
                  <span className="arcade-text">PLAY AGAIN</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions with enhanced styling */}
      <div className="p-3 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
        <div className="pixel-text text-cyan-300 text-lg sm:text-lg relative z-10 font-bold tracking-wider glow-text-cyan animate-pulse">
          CLICK TARGETS BEFORE THEY DISAPPEAR!
        </div>
      </div>
      
      {/* Add custom CSS */}
      <style jsx>{`
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
        }
        
        @keyframes particle {
          0% { transform: scale(1) translate(0, 0); opacity: 1; }
          100% { transform: scale(0) translate(var(--x, 10px), var(--y, 10px)); opacity: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-particle {
          --x: calc(random(20) - 10);
          --y: calc(random(20) - 10);
          animation: particle 1s forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        
        .glow-text-cyan {
          text-shadow: 0 0 10px rgba(45, 212, 191, 0.7);
        }
        
        .glow-text-yellow {
          text-shadow: 0 0 10px rgba(250, 204, 21, 0.7);
        }
        
        .glow-text-red {
          text-shadow: 0 0 10px rgba(248, 113, 113, 0.7);
        }
        
        .bg-circuit-pattern {
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMSAxaDQ4djQ4SDFWMXptMSAxdjE4aDhWMmg4djhoOFYyaDIwdjQ2SDJ2LTI4aDhWMTB6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=');
          background-size: 30px 30px;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .bg-radial-star {
          background: radial-gradient(circle, transparent 30%, #ffc409 70%, transparent 72%);
          background-size: 15% 15%;
        }
      `}</style>
    </div>
  );
}

export default GameArea;