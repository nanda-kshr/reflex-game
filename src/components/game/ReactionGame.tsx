'use client';

import { useEffect, useState } from 'react';
import { useReactionGame } from '@/hooks/useReactionGame';
import GameArea from './GameArea';
import LeftSidebar from './LeftSidebar';
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
    <div className="arcade-cabinet-wrapper">
      <div className="arcade-cabinet-inner">
        {/* Only show sidebars if not in tutorial mode */}
        {!gameState.firstTime && (
          <LeftSidebar
            score={gameState.score}
            level={gameState.level}
            experience={gameState.experience}
            difficulty={gameState.difficulty}
          />
        )}

        {/* Main game area - widened when in tutorial mode */}
        <div className={`cabinet-screen ${gameState.firstTime ? 'full-width' : ''}`}>
          <div ref={gameAreaRef} className="cabinet-screen-inner game-container">
            <GameArea
              gameState={gameState}
              onGameStart={startGame}
              onResetGame={resetGame}
              onGameClick={handleClick}
              onAdvanceTutorial={advanceTutorial}
              onSkipTutorial={skipTutorial}
              onTimeout={handleTimeout}
              showStats={false}
            />
          </div>
        </div>

        {/* Only show sidebars if not in tutorial mode */}
        {!gameState.firstTime && (
          <RightSidebar
            lives={gameState.lives}
            reactionTime={gameState.reactionTime}
            bestTime={gameState.bestTime}
            timeLimit={gameState.timeLimit}
            activeTime={activeTime}
          />
        )}
      </div>
    </div>
  );
}