'use client';

import { useEffect, useState } from 'react';
import { useReactionGame } from '@/hooks/useReactionGame';
import GameArea from './GameArea';
import LeftSidebar from './leftSidebar';
import RightSidebar from './RightSidebar';

export default function ReactionGame() {
  const { 
    gameState, 
    startGame,
    resetGame,
    handleClick,
    handleTimeout, 
    advanceTutorial,
    skipTutorial,
    cleanup, 
    gameAreaRef 
  } = useReactionGame();
  
  const [activeTime, setActiveTime] = useState<number | undefined>(undefined);
  
  // Update active time
  useEffect(() => {
    if (gameState.showTarget) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - (gameState.startTime || Date.now());
        const timeLeft = Math.max(0, gameState.timeLimit - elapsed);
        setActiveTime(timeLeft);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setActiveTime(undefined);
    }
  }, [gameState.showTarget, gameState.startTime, gameState.timeLimit]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="arcade-cabinet-inner">
      {/* Left cabinet panel with stats */}
      <LeftSidebar
        score={gameState.score}
        level={gameState.level}
        experience={gameState.experience}
        difficulty={gameState.difficulty}
      />

      {/* Main game area - improved responsive width */}
      <div className="cabinet-screen">
        <div ref={gameAreaRef} className="cabinet-screen-inner game-container">
          <GameArea
            gameState={gameState}
            onGameStart={startGame}
            onResetGame={resetGame}
            onGameClick={handleClick}
            onAdvanceTutorial={advanceTutorial}
            onSkipTutorial={skipTutorial}
            onTimeout={handleTimeout}
            showStats={false} // Don't show stats in game area
          />
        </div>
      </div>

      {/* Right cabinet panel with time information */}
      <RightSidebar
        lives={gameState.lives}
        reactionTime={gameState.reactionTime}
        bestTime={gameState.bestTime}
        timeLimit={gameState.timeLimit}
        activeTime={activeTime}
      />
    </div>
  );
}