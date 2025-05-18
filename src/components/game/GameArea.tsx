import { GameAreaProps } from '@/types/game';
import { AlertTriangle, Play, RotateCcw } from "lucide-react";

export const GameArea = ({ gameState, onGameStart, onGameClick }: GameAreaProps) => {
  const { showTarget, ghostTimes, isPlaying, error, tooEarly } = gameState;

  const getMotivationalMessage = () => {
    if (!gameState.reactionTime) return "";
    if (gameState.reactionTime < 200) return "Superhuman reflexes!";
    if (gameState.reactionTime < 250) return "Lightning fast!";
    if (gameState.reactionTime < 300) return "Excellent!";
    if (gameState.reactionTime < 350) return "Great job!";
    if (gameState.reactionTime < 400) return "Good reflexes!";
    return "Keep practicing!";
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
        <h1 className="text-4xl font-bold mb-2">Reaction Master</h1>
        <p className="text-blue-100">Test your reflexes!</p>
      </div>

      {/* Game area */}
      <div
        className={`relative w-full h-64 cursor-pointer transition-colors duration-300 ${
          isPlaying 
            ? "bg-red-50" 
            : tooEarly 
              ? "bg-red-100" 
              : "bg-blue-50"
        }`}
        onClick={onGameClick}
      >
        {/* Target */}
        {showTarget && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg animate-bounce flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        )}
        
        {/* Ghost targets */}
        {ghostTimes.map((time, index) => (
          <div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: `ghost-appear 2s ease-out`,
              animationDelay: `${index * 0.5}s`,
            }}
          >
            <div className="w-24 h-24 bg-gray-200 rounded-full opacity-50 flex items-center justify-center">
              <div className="text-xs font-mono text-gray-600">{time}ms</div>
            </div>
          </div>
        ))}
        
        {/* Start button */}
        {!isPlaying && !showTarget && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105 flex items-center font-bold"
              onClick={onGameStart}
            >
              {gameState.reactionTime ? (
                <>
                  <RotateCcw className="mr-2" size={18} />
                  Try Again
                </>
              ) : (
                <>
                  <Play className="mr-2" size={18} />
                  Start Game
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Waiting message */}
        {isPlaying && !showTarget && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-red-600 font-medium">
              <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
              <div>Wait for the target...</div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback messages */}
      {gameState.reactionTime && (
        <div className="p-3 text-center bg-blue-50 text-blue-700 font-medium animate-pulse">
          {getMotivationalMessage()}
        </div>
      )}
      
      {tooEarly && (
        <div className="p-3 text-center bg-red-50 text-red-700 font-medium flex items-center justify-center">
          <AlertTriangle className="mr-2" size={18} />
          Too early! Wait for the target to appear.
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 text-sm text-gray-600 bg-gray-50">
        <p className="mb-2"><strong>How to play:</strong></p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Click &quot;Start Game&quot; to begin</li>
          <li>Wait for the green target to appear</li>
          <li>Click as fast as you can when you see it</li>
          <li>Try to beat your best time!</li>
        </ol>
      </div>
    </div>
  );
}; 