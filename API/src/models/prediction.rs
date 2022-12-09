use {serde::{Deserialize, Serialize}};


#[derive(Deserialize, Serialize, Clone)]
pub struct Prediction {
    pub prediction_type: String,
    pub prediction: String,
    pub game_id: String,
    pub confidence: Option<f32>
}
