import { Trophy, Award } from "lucide-react";

interface LeftSidebarProps {
  score: number;
  level: number;
  experience: number;
  difficulty: {
    description: string;
    color: string;
  };
}

const LeftSidebar = ({ score, level, experience, difficulty }: LeftSidebarProps) => {
  return (
    <div className="cabinet-side cabinet-left">
      <div className="side-panel-content">
        <div className="side-panel-header">
          <Trophy className="text-yellow-400" size={24} />
          <span className="side-panel-title">STATS</span>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">SCORE</span>
          <span className="side-value glow-text-score">{score}</span>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">LEVEL</span>
          <div className="flex items-center">
            <Award className="text-cyan-400 mr-1" size={16} />
            <span className="side-value text-cyan-300">{level}</span>
          </div>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">DIFF</span>
          <span className="side-value" style={{ color: `var(--color-${difficulty.color}-500)` }}>
            {difficulty.description}
          </span>
        </div>
        
        <div className="side-panel-item">
          <span className="side-label">XP</span>
        </div>
        
        <div className="side-xp-bar">
          <div 
            className="side-xp-progress"
            style={{ 
              width: `${experience}%`,
              backgroundColor: `var(--color-${difficulty.color}-500)`
            }}
          />
          <span className="side-xp-text">{experience}%</span>
        </div>
        
        <div className="cabinet-decor side-decor"></div>
        <div className="cabinet-light"></div>
      </div>
    </div>
  );
};

export default LeftSidebar;