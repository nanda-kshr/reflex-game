import { Trophy, Award, Zap, Flame } from "lucide-react";
import { useState, useEffect } from "react";

interface LeftSidebarProps {
  score: number;
  level: number;
  experience: number;
  difficulty: {
    description: string;
    color: string;
  };
}

// Map difficulty colors to Tailwind classes
const difficultyMap = {
  green: {
    gradient: "from-green-500 to-green-300",
    border: "border-green-500",
    text: "text-green-500",
    progressBar: "from-green-600 to-green-400"
  },
  yellow: {
    gradient: "from-yellow-500 to-yellow-300",
    border: "border-yellow-500",
    text: "text-yellow-500",
    progressBar: "from-yellow-600 to-yellow-400"
  },
  orange: {
    gradient: "from-orange-500 to-orange-300",
    border: "border-orange-500",
    text: "text-orange-500",
    progressBar: "from-orange-600 to-orange-400"
  },
  red: {
    gradient: "from-red-600 to-red-400",
    border: "border-red-600",
    text: "text-red-600",
    progressBar: "from-red-600 to-red-400"
  },
  purple: {
    gradient: "from-purple-600 to-purple-400",
    border: "border-purple-600",
    text: "text-purple-600",
    progressBar: "from-purple-600 to-purple-400"
  },
  blue: {
    gradient: "from-blue-500 to-blue-300",
    border: "border-blue-500",
    text: "text-blue-500",
    progressBar: "from-blue-600 to-blue-400"
  }
};

const LeftSidebar = ({ score, level, experience, difficulty }: LeftSidebarProps) => {
  const [glowIntensity, setGlowIntensity] = useState(1);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [scoreIncrement, setScoreIncrement] = useState(0);
  const [prevScore, setPrevScore] = useState(score);
  
  // Get style classes based on difficulty color
  const difficultyStyles = difficultyMap[difficulty.color as keyof typeof difficultyMap] || difficultyMap.blue;
  
  // Pulsing glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev === 1 ? 1.5 : 1));
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Score animation with dynamic increment value
  useEffect(() => {
    if (score !== prevScore) {
      const increment = score - prevScore;
      setScoreIncrement(increment > 0 ? increment : 0);
      setShowScoreAnimation(true);
      setPrevScore(score);
      
      const timeout = setTimeout(() => setShowScoreAnimation(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [score, prevScore]);
  
  return (
    <div className="relative overflow-hidden rounded-l-lg border-r-4 border-cyan-400 bg-gray-900 shadow-lg">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-gray-900 opacity-70"></div>
      
      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMSAxaDQ4djQ4SDFWMXptMSAxdjE4aDhWMmg4djhoOFYyaDIwdjQ2SDJ2LTI4aDhWMTB6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')]"></div>
      
      <div className="relative z-10 p-4">
        <div className="mb-6 flex items-center border-b-2 border-cyan-400 pb-2">
          <div className="mr-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-2 shadow-lg">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-widest text-white">STATS</span>
        </div>
        
        {/* Score Panel */}
        <div className="mb-5 rounded-lg border-l-4 border-yellow-400 bg-gray-800 bg-opacity-50 p-3">
          <span className="mb-1 block text-xs font-medium text-cyan-300">SCORE</span>
          <div className="relative">
            <span 
              className="text-3xl font-bold text-yellow-300 transition-all duration-500"
              style={{ 
                textShadow: `0 0 ${5 * glowIntensity}px rgba(234, 179, 8, ${0.6 * glowIntensity})`
              }}
            >
              {score.toLocaleString()}
            </span>
            {showScoreAnimation && (
              <span className="absolute -right-2 -top-4 animate-bounce text-sm font-bold text-yellow-300">
                +{scoreIncrement}
              </span>
            )}
          </div>
        </div>
        
        {/* Level Panel */}
        <div className="mb-5 rounded-lg border-l-4 border-cyan-500 bg-gray-800 bg-opacity-50 p-3">
          <span className="mb-1 block text-xs font-medium text-cyan-300">LEVEL</span>
          <div className="flex items-center">
            <div className="mr-2 rounded-full bg-cyan-900 p-1">
              <Award className="text-cyan-300" size={18} />
            </div>
            <span className="text-2xl font-bold text-cyan-300">{level}</span>
            <div className="ml-2 rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
              RANK {Math.floor(level / 5) + 1}
            </div>
          </div>
        </div>
        
        {/* Difficulty Panel */}
        <div className="mb-5 rounded-lg border-l-4 bg-gray-800 bg-opacity-50 p-3" style={{ borderColor: `var(--${difficulty.color}-500, #6366f1)` }}>
          <span className="mb-1 block text-xs font-medium text-cyan-300">DIFFICULTY</span>
          <div className="flex items-center">
            <Flame className={difficultyStyles.text} size={18} />
            <span className={`ml-2 bg-gradient-to-r ${difficultyStyles.gradient} bg-clip-text text-lg font-bold text-transparent`}>
              {difficulty.description.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cyan-300">XP PROGRESS</span>
            <div className="flex items-center">
              <Zap className="mr-1 text-amber-400" size={14} />
              <span className="text-sm font-bold text-amber-300">{experience}%</span>
            </div>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="relative mb-4 h-4 overflow-hidden rounded-full bg-gray-700">
          <div
            className={`h-full bg-gradient-to-r ${difficultyStyles.progressBar} transition-all duration-1000 ease-out`}
            style={{ width: `${experience}%` }}
          />
          
          {/* XP Markers */}
          {[25, 50, 75].map(marker => (
            <div 
              key={marker} 
              className="absolute bottom-0 top-0 w-0.5 bg-gray-500" 
              style={{ left: `${marker}%` }}
            />
          ))}
          
          {/* Animated particles */}
          <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="absolute h-6 w-6 animate-pulse rounded-full bg-white opacity-20"
                style={{
                  left: `${Math.min(experience - 5, 95)}%`,
                  top: "-1px",
                  animationDelay: `${i * 0.7}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Level indicators */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>LVL {level}</span>
          <span>LVL {level + 1}</span>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-4 left-0 h-8 w-full bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-900 opacity-50"></div>
        <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500"></div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.3); opacity: 0.6; }
          50% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(0.3); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default LeftSidebar;