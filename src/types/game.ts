export type GameColor = 'red' | 'yellow' | 'green' | 'blue';

export interface GameState {
  isPlaying: boolean;
  startTime: number | null;
  reactionTime: number | null;
  bestTime: number | null;
  ghostTimes: number[];
  showTarget: boolean;
  error: string | null;
  tooEarly: boolean;
  currentColor: GameColor;
  targetColor: GameColor;
  colorHistory: GameColor[];
}

export interface GameStats {
  reactionTime: number | null;
  bestTime: number | null;
  ghostTimes: number[];
  colorHistory: GameColor[];
}

export interface GameAreaProps {
  gameState: GameState;
  onGameStart: () => void;
  onGameClick: () => void;
}

export interface GameStatsProps {
  stats: GameStats;
} 