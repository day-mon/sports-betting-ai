export interface Game {
  game_id: string;
  start_time: string;
  venue: string;
  home_team_name: string;
  away_team_name: string;
  home_team_id: number;
  away_team_id: number;
  home_team_score: string;
  away_team_score: string;
  odds: Odd[];
}

export interface Odd {
  book_name: string;
  home_team_odds: number;
  away_team_odds: number;
  home_team_odds_trend: string;
  away_team_odds_trend: string;
  home_team_opening_odds: number;
  away_team_opening_odds: number;
}

export interface Prediction {
  game_id: string;
  predicted_winner: string;
}
