import { GameStatsProps } from '@/types/game';
import { Clock, Timer, Trophy } from "lucide-react";

export const GameStats = ({ stats }: GameStatsProps) => {
  const { reactionTime, bestTime, ghostTimes } = stats;

  return (
    <div className="flex justify-between p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center">
        <Clock className="text-blue-500 mr-2" size={20} />
        <div>
          <div className="text-xs text-gray-500">Current</div>
          <div className="font-mono font-bold">
            {reactionTime ? `${reactionTime}ms` : '-'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Trophy className="text-amber-500 mr-2" size={20} />
        <div>
          <div className="text-xs text-gray-500">Best</div>
          <div className="font-mono font-bold">
            {bestTime ? `${bestTime}ms` : '-'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Timer className="text-purple-500 mr-2" size={20} />
        <div>
          <div className="text-xs text-gray-500">Attempts</div>
          <div className="font-mono font-bold">
            {ghostTimes.length + (reactionTime ? 1 : 0)}
          </div>
        </div>
      </div>
    </div>
  );
}; 