import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Clock, AlertTriangle, Award } from "lucide-react";
import { GameState } from '@/hooks/useReactionGame';

interface GameAreaProps {
  gameState: GameState;
  onGameStart: () => void;
  onResetGame: () => void;
  onGameClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAdvanceTutorial: () => void;
  onSkipTutorial: () => void;
  onTimeout: () => void;
}

const GameArea = ({ 
  gameState, 
  onGameStart, 
  onResetGame,
  onGameClick,
  onAdvanceTutorial,
  onSkipTutorial,
  onTimeout
}: GameAreaProps) => {
  const { 
    showTarget, isPlaying, 
    reactionTime, targetSize, gameOver,
    firstTime, tutorialStep, targetPosition,
    timeLimit, lastTargetHit, lives, score, level,
    timeoutOccurred, justLeveledUp
  } = gameState;

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartedRef = useRef<boolean>(false);
  
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
  
  // Show level up notification
  useEffect(() => {
    if (justLeveledUp) {
      setShowLevelUp(true);
      setTimeout(() => {
        setShowLevelUp(false);
      }, 2000);
    }
  }, [justLeveledUp]);
  
  // Reset timer when a new target appears
  useEffect(() => {
    if (showTarget) {
      // Reset timer when target appears
      setTimeLeft(timeLimit);
      timerStartedRef.current = true;
      
      // Clear any existing interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 100;
          if (newTime <= 0) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            timerStartedRef.current = false;
            onTimeout(); // Trigger timeout handler
            return 0;
          }
          return newTime;
        });
      }, 100);
    } else {
      // Stop timer when no target
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timerStartedRef.current = false;
    }
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showTarget, timeLimit, onTimeout]);

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

  // Format time limit for display
  const formatTimeLimit = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };
  
  // Reference for creating sound waves
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Custom click handler to add sound wave effect
  const handleGameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Create sound wave at click position
    createSoundWave(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    
    // Call the original click handler
    onGameClick(e);
  };

  // Render tutorial if it's the user's first time
  if (firstTime) {
    return (
      <div className="arcade-game-container">
        <div className="pixel-header p-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold arcade-text text-white glow-text">REACTION MASTER</h1>
          <p className="text-cyan-300 pixel-text text-lg sm:text-xl mt-2">TUTORIAL</p>
        </div>
        
        <div className="p-4 sm:p-6 bg-gray-900 text-white arcade-panel">
          {tutorialStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl arcade-text text-cyan-300">How To Play</h2>
              <p className="pixel-text text-base sm:text-lg">Welcome to Reaction Master! This game tests how quickly you can react.</p>
              <div className="border-l-4 border-cyan-400 pl-4 sm:pl-6 my-4">
                <p className="pixel-text text-cyan-200 text-base sm:text-lg">The goal is simple: click on targets as fast as you can before they disappear!</p>
              </div>
              <div className="mt-6 flex justify-between">
                <button 
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-700 text-white arcade-btn text-base sm:text-lg"
                  onClick={onSkipTutorial}
                >
                  SKIP
                </button>
                <button 
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-cyan-600 text-white arcade-btn text-base sm:text-lg"
                  onClick={onAdvanceTutorial}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl arcade-text text-cyan-300">Game Rules</h2>
              <ol className="list-decimal pl-6 space-y-3 pixel-text text-base sm:text-lg">
                <li>Click <span className="text-green-400">START</span> to begin</li>
                <li>Targets will appear in <span className="text-yellow-400">RANDOM LOCATIONS</span></li>
                <li>Each target has <span className="text-yellow-400">5 SECONDS</span> to be clicked</li>
                <li>Time decreases by <span className="text-red-400">0.5 SECONDS</span> each level</li>
                <li>Missed targets cost you a <span className="text-red-400">LIFE</span></li>
                <li>Game ends after <span className="text-red-400">3 MISSES</span></li>
              </ol>
              <div className="flex justify-center py-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-6 flex justify-between">
                <button 
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-700 text-white arcade-btn text-base sm:text-lg"
                  onClick={() => onAdvanceTutorial()}
                >
                  BACK
                </button>
                <button 
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-cyan-600 text-white arcade-btn text-base sm:text-lg"
                  onClick={onAdvanceTutorial}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl arcade-text text-cyan-300">Leveling Up</h2>
              <p className="pixel-text text-base sm:text-lg">Each successful click earns you experience points.</p>
              <div className="my-4 bg-gray-800 h-6 rounded-none">
                <div className="bg-cyan-500 h-6" style={{ width: '60%' }}></div>
              </div>
              <p className="pixel-text text-base sm:text-lg">Fill the bar to level up! Each level:</p>
              <ul className="list-disc pl-6 space-y-2 pixel-text text-base sm:text-lg">
                <li>Makes targets <span className="text-yellow-400">smaller</span></li>
                <li>Reduces time by <span className="text-red-400">0.5 seconds</span> per level</li>
                <li>Increases point <span className="text-yellow-400">multipliers</span></li>
              </ul>
              <div className="mt-6 flex justify-between">
                <button 
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-700 text-white arcade-btn text-base sm:text-lg"
                  onClick={() => onAdvanceTutorial()}
                >
                  BACK
                </button>
                <button 
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-cyan-600 text-white arcade-btn text-base sm:text-lg"
                  onClick={onSkipTutorial}
                >
                  START PLAYING
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="arcade-game-container">
      {/* Header */}
      <div className="pixel-header p-3 sm:p-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold arcade-text text-white glow-text">REACTION MASTER</h1>
        <p className="text-cyan-300 pixel-text text-lg sm:text-xl mt-2">TEST YOUR REFLEXES</p>
      </div>

      {/* Feedback messages */}
      {(reactionTime || timeoutOccurred) && !gameOver && (
        <div className={`p-2 sm:p-3 text-center ${lastTargetHit ? 'bg-indigo-900 text-cyan-300' : 'bg-red-900 text-red-300'} font-medium pixel-text animate-pulse text-lg sm:text-xl`}>
          {getMessage()}
        </div>
      )}
      
      {/* Game area with improved responsive sizing */}
      <div
        ref={gameAreaRef}
        className={`relative w-full min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[540px] cursor-pointer transition-colors duration-300 arcade-game-area ${
          showTarget 
            ? "game-area-active" 
            : lastTargetHit 
              ? "game-area-success" 
              : timeoutOccurred
                ? "game-area-error"
                : "game-area-idle"
        }`}
        style={{height: 'calc(min(60vh, 600px))'}}
        onClick={handleGameClick}
      >
        {/* CRT scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanlines"></div>
        <div className="absolute inset-0 pointer-events-none crt-glow"></div>
        
        {/* Timer bar */}
        {showTarget && (
          <div className="absolute top-0 left-0 w-full h-3">
            <div 
              className="h-3 bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-100"
              style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
            ></div>
          </div>
        )}
        
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
            <div className="target-outer"></div>
            <div className="target-middle"></div>
            <div className="target-inner"></div>
            <div className="target-bullseye"></div>
          </div>
        )}
        
        {/* Start button - only show at beginning */}
        {!isPlaying && !showTarget && !gameOver && !reactionTime && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg arcade-btn text-lg sm:text-xl"
              onClick={onGameStart}
            >
              <Play className="mr-2 sm:mr-3" size={24} />
              <span className="arcade-text">START GAME</span>
            </button>
          </div>
        )}
        
        {/* Timeout message when a target timed out */}
        {timeoutOccurred && !showTarget && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 p-4 sm:p-6 rounded flex flex-col items-center">
              <AlertTriangle className="text-red-400 mb-2 sm:mb-3 animate-pulse" size={40} />
              <div className="text-red-400 font-mono text-xl sm:text-2xl">TIME&apos;S UP!</div>
              <div className="text-red-300 font-mono mt-1 sm:mt-2">Life Lost!</div>
            </div>
          </div>
        )}
        
        {/* Level Up notification */}
        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black bg-opacity-70 p-4 sm:p-6 rounded-lg flex flex-col items-center level-up-notification">
              <div className="level-up-star"></div>
              <Award className="text-yellow-400 mb-2 sm:mb-3 animate-bounce" size={50} />
              <div className="text-yellow-300 font-mono text-2xl sm:text-4xl glow-text-yellow">LEVEL UP!</div>
              <div className="text-yellow-200 font-mono mt-2 sm:mt-3 text-xl sm:text-2xl">Level {level}</div>
              <div className="text-yellow-100 font-mono mt-1 sm:mt-2">Time: {formatTimeLimit(timeLimit)}s</div>
            </div>
          </div>
        )}
        
        {/* Time indicator */}
        {showTarget && (
          <div className="absolute top-4 right-3 bg-black bg-opacity-70 p-1.5 sm:p-2 rounded flex items-center">
            <Clock size={18} className="text-red-400 mr-1" />
            <div className="text-red-400 font-mono text-sm sm:text-base">{formatTimeLimit(timeLeft)}s</div>
          </div>
        )}
        
        {/* Lives and Level indicators */}
        <div className="absolute top-4 left-3 bg-black bg-opacity-70 p-1.5 sm:p-2 rounded flex items-center">
          <div className="text-red-400 font-mono mr-3 sm:mr-4 text-sm sm:text-base">Lives: {lives}</div>
          <div className="text-cyan-400 font-mono text-sm sm:text-base">Level: {level}</div>
        </div>
        
        {/* Game Over popup */}
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="bg-gray-900 p-6 sm:p-8 rounded-lg border-4 border-red-500 w-[85%] sm:w-4/5 max-w-md text-center arcade-gameover">
              <div className="text-4xl sm:text-5xl arcade-text text-red-500 animate-glitch mb-4 sm:mb-6">GAME OVER</div>
              <div className="text-white pixel-text mb-3 sm:mb-4 text-xl sm:text-2xl">FINAL SCORE: {score}</div>
              <div className="text-cyan-300 pixel-text mb-4 sm:mb-6 text-lg sm:text-xl">LEVEL: {level}</div>
              <button
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg arcade-btn text-lg sm:text-xl mb-3 sm:mb-4 w-full"
                onClick={onResetGame}
              >
                <RotateCcw className="mr-2 sm:mr-3 inline" size={22} />
                <span className="arcade-text">PLAY AGAIN</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-2 sm:p-3 bg-gray-900">
        <div className="flex items-start space-x-2 sm:space-x-3 mb-1 sm:mb-2">
          <div className="p-1.5 sm:p-2 bg-green-900 text-green-300 rounded text-sm sm:text-lg">1</div>
          <div className="pixel-text text-green-300 text-sm sm:text-lg">CLICK TARGETS BEFORE TIME RUNS OUT</div>
        </div>
        <div className="flex items-start space-x-2 sm:space-x-3 mb-1 sm:mb-2">
          <div className="p-1.5 sm:p-2 bg-yellow-900 text-yellow-300 rounded text-sm sm:text-lg">2</div>
          <div className="pixel-text text-yellow-300 text-sm sm:text-lg">MISS 3 TARGETS = GAME OVER</div>
        </div>
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-cyan-900 text-cyan-300 rounded text-sm sm:text-lg">3</div>
          <div className="pixel-text text-cyan-300 text-sm sm:text-lg">EACH LEVEL REDUCES TIME BY 0.5s</div>
        </div>
      </div>
    </div>
  );
};

export default GameArea;