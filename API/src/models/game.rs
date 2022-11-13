use {
    serde::{Deserialize, Serialize},
};


#[derive(Deserialize, Serialize)]
pub struct Game {
    pub team_one: String,
    pub team_two: String,
    pub over_under: f32,
    pub team_one_odds: f32,
    pub team_two_odds: f32,
}
