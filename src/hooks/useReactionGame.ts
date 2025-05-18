import { useState, useRef, useCallback } from 'react';

export interface GameState {
  isPlaying: boolean;
  showTarget: boolean;
  startTime: number | null;
  reactionTime: number | null;
  bestTime: number | null;
  level: number;
  experience: number;
  lives: number;
  score: number;
  gameOver: boolean;
  targetSize: number;
  targetPosition: { x: number; y: number };
  timeLimit: number;
  difficulty: {
    description: string;
    color: string;
  };
  firstTime: boolean;
  tutorialStep: number;
  lastTargetHit: boolean;
  timeoutOccurred: boolean;
  justLeveledUp: boolean;
}

export const useReactionGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    showTarget: false,
    startTime: null,
    reactionTime: null,
    bestTime: null,
    level: 1,
    experience: 0,
    lives: 3,
    score: 0,
    gameOver: false,
    targetSize: 80,
    targetPosition: { x: 50, y: 50 },
    timeLimit: 5000, // 5 seconds initial time limit
    difficulty: {
      description: "Easy",
      color: "green",
    },
    firstTime: true,
    tutorialStep: 0,
    lastTargetHit: false,
    timeoutOccurred: false,
    justLeveledUp: false
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  // Track current level separately to avoid race conditions
  const currentLevelRef = useRef<number>(1);
  
  // Get difficulty based on level
  const getDifficulty = useCallback((level: number) => {
    if (level === 1) return { description: "Easy", color: "green" };
    if (level === 2) return { description: "Medium", color: "yellow" };
    if (level === 3) return { description: "Hard", color: "orange" };
    if (level === 4) return { description: "Expert", color: "red" };
    if (level >= 5) return { description: "Master", color: "purple" };
    return { description: "Easy", color: "green" };
  }, []);
  
  // Generate random position for target
  const generateRandomPosition = useCallback(() => {
    const x = Math.floor(Math.random() * 80) + 10;
    const y = Math.floor(Math.random() * 80) + 10;
    return { x, y };
  }, []);
  
  // Sound effects
  const playSound = useCallback((type: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      switch(type) {
        case 'gameStart':
          // Game start fanfare
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
          gain.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
          
        case 'success':
          // Success tone
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2);
          gain.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'timeout':
          // Timeout error sound
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.4);
          gain.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
          
        case 'miss':
          // Target miss sound
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
          
        case 'levelUp':
          // Level up celebration
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          osc1.type = 'triangle';
          osc2.type = 'square';
          
          osc1.frequency.setValueAtTime(440, audioContext.currentTime);
          osc1.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
          osc1.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
          
          osc2.frequency.setValueAtTime(220, audioContext.currentTime);
          osc2.frequency.setValueAtTime(330, audioContext.currentTime + 0.1);
          osc2.frequency.setValueAtTime(440, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          osc1.start();
          osc2.start();
          osc1.stop(audioContext.currentTime + 0.5);
          osc2.stop(audioContext.currentTime + 0.5);
          break;
          
        case 'gameover':
          // Game over sound
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime + 0.4);
          oscillator.frequency.setValueAtTime(110, audioContext.currentTime + 0.6);
          gain.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.8);
          break;
          
        case 'targetAppear':
          // Target appear blip
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
          gain.gain.setValueAtTime(0.1, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.warn("Audio API error:", error);
    }
  }, []);
  
  // Handle timeout (when player didn't click in time)
  const handleTimeout = useCallback(() => {
    // Clear any existing timeout to prevent multiple calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Update state - reduce lives and check for game over
    setGameState(prev => {
      const newLives = prev.lives - 1;
      const gameOver = newLives <= 0;
      
      console.log("Timeout occurred! Lives remaining:", newLives);
      
      // Play timeout sound
      try {
        playSound('timeout');
      } catch (err) {
        console.log("Sound error:", err);
      }
      
      return {
        ...prev,
        isPlaying: true,
        showTarget: false,
        lives: newLives,
        gameOver,
        lastTargetHit: false,
        timeoutOccurred: true
      };
    });
    
    // Show next target after a brief pause if not game over
    setTimeout(() => {
      setGameState(prev => {
        // Check if the game is over before showing next target
        if (prev.gameOver) {
          playSound('gameover');
          return prev;
        }
        
        // Generate a new position for the next target
        const targetPosition = generateRandomPosition();
        
        // Use currentLevelRef to ensure level consistency
        const level = currentLevelRef.current;
        
        // Calculate target size based on level (smaller = harder)
        const targetSize = Math.max(40, 80 - (level - 1) * 8);
        
        // Calculate time limit based on level (less time = harder)
        // Start with 5 seconds, decrease by 0.5 seconds per level, with minimum of 1 second
        const timeLimit = Math.max(1000, 5000 - (level - 1) * 500);
        
        return {
          ...prev,
          showTarget: true,
          startTime: Date.now(),
          timeoutOccurred: false,
          targetPosition,
          targetSize,
          timeLimit
        };
      });
      
      // Set the timeout for the new target
      startTargetTimeout();
    }, 800); // Longer delay after a timeout to show the miss
  }, [generateRandomPosition, playSound]);
  
  // Start timeout for the current target
  const startTargetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, gameState.timeLimit);
  }, [gameState.timeLimit, handleTimeout]);
  
  // Show a new target
  const showNextTarget = useCallback(() => {
    // Don't proceed if game is over
    if (gameState.gameOver) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Use currentLevelRef to ensure level consistency
    const level = currentLevelRef.current;
    
    // Calculate target size based on level (smaller = harder)
    const targetSize = Math.max(40, 80 - (level - 1) * 8);
    
    // Calculate time limit based on level (less time = harder)
    // Start with 5 seconds, decrease by 0.5 seconds per level, with minimum of 1 second
    const timeLimit = Math.max(1000, 5000 - (level - 1) * 500);
    
    // Generate random position
    const targetPosition = generateRandomPosition();
    
    // Update state with new target
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      showTarget: true,
      startTime: Date.now(),
      reactionTime: null,
      targetSize,
      targetPosition,
      timeLimit,
      timeoutOccurred: false,
      justLeveledUp: false
    }));
    
    // Play target appear sound
    playSound('targetAppear');
    
    // Set timeout for the new target
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeLimit);
  }, [gameState.gameOver, generateRandomPosition, handleTimeout, playSound]);
  
  // Start game
  const startGame = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset the currentLevelRef
    currentLevelRef.current = 1;
    
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      showTarget: false,
      reactionTime: null,
      bestTime: prev.bestTime, // Keep best time across games
      level: 1,
      experience: 0,
      lives: 3,
      score: 0,
      gameOver: false,
      targetSize: 80,
      timeLimit: 5000, // Reset to 5 seconds
      difficulty: getDifficulty(1),
      firstTime: false,
      lastTargetHit: false,
      timeoutOccurred: false,
      justLeveledUp: false
    }));
    
    // Play start game sound
    playSound('gameStart');
    
    // Small delay before starting to give player time to prepare
    setTimeout(() => {
      showNextTarget();
    }, 500);
  }, [getDifficulty, showNextTarget, playSound]);
  
  // Reset game (same as startGame but can be called explicitly)
  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);
  
  // Handle game area clicks
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // If game is over, reset/restart the game
    if (gameState.gameOver) {
      resetGame();
      return;
    }
    
    // If not playing or game is in tutorial mode, start the game
    if (!gameState.isPlaying || gameState.firstTime) {
      startGame();
      return;
    }
    
    // If no target is shown, ignore the click
    if (!gameState.showTarget) {
      return;
    }
    
    // Clear timeout for current target
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Get target hit coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Calculate target position in pixels
    const targetX = rect.width * (gameState.targetPosition.x / 100);
    const targetY = rect.height * (gameState.targetPosition.y / 100);
    
    // Calculate distance from click to target center
    const distance = Math.sqrt(
      Math.pow(clickX - targetX, 2) + 
      Math.pow(clickY - targetY, 2)
    );
    
    // Check if click is on target
    const targetHit = distance <= gameState.targetSize / 2;
    
    if (!targetHit) {
      // Missed the target - play miss sound
      playSound('miss');
      return; // Don't do anything else, let them try again
    }
    
    // Successfully hit the target
    const endTime = Date.now();
    const startTime = gameState.startTime || endTime;
    const reactionTime = endTime - startTime;
    
    let leveledUp = false;
    let newLevel = currentLevelRef.current;
    
    // Update state with reaction time and calculate level progression
    setGameState(prev => {
      // Calculate experience gained - REDUCED to slow down level progression
      const baseExp = 5; // Reduced from 10 to 5
      const timeBonus = Math.max(0, Math.floor((1000 - reactionTime) / 200)); // Reduced bonus
      const expGained = baseExp + timeBonus;
      const totalExp = prev.experience + expGained;
      
      // Level up every 100 experience points
      const expForLevelUp = 100;
      const oldLevel = prev.level;
      newLevel = Math.floor(totalExp / expForLevelUp) + 1;
      const expRemaining = totalExp % expForLevelUp;
      
      // Check if the player just leveled up
      leveledUp = newLevel > oldLevel;
      
      // Update best time if this is the fastest reaction
      const bestTime = prev.bestTime === null || reactionTime < prev.bestTime 
        ? reactionTime 
        : prev.bestTime;
      
      // Calculate score
      const levelBonus = prev.level * 10;
      const timeBonus2 = Math.max(0, Math.floor((1000 - reactionTime) / 10));
      const newScore = prev.score + 100 + levelBonus + timeBonus2;
      
      // Update current level reference to maintain level consistency
      if (leveledUp) {
        currentLevelRef.current = newLevel;
      }
      
      return {
        ...prev,
        showTarget: false,
        reactionTime,
        bestTime,
        level: newLevel,
        experience: expRemaining,
        score: newScore,
        difficulty: getDifficulty(newLevel),
        lastTargetHit: true,
        justLeveledUp: leveledUp
      };
    });
    
    // Play the appropriate sound effect
    if (leveledUp) {
      playSound('levelUp');
    } else {
      playSound('success');
    }
    
    // Show next target after a brief delay
    setTimeout(() => {
      showNextTarget();
    }, leveledUp ? 1000 : 300); // Longer delay if we just leveled up
    
  }, [gameState.gameOver, gameState.isPlaying, gameState.firstTime, gameState.showTarget, 
      gameState.startTime, gameState.targetPosition, gameState.targetSize, 
      startGame, resetGame, getDifficulty, showNextTarget, playSound]);
  
  const advanceTutorial = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      tutorialStep: prev.tutorialStep === 0 ? 1 : prev.tutorialStep === 1 ? 2 : 0
    }));
  }, []);
  
  const skipTutorial = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      firstTime: false,
      tutorialStep: 0
    }));
    
    // Play start sound when skipping tutorial
    playSound('gameStart');
  }, [playSound]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return { 
    gameState, 
    startGame,
    resetGame,
    handleClick,
    handleTimeout,
    advanceTutorial, 
    skipTutorial,
    cleanup,
    gameAreaRef
  };
};