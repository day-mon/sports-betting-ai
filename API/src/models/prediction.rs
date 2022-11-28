use {serde::{Deserialize, Serialize}};


#[derive(Deserialize, Serialize, Clone)]
pub struct Prediction {
    pub predicted_winner: String,
    pub game_id: String
}
