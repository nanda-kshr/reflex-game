import { useState, useRef, useCallback } from 'react';
import { GameState } from '@/types/game';

const MIN_DELAY = 1000;
const MAX_DELAY = 5000;

export const useReactionGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    startTime: null,
    reactionTime: null,
    bestTime: null,
    ghostTimes: [],
    showTarget: false,
    error: null,
    tooEarly: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      showTarget: false,
      reactionTime: null,
      error: null,
      tooEarly: false,
    }));

    const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
    timeoutRef.current = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showTarget: true,
        startTime: Date.now(),
      }));
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (!gameState.isPlaying) {
      startGame();
      return;
    }

    if (!gameState.showTarget) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        reactionTime: null,
        error: 'Too early! Wait for the target.',
        tooEarly: true,
      }));
      return;
    }

    const endTime = Date.now();
    const reactionTime = endTime - (gameState.startTime || endTime);

    setGameState(prev => {
      const newBestTime = prev.bestTime === null || reactionTime < prev.bestTime
        ? reactionTime
        : prev.bestTime;

      const newGhostTimes = [...prev.ghostTimes];
      if (prev.bestTime !== null) {
        newGhostTimes.push(prev.bestTime);
      }

      return {
        ...prev,
        isPlaying: false,
        reactionTime,
        bestTime: newBestTime,
        ghostTimes: newGhostTimes,
        showTarget: false,
        error: null,
        tooEarly: false,
      };
    });
  }, [gameState.isPlaying, gameState.showTarget, gameState.startTime, startGame]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    gameState,
    startGame,
    handleClick,
    cleanup,
  };
}; 