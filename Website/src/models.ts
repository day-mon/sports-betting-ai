export interface Game {
  date: string
  game_id: string;
  start_time: string;
  venue: string;
  home_team_name: string;
  away_team_name: string;
  home_team_id: number;
  away_team_id: number;
  home_team_score: string;
  away_team_score: string;s
  time_left?: string;
  odds?: Odd[];
  away_team_injuries?: Injury[];
  home_team_injuries?: Injury[];
  home_team_record: number[];
  away_team_record: number[];
  game_status: string
}

export interface Odd {
  book_name: string;
  home_team_odds: number;
  away_team_odds: number;
  predicted_score: number
  home_team_odds_trend: string;
  away_team_odds_trend: string;
}

export interface HistoryDates {
    model_name: string;
    dates: string[];
}

export interface Prediction {
  game_id: string;
  prediction: string;
  prediction_type: string
  confidence: number;
}


export interface Injury {
  player: string;
  team: string;
  position: string;
  gameId: string;
  injury: string;
  status: string;
}


export interface SavedHistory {
  game: SavedGame;
  injuries?: (Injury)[] | null;
}
export interface SavedGame {
  game_id: string;
  home_team_name: string;
  home_team_score: string;
  away_team_name: string;
  away_team_score: string;
  winner: string;
  model_name: string;
  prediction: string;
  confidence: number;
  date: string;
}
