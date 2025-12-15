export interface PredictionData {
  homeTeam: string;
  awayTeam: string;
  predictedWinner: string; // 'Home', 'Away', or 'Draw'
  scorePrediction: string;
  confidence: number; // 0 to 100
  reasoning: string;
  keyStats: string[];
  overUnder: string; // e.g., "Over 2.5"
  btts: string; // e.g., "Yes"
  predictionLevel: number; // 1 to 100
}

export interface VipPlan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface TrendingMatch {
  id: number;
  league: string;
  home: string;
  away: string;
  time: string;
}

export enum ViewState {
  HOME = 'HOME',
  VIP = 'VIP',
}