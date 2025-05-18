import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, Award } from "lucide-react";
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
      <div className="arcade-game-container tutorial-container">
        <div className="pixel-header p-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold arcade-text text-white glow-text">REACTION MASTER</h1>
          <p className="text-cyan-300 pixel-text text-lg sm:text-xl mt-2">TUTORIAL</p>
        </div>
        
        <div className="p-6 sm:p-8 bg-gray-900 text-white arcade-panel tutorial-panel">
          {tutorialStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl arcade-text text-cyan-300">How To Play</h2>
              <p className="pixel-text text-lg">Welcome to Reaction Master! This game tests how quickly you can react.</p>
              <div className="border-l-4 border-cyan-400 pl-6 my-4">
                <p className="pixel-text text-cyan-200 text-lg">The goal is simple: click on targets as fast as you can before they disappear!</p>
              </div>
              <div className="mt-8 flex justify-center gap-6">
                <button 
                  className="px-6 py-3 bg-purple-700 text-white arcade-btn text-lg"
                  onClick={onSkipTutorial}
                >
                  SKIP
                </button>
                <button 
                  className="px-6 py-3 bg-cyan-600 text-white arcade-btn text-lg"
                  onClick={onAdvanceTutorial}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl arcade-text text-cyan-300">Game Rules</h2>
              <ol className="list-decimal pl-6 space-y-3 pixel-text text-lg">
                <li>Click <span className="text-green-400">START</span> to begin</li>
                <li>Targets will appear in <span className="text-yellow-400">RANDOM LOCATIONS</span></li>
                <li>Each target has <span className="text-yellow-400">5 SECONDS</span> to be clicked</li>
                <li>Time decreases by <span className="text-red-400">0.5 SECONDS</span> each level</li>
                <li>Missed targets cost you a <span className="text-red-400">LIFE</span></li>
                <li>Game ends after <span className="text-red-400">3 MISSES</span></li>
              </ol>
              <div className="flex justify-center py-6">
                <div className="w-24 h-24 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-8 flex justify-center gap-6">
                <button 
                  className="px-6 py-3 bg-purple-700 text-white arcade-btn text-lg"
                  onClick={() => onAdvanceTutorial()}
                >
                  BACK
                </button>
                <button 
                  className="px-6 py-3 bg-cyan-600 text-white arcade-btn text-lg"
                  onClick={onAdvanceTutorial}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
          
          {tutorialStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-3xl arcade-text text-cyan-300">Leveling Up</h2>
              <p className="pixel-text text-lg">Each successful click earns you experience points.</p>
              <div className="my-4 bg-gray-800 h-6 rounded-none">
                <div className="bg-cyan-500 h-6" style={{ width: '60%' }}></div>
              </div>
              <p className="pixel-text text-lg">Fill the bar to level up! Each level:</p>
              <ul className="list-disc pl-6 space-y-2 pixel-text text-lg">
                <li>Makes targets <span className="text-yellow-400">smaller</span></li>
                <li>Reduces time by <span className="text-red-400">0.5 seconds</span> per level</li>
                <li>Increases point <span className="text-yellow-400">multipliers</span></li>
              </ul>
              <div className="mt-8 flex justify-center gap-6">
                <button 
                  className="px-6 py-3 bg-purple-700 text-white arcade-btn text-lg"
                  onClick={() => onAdvanceTutorial()}
                >
                  BACK
                </button>
                <button 
                  className="px-6 py-3 bg-cyan-600 text-white arcade-btn text-lg"
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
        style={{height: 'calc(min(70vh, 700px))'}}
        onClick={handleGameClick}
      >
        {/* CRT scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanlines"></div>
        <div className="absolute inset-0 pointer-events-none crt-glow"></div>
        
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
        
        {/* Start button - made larger and more prominent */}
        {!isPlaying && !showTarget && !gameOver && !reactionTime && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg arcade-btn text-2xl start-game-btn"
              onClick={onGameStart}
            >
              <Play className="mr-3" size={30} />
              <span className="arcade-text">START GAME</span>
            </button>
          </div>
        )}
        
        {/* Timeout message when a target timed out */}
        {timeoutOccurred && !showTarget && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 p-6 rounded flex flex-col items-center">
              <AlertTriangle className="text-red-400 mb-3 animate-pulse" size={50} />
              <div className="text-red-400 font-mono text-3xl">TIME&apos;S UP!</div>
              <div className="text-red-300 font-mono mt-2 text-xl">Life Lost!</div>
            </div>
          </div>
        )}
        
        {/* Level Up notification */}
        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black bg-opacity-70 p-6 rounded-lg flex flex-col items-center level-up-notification">
              <div className="level-up-star"></div>
              <Award className="text-yellow-400 mb-3 animate-bounce" size={50} />
              <div className="text-yellow-300 font-mono text-3xl glow-text-yellow">LEVEL UP!</div>
              <div className="text-yellow-200 font-mono mt-2 text-2xl">Level {level}</div>
            </div>
          </div>
        )}
        
        {/* Game Over popup */}
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="bg-gray-900 p-8 rounded-lg border-4 border-red-500 w-[85%] sm:w-4/5 max-w-md text-center arcade-gameover">
              <div className="text-5xl arcade-text text-red-500 animate-glitch mb-6">GAME OVER</div>
              <div className="text-white pixel-text mb-4 text-3xl">FINAL SCORE: {score}</div>
              <div className="text-cyan-300 pixel-text mb-6 text-2xl">LEVEL: {level}</div>
              <button
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg arcade-btn text-xl mb-4 w-full"
                onClick={onResetGame}
              >
                <RotateCcw className="mr-3 inline" size={24} />
                <span className="arcade-text">PLAY AGAIN</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions - simplified */}
      <div className="p-3 bg-gray-900 text-center">
        <div className="pixel-text text-cyan-300 text-lg sm:text-lg">
          CLICK TARGETS BEFORE THEY DISAPPEAR!
        </div>
      </div>
    </div>
  );
}

export default GameArea;