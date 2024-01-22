export type DailyGames = DailyGame[];

export interface DailyGame {
  id: string;
  date: string;
  status: string;
  home_team: HomeTeam;
  away_team: AwayTeam;
  odds?: Odd[];
}

export interface HomeTeam {
  id: number;
  name: string;
  score: number;
  wins: number;
  losses: number;
  abbreviation: string;
  injuries: Injury[];
}

export interface Injury {
  player: string;
  team: string;
  position: string;
  injury: string;
  status: string;
}

export interface AwayTeam {
  id: number;
  name: string;
  score: number;
  wins: number;
  losses: number;
  abbreviation: string;
  injuries: Injury[];
}

export interface Odd {
  book_name: string;
  home_money_line: number;
  away_money_line: number;
  over_under: number;
  num_bets: any;
}
