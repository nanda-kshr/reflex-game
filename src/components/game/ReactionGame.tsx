'use client';

import { useEffect } from 'react';
import { useReactionGame } from '@/hooks/useReactionGame';
import { GameStats } from './GameStats';
import { GameArea } from './GameArea';

export const ReactionGame = () => {
  const { gameState, startGame, handleClick, cleanup } = useReactionGame();

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
      <GameStats
        stats={{
          reactionTime: gameState.reactionTime,
          bestTime: gameState.bestTime,
          ghostTimes: gameState.ghostTimes,
        }}
      />
      <GameArea
        gameState={gameState}
        onGameStart={startGame}
        onGameClick={handleClick}
      />
    </div>
  );
}; 