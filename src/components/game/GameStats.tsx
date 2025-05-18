import { Clock, Trophy, Timer, Award, Heart, ChevronUp, Zap } from "lucide-react";

interface GameStatsProps {
  stats: {
    reactionTime: number | null;
    bestTime: number | null;
    level: number;
    experience: number;
    score: number;
    lives: number;
    timeLimit: number;
    difficulty: {
      description: string;
      color: string;
    };
  };
}

const GameStats = ({ stats }: GameStatsProps) => {
  const { reactionTime, bestTime, level, experience, score, lives, difficulty, timeLimit } = stats;

  return (
    <div className="w-full mb-4">
      {/* Score and Lives */}
      <div className="flex justify-between p-4 bg-black border-b-2 border-purple-500 arcade-panel">
        <div className="pixel-text text-yellow-300 text-xl arcade-score">
          SCORE: <span className="text-white">{score}</span>
        </div>
        
        <div className="flex items-center">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              size={24}
              className={`mx-1 ${i < lives ? 'text-red-500 fill-red-500 pulse-soft' : 'text-gray-700'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Level and Experience */}
      <div className="p-4 bg-gray-900">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Award className="text-cyan-400 mr-2" size={24} />
            <span className="pixel-text text-cyan-300 text-lg">LEVEL {level}</span>
          </div>
          <div className="pixel-text text-lg" style={{ color: `var(--color-${difficulty.color}-500)` }}>
            {difficulty.description} Difficulty
          </div>
        </div>
        
        {/* Experience bar */}
        <div className="bg-gray-900 h-6 w-full xp-bar-bg">
          <div 
            className="h-6 transition-all duration-500 relative xp-bar"
            style={{ 
              width: `${experience}%`,
              backgroundColor: `var(--color-${difficulty.color}-500)`
            }}
          >
            {experience > 0 && (
              <span className="absolute right-1 top-0 text-sm text-white">{experience}%</span>
            )}
          </div>
        </div>
        
        {/* Level changes indicator */}
        <div className="mt-2 flex justify-between text-sm text-gray-400 pixel-text">
          <div>XP: {experience}/100</div>
          <div className="flex items-center">
            <ChevronUp className="text-cyan-400 mr-1" size={16} />
            <span>Level {level + 1} unlocks {100 - experience} XP</span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-1 bg-black">
        <div className="flex flex-col items-center p-3 bg-gray-900 arcade-stat-panel">
          <Clock className="text-cyan-400 mb-1" size={22} />
          <div className="text-xs text-gray-400 pixel-text">CURRENT</div>
          <div className="font-mono font-bold text-cyan-300 text-lg arcade-stat-value">
            {reactionTime ? `${reactionTime}ms` : '--'}
          </div>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-900 arcade-stat-panel">
          <Trophy className="text-yellow-400 mb-1" size={22} />
          <div className="text-xs text-gray-400 pixel-text">BEST</div>
          <div className="font-mono font-bold text-yellow-300 text-lg arcade-stat-value">
            {bestTime ? `${bestTime}ms` : '--'}
          </div>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-900 arcade-stat-panel">
          <Timer className="text-green-400 mb-1" size={22} />
          <div className="text-xs text-gray-400 pixel-text">TIME LIMIT</div>
          <div className="font-mono font-bold text-green-300 text-lg arcade-stat-value">
            {(timeLimit / 1000).toFixed(1)}s
          </div>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-900 arcade-stat-panel">
          <Zap className="text-purple-400 mb-1" size={22} />
          <div className="text-xs text-gray-400 pixel-text">TARGET</div>
          <div className="font-mono font-bold text-purple-300 text-lg arcade-stat-value">
            LEVEL {level}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;