import { Clock, Heart, Timer, Zap } from "lucide-react";

interface RightSidebarProps {
  lives: number;
  reactionTime: number | null;
  bestTime: number | null;
  timeLimit: number;
  activeTime?: number;
}

const RightSidebar = ({ lives, reactionTime, bestTime, timeLimit, activeTime }: RightSidebarProps) => {
  // Format time for display
  const formatTime = (time: number | null): string => {
    if (time === null) return "--";
    return `${time}ms`;
  };
  
  // Format time limit for display (in seconds)
  const formatTimeLimit = (ms: number): string => {
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  return (
    <div className="cabinet-side cabinet-right">
      <div className="side-panel-content">
        <div className="side-panel-header">
          <Timer className="text-red-400" size={24} />
          <span className="side-panel-title">TIME</span>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">LIVES</span>
          <div className="flex items-center">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={14}
                className={`ml-1 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-700'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">LAST</span>
          <div className="flex items-center">
            <Clock className="text-cyan-400 mr-1" size={14} />
            <span className="side-value text-cyan-300">{formatTime(reactionTime)}</span>
          </div>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">BEST</span>
          <div className="flex items-center">
            <Trophy className="text-yellow-400 mr-1" size={14} />
            <span className="side-value text-yellow-300">{formatTime(bestTime)}</span>
          </div>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">LIMIT</span>
          <div className="flex items-center">
            <Zap className="text-red-400 mr-1" size={14} />
            <span className="side-value text-red-300">{formatTimeLimit(timeLimit)}</span>
          </div>
        </div>
        
        {activeTime !== undefined && (
          <div className="side-timer-container">
            <div 
              className="side-timer-bar"
              style={{ 
                height: `${(activeTime / timeLimit) * 100}%`
              }}
            />
          </div>
        )}
        
        <div className="cabinet-decor side-decor"></div>
        <div className="cabinet-light"></div>
      </div>
    </div>
  );
};

import { Trophy } from "lucide-react";

export default RightSidebar;