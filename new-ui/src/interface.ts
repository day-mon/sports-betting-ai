export interface Game {
    id: string;
    date: string;
    status: string;
    home_team: Team;
    away_team: Team;
    odds: Odds[];
}

export interface Team {
    id: number;
    name: string;
    score: number;
    wins: number;
    losses: number;
    abbreviation: string;
    leader: Leader;
    injuries: Injury[];
}

export interface Leader {
    name: string;
    points: number;
    rebounds: number;
    assists: number;
}

export interface Injury {
    player: string;
    team: string;
    position: string;
    injury: string;
    status: string;
}

export interface Odds {
    book_name: string;
    home_money_line: number;
    away_money_line: number;
    over_under: number;
    num_bets: number;
}