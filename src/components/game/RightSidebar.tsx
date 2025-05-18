import { Clock, Heart, Timer, Zap, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

interface RightSidebarProps {
  lives: number;
  reactionTime: number | null;
  bestTime: number | null;
  timeLimit: number;
  activeTime?: number;
}

const RightSidebar = ({ lives, reactionTime, bestTime, timeLimit, activeTime }: RightSidebarProps) => {
  const [pulseEffect, setPulseEffect] = useState(false);
  const [prevReactionTime, setPrevReactionTime] = useState<number | null>(reactionTime);
  
  // Trigger pulse animation when reaction time changes
  useEffect(() => {
    if (reactionTime !== prevReactionTime && reactionTime !== null) {
      setPulseEffect(true);
      const timeout = setTimeout(() => setPulseEffect(false), 1000);
      setPrevReactionTime(reactionTime);
      return () => clearTimeout(timeout);
    }
  }, [reactionTime, prevReactionTime]);
  
  // Format time for display
  const formatTime = (time: number | null): string => {
    if (time === null) return "--";
    return `${time}ms`;
  };
  
  // Format time limit for display (in seconds)
  const formatTimeLimit = (ms: number): string => {
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  // Calculate time ratio for visual feedback
  const timeRatio = activeTime !== undefined ? activeTime / timeLimit : 1;
  
  // Determine time bar color based on remaining time
  const getTimeBarColor = () => {
    if (timeRatio > 0.6) return "bg-green-500";
    if (timeRatio > 0.3) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="relative overflow-hidden rounded-r-lg border-l-4 border-cyan-400 bg-gray-900 shadow-lg">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900 to-gray-900 opacity-70"></div>
      
      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMSAxaDQ4djQ4SDFWMXptMSAxdjE4aDhWMmg4djhoOFYyaDIwdjQ2SDJ2LTI4aDhWMTB6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')]"></div>
      
      <div className="relative z-10 p-4">
        <div className="mb-6 flex items-center border-b-2 border-cyan-400 pb-2">
          <div className="mr-3 rounded-full bg-gradient-to-r from-red-500 to-orange-400 p-2 shadow-lg">
            <Timer className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-widest text-white">TIME</span>
        </div>
        
        {/* Lives Panel */}
        <div className="mb-5 rounded-lg border-l-4 border-red-500 bg-gray-800 bg-opacity-50 p-3">
          <span className="mb-1 block text-xs font-medium text-cyan-300">LIVES</span>
          <div className="flex items-center">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={20}
                className={`ml-2 transition-all duration-300 ${
                  i < lives 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Last Reaction Time Panel */}
        <div className="mb-5 rounded-lg border-l-4 border-cyan-500 bg-gray-800 bg-opacity-50 p-3">
          <span className="mb-1 block text-xs font-medium text-cyan-300">LAST</span>
          <div className="flex items-center">
            <Clock className="mr-2 text-cyan-400" size={18} />
            <span 
              className={`text-xl font-bold text-cyan-300 ${
                pulseEffect ? 'animate-pulse' : ''
              }`}
            >
              {formatTime(reactionTime)}
            </span>
          </div>
        </div>
        
        {/* Best Time Panel */}
        <div className="mb-5 rounded-lg border-l-4 border-yellow-500 bg-gray-800 bg-opacity-50 p-3">
          <span className="mb-1 block text-xs font-medium text-cyan-300">BEST</span>
          <div className="flex items-center">
            <Trophy className="mr-2 text-yellow-400" size={18} />
            <span className="text-xl font-bold text-yellow-300">
              {formatTime(bestTime)}
            </span>
          </div>
        </div>
        
        {/* Time Limit Panel */}
        <div className="mb-5 rounded-lg border-l-4 border-red-500 bg-gray-800 bg-opacity-50 p-3">
          <span className="mb-1 block text-xs font-medium text-cyan-300">LIMIT</span>
          <div className="flex items-center">
            <Zap className="mr-2 text-red-400" size={18} />
            <span className="text-xl font-bold text-red-300">
              {formatTimeLimit(timeLimit)}
            </span>
          </div>
        </div>
        
        {/* Timer Bar */}
        {activeTime !== undefined && (
          <div className="mt-6 overflow-hidden rounded-lg border-2 border-cyan-800 bg-gray-800 shadow-inner" style={{ height: "150px" }}>
            <div className="relative h-full w-full">
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-all duration-200 ${getTimeBarColor()}`}
                style={{ height: `${(activeTime / timeLimit) * 100}%` }}
              >
                {/* Add animated glow effect */}
                <div className="absolute -top-1 left-0 right-0 h-2 animate-pulse bg-white opacity-30"></div>
              </div>
              
              {/* Time Indicators */}
              {[0.25, 0.5, 0.75].map((marker) => (
                <div 
                  key={marker}
                  className="absolute left-0 right-0 h-0.5 bg-gray-600"
                  style={{ bottom: `${marker * 100}%` }}
                />
              ))}
            </div>
            
            {/* Timer labels */}
            <div className="absolute -right-7 top-0 flex h-full flex-col justify-between py-1 text-xs text-gray-400">
              <span>0s</span>
              <span>{(timeLimit / 1000 / 2).toFixed(1)}s</span>
              <span>{(timeLimit / 1000).toFixed(1)}s</span>
            </div>
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute -bottom-4 left-0 h-8 w-full bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-900 opacity-50"></div>
        <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-lg shadow-red-500"></div>
      </div>
      
      <style jsx>{`
        @keyframes barFlash {
          0% { opacity: 0.7; }
          50% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default RightSidebar;