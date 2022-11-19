export interface Game {
    game_id: string
    start_time: string
    home_team_name: string
    away_team_name: string
    home_team_id: number
    away_team_id: number
    odds: Odd[]
}

export interface Odd {
    book_name: string
    home_team_odds: number
    away_team_odds: number
    home_team_odds_trend: string
    away_team_odds_trend: string
    home_team_opening_odds: number
    away_team_opening_odds: number
}
