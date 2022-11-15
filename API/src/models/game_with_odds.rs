use {
    serde::{Deserialize, Serialize},
};


#[derive(Deserialize, Serialize)]
pub struct GameWithOdds {
    pub game_id: String,
    pub home_team_name: String,
    pub away_team_name: String,
    pub home_team_id: i64,
    pub away_team_id: i64,
    pub odds: Vec<Odds>
}

#[derive(Deserialize, Serialize)]
pub struct Odds {
    pub book_name: String,
    pub home_team_odds: f64,
    pub away_team_odds: f64,
    pub home_team_odds_trend: String,
    pub away_team_odds_trend: String,
    pub home_team_opening_odds: f64,
    pub away_team_opening_odds: f64,
}
