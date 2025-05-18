'use client';
import { useState, useEffect, useRef } from 'react';
import { Clock, Trophy, Medal, AlertTriangle, Play, RotateCcw, Target } from "lucide-react";

interface GameState {
  isPlaying: boolean;
  startTime: number | null;
  reactionTime: number | null;
  bestTime: number | null;
  ghostTime: number | null;
  ghostZone: number | null;
  showTarget: boolean;
  tooEarly: boolean;
  level: number;
  accuracy: number | null;
  perfectCount: number;
  targetZone: number;
  currentStreak: number;
  bestStreak: number;
}

export default function ReactionZoneGame() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    startTime: null,
    reactionTime: null,
    bestTime: null,
    ghostTime: null,
    ghostZone: null,
    showTarget: false,
    tooEarly: false,
    level: 1,
    accuracy: null,
    perfectCount: 0,
    targetZone: 50,
    currentStreak: 0,
    bestStreak: 0
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 }); // Percent
  const [ghostVisible, setGhostVisible] = useState(false);
  const [showGhostReplay, setShowGhostReplay] = useState(false);

  // Helper to compute target zone by level (smaller as level increases)
  const getTargetZoneForLevel = (level: number): number => {
    // Minimum size 16, starts at 50, decreases as level increases
    return Math.max(16, 50 - (level - 1) * 4);
  };

  const startGame = () => {
    // Generate random position
    const newX = Math.floor(Math.random() * 80) + 10; // 10-90%
    const newY = Math.floor(Math.random() * 80) + 10; // 10-90%
    setTargetPosition({ x: newX, y: newY });

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      showTarget: false,
      reactionTime: null,
      tooEarly: false,
      accuracy: null,
      // use dynamic target zone by level
      targetZone: getTargetZoneForLevel(prev.level),
    }));

    // Random delay between 1 and 5 seconds
    const delay = Math.random() * 4000 + 1000;
    timeoutRef.current = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showTarget: true,
        startTime: Date.now(),
      }));
    }, delay);
  };

  // Show ghost replay animation before starting the game
  const handleStartWithGhost = () => {
    if (gameState.ghostTime && gameState.ghostZone) {
      setShowGhostReplay(true);
      setTimeout(() => {
        setShowGhostReplay(false);
        startGame();
      }, gameState.ghostTime + 1000);
    } else {
      startGame();
    }
  };

  const calculatePoints = (distance: number) => {
    const maxPoints = 100;
    const minPoints = 0;
    const targetRadius = gameState.targetZone / 2;
    if (distance <= targetRadius * 0.2) {
      return maxPoints; // Perfect hit in the bullseye
    } else if (distance <= targetRadius) {
      return Math.max(minPoints, Math.floor(maxPoints * (1 - distance / targetRadius)));
    } else {
      return minPoints;
    }
  };

  // "isNextRound" to indicate whether to continue (on perfect or good hit)
  const processClick = (
    e: React.MouseEvent<HTMLDivElement>,
    isNextRound: boolean = false
  ) => {
    if (!gameState.isPlaying) {
      if (!isNextRound) handleStartWithGhost();
      return;
    }

    if (!gameState.showTarget) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        reactionTime: null,
        tooEarly: true,
        currentStreak: 0,
      }));
      return;
    }

    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetX = rect.width * (targetPosition.x / 100);
    const targetY = rect.height * (targetPosition.y / 100);

    const distance = Math.sqrt(
      Math.pow(clickX - targetX, 2) +
      Math.pow(clickY - targetY, 2)
    );

    const endTime = Date.now();
    const reactionTime = endTime - (gameState.startTime || endTime);
    const accuracy = calculatePoints(distance);
    const isPerfect = accuracy === 100;

    setGameState(prev => {
      // Update streak
      const newStreak = isPerfect ? prev.currentStreak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);

      // Level progression - level up every 3 perfect hits
      const perfectCount = isPerfect ? prev.perfectCount + 1 : prev.perfectCount;
      const newLevel = Math.floor(perfectCount / 3) + 1;

      // Update best time only for perfect hits
      const newBestTime = (isPerfect && (prev.bestTime === null || reactionTime < prev.bestTime))
        ? reactionTime
        : prev.bestTime;

      // Store ghost replay data when we set a new best time
      const newGhostTime = newBestTime === reactionTime ? reactionTime : prev.ghostTime;
      const newGhostZone = newBestTime === reactionTime ? getTargetZoneForLevel(newLevel) : prev.ghostZone;

      // Next round uses next-level target size
      const newTargetZone = getTargetZoneForLevel(newLevel);

      return {
        ...prev,
        isPlaying: false,
        reactionTime,
        bestTime: newBestTime,
        accuracy,
        perfectCount,
        level: newLevel,
        targetZone: newTargetZone,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        ghostTime: newGhostTime,
        ghostZone: newGhostZone,
        showTarget: false,
        tooEarly: false,
      };
    });

    // Ghost hit animation
    if (accuracy > 0) {
      setGhostVisible(true);
      setTimeout(() => setGhostVisible(false), 800);
    }

    // If perfect or good hit, continue to next round after brief delay.
    // Define threshold for "good enough" hits (e.g. accuracy >= 60)
    if (accuracy >= 60) {
      setTimeout(() => {
        // Start next round automatically
        startGame();
      }, 800);
    }
    // If accuracy < 60, do NOT continue (show Try Again)
  };

  // Standard click handler for game area
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    processClick(e, false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getMotivationalMessage = () => {
    if (gameState.accuracy === null) return "";
    if (gameState.accuracy === 100) return "Perfect shot!";
    if (gameState.accuracy >= 80) return "Great accuracy!";
    if (gameState.accuracy >= 60) return "Good hit!";
    if (gameState.accuracy >= 40) return "Getting closer!";
    return "Keep practicing!";
  };

  // If last accuracy was >= 60, don't show the try again button
  const canTryAgain =
    gameState.accuracy !== null && gameState.accuracy < 60 && !gameState.isPlaying && !gameState.showTarget && !showGhostReplay;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
          <h1 className="text-4xl font-bold mb-2">Reaction Zone</h1>
          <p className="text-blue-100">Speed & Precision Challenge</p>
        </div>

        {/* Level progress bar */}
        <div className="flex items-center p-2 bg-gray-100">
          <div className="text-xs text-gray-500 w-16">Level {gameState.level}</div>
          <div className="flex-1 bg-gray-200 h-2 rounded-full mx-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(gameState.perfectCount % 3) / 3 * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 w-16 text-right">
            {3 - (gameState.perfectCount % 3)} to level up
          </div>
        </div>

        {/* Stats section */}
        <div className="flex justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <Clock className="text-blue-500 mr-2" size={18} />
            <div>
              <div className="text-xs text-gray-500">Reaction</div>
              <div className="font-mono font-bold">
                {gameState.reactionTime ? `${gameState.reactionTime}ms` : '-'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Trophy className="text-amber-500 mr-2" size={18} />
            <div>
              <div className="text-xs text-gray-500">Best Time</div>
              <div className="font-mono font-bold">
                {gameState.bestTime ? `${gameState.bestTime}ms` : '-'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Target className="text-green-500 mr-2" size={18} />
            <div>
              <div className="text-xs text-gray-500">Accuracy</div>
              <div className="font-mono font-bold">
                {gameState.accuracy !== null ? `${gameState.accuracy}%` : '-'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Medal className="text-purple-500 mr-2" size={18} />
            <div>
              <div className="text-xs text-gray-500">Streak</div>
              <div className="font-mono font-bold">
                {gameState.currentStreak} / {gameState.bestStreak}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {gameState.accuracy !== null && (
          <div className={`p-3 text-center font-medium ${
            gameState.accuracy === 100
              ? "bg-green-50 text-green-700 animate-pulse"
              : "bg-blue-50 text-blue-700"
          }`}>
            {getMotivationalMessage()}
          </div>
        )}

        {gameState.tooEarly && (
          <div className="p-3 text-center bg-red-50 text-red-700 font-medium flex items-center justify-center">
            <AlertTriangle className="mr-2" size={18} />
            Too early! Wait for the target to appear.
          </div>
        )}

        {/* Game area */}
        <div
          ref={gameAreaRef}
          className={`relative w-full h-64 cursor-pointer transition-colors duration-300 ${
            gameState.isPlaying
              ? "bg-gray-100"
              : gameState.tooEarly
                ? "bg-red-100"
                : "bg-blue-50"
          }`}
          onClick={handleClick}
        >
          {/* Ghost replay animation */}
          {showGhostReplay && gameState.ghostTime && gameState.ghostZone && (
            <div
              className="absolute transition-opacity duration-300"
              style={{
                opacity: 0.6,
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${gameState.ghostZone * 2}px`,
                height: `${gameState.ghostZone * 2}px`,
                animation: `ghostTargetAppear ${gameState.ghostTime}ms linear`
              }}
            >
              <div className="absolute inset-0 rounded-full bg-blue-200 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-400"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-blue-700">
                {gameState.ghostTime}ms
              </div>
            </div>
          )}

          {/* Target */}
          {gameState.showTarget && (
            <div
              className="absolute transition-opacity duration-300"
              style={{
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Outer ring */}
              <div
                className="absolute rounded-full bg-gradient-to-br from-red-400 to-red-600"
                style={{
                  width: `${gameState.targetZone * 2}px`,
                  height: `${gameState.targetZone * 2}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>

              {/* Middle ring */}
              <div
                className="absolute rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"
                style={{
                  width: `${gameState.targetZone * 1.2}px`,
                  height: `${gameState.targetZone * 1.2}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>

              {/* Inner ring */}
              <div
                className="absolute rounded-full bg-gradient-to-br from-green-400 to-green-600"
                style={{
                  width: `${gameState.targetZone * 0.6}px`,
                  height: `${gameState.targetZone * 0.6}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>

              {/* Bullseye */}
              <div
                className="absolute rounded-full bg-white"
                style={{
                  width: `${gameState.targetZone * 0.2}px`,
                  height: `${gameState.targetZone * 0.2}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            </div>
          )}

          {/* Ghost hit animation */}
          {ghostVisible && (
            <div
              className="absolute animate-ghost-hit"
              style={{
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="absolute rounded-full border-4 border-white"
                style={{
                  width: `${gameState.targetZone * 2.5}px`,
                  height: `${gameState.targetZone * 2.5}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            </div>
          )}

          {/* Start button, only show if not playing nor continuing sequence */}
          {!gameState.isPlaying && !gameState.showTarget && !showGhostReplay && (
            canTryAgain ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105 flex items-center font-bold"
                  onClick={handleStartWithGhost}
                >
                  <RotateCcw className="mr-2" size={18} />
                  Try Again
                </button>
              </div>
            ) : !gameState.accuracy ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105 flex items-center font-bold"
                  onClick={handleStartWithGhost}
                >
                  <Play className="mr-2" size={18} />
                  Start Game
                </button>
              </div>
            ) : null
          )}

          {/* Ghost replay message */}
          {showGhostReplay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-blue-600 font-medium bg-white bg-opacity-70 px-4 py-2 rounded-lg">
                <div>Ghost Replay: {gameState.ghostTime}ms</div>
              </div>
            </div>
          )}

          {/* Waiting message */}
          {gameState.isPlaying && !gameState.showTarget && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-600 font-medium bg-white bg-opacity-70 px-4 py-2 rounded-lg">
                <div className="inline-block w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Get ready...
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 text-sm text-gray-600 bg-gray-50">
          <p className="mb-2"><strong>How to play:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click "Start Game" to begin</li>
            <li>Wait for the target to appear</li>
            <li>Click as close to the center as possible</li>
            <li>Score 100% for bullseye hits</li>
            <li>Level up for smaller targets and bigger challenges!</li>
            <li>If you hit 60% or higher, the game continues automatically!</li>
          </ol>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ghostTargetAppear {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }

        @keyframes ghost-hit {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
        }

        .animate-ghost-hit {
          animation: ghost-hit 0.8s ease-out forwards;
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}