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

}: GameAreaProps) => {
  const { 
    showTarget, isPlaying, 
    reactionTime, targetSize, gameOver,
    firstTime, targetPosition,
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
      <div className="arcade-game-container">
        <div className="pixel-header p-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold arcade-text text-white glow-text">REACTION MASTER</h1>
          <p className="text-cyan-300 pixel-text text-lg sm:text-xl mt-2">TUTORIAL</p>
        </div>
        
        <div className="p-4 sm:p-6 bg-gray-900 text-white arcade-panel">
          {/* Tutorial content remains the same */}
          {/* ... */}
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
      
      {/* Game area with improved responsive sizing - now without stats overlays */}
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
        style={{height: 'calc(min(70vh, 700px))'}} // Increased height now that overlays are gone
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
              <div className="text-yellow-200 font-mono mt-2 sm:mt-3 text-2xl sm:text-2xl">Level {level}</div>
            </div>
          </div>
        )}
        
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

      {/* Instructions - simplified */}
      <div className="p-2 sm:p-3 bg-gray-900 text-center">
        <div className="pixel-text text-cyan-300 text-sm sm:text-lg">
          CLICK TARGETS BEFORE THEY DISAPPEAR!
        </div>
      </div>
    </div>
  );
}

export default GameArea;