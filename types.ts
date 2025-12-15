export interface PredictionData {
  homeTeam: string;
  awayTeam: string;
  predictedWinner: string; // 'Home', 'Away', or 'Draw'
  scorePrediction: string;
  confidence: number; // 0 to 100
  reasoning: string;
  keyStats: string[];
}

export interface VipPlan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export enum ViewState {
  HOME = 'HOME',
  VIP = 'VIP',
}
