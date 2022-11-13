use {serde::{Deserialize, Serialize}};


#[derive(Deserialize, Serialize)]
pub struct Prediction {
    pub team_won: String,
    pub team_lose: String,
    pub team_won_chance: f32,
    pub team_lose_chance: f32,
    pub over_under_chance: f32,
    pub expected_value: f32,
}
