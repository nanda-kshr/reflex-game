export interface GameState {
  isPlaying: boolean;
  showTarget: boolean;
  startTime: number | null;
  reactionTime: number | null;
  bestTime: number | null;
  ghostTimes: number[];
  tooEarly: boolean;
  level: number;
  streak: number;
  bestStreak: number;
  lives: number;
  score: number;
  gameOver: boolean;
  error: string | null;
  targetSize: number;
  targetSpeed: number;
  distractions: { x: number; y: number; size: number }[];
}

export interface GameStatsProps {
  stats: {
    reactionTime: number | null;
    bestTime: number | null;
    ghostTimes: number[];
    level: number;
    streak: number;
    bestStreak: number;
    score: number;
    lives: number;
  };
}

export interface GameAreaProps {
  gameState: GameState;
  onGameStart: () => void;
  onGameClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}