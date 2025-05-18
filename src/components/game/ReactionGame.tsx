'use client';

import { useEffect } from 'react';
import { useReactionGame } from '@/hooks/useReactionGame';
import GameStats from './GameStats';
import GameArea from './GameArea';

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

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="arcade-cabinet-inner">
      {/* Left cabinet panel */}
      <div className="cabinet-side cabinet-left">
        <div className="cabinet-control"></div>
        <div className="cabinet-decor"></div>
        <div className="cabinet-light"></div>
      </div>

      {/* Main game area */}
      <div className="cabinet-screen">
        {!gameState.firstTime && (
          <GameStats
            stats={{
              reactionTime: gameState.reactionTime,
              bestTime: gameState.bestTime,
              level: gameState.level,
              experience: gameState.experience,
              score: gameState.score,
              lives: gameState.lives,
              difficulty: gameState.difficulty,
              timeLimit: gameState.timeLimit
            }}
          />
        )}
        
        <div ref={gameAreaRef} className="cabinet-screen-inner">
          <GameArea
            gameState={gameState}
            onGameStart={startGame}
            onResetGame={resetGame}
            onGameClick={handleClick}
            onAdvanceTutorial={advanceTutorial}
            onSkipTutorial={skipTutorial}
            onTimeout={handleTimeout}
          />
        </div>
      </div>

      {/* Right cabinet panel */}
      <div className="cabinet-side cabinet-right">
        <div className="cabinet-control"></div>
        <div className="cabinet-decor"></div>
        <div className="cabinet-light"></div>
      </div>
    </div>
  );
}