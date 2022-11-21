use {serde::{Deserialize, Serialize}};


#[derive(Deserialize, Serialize)]
pub struct Prediction {
    pub predicted_winner: String,
    pub game_id: String
}
