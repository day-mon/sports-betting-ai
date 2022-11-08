use actix_web::{HttpResponse, web};
use actix_web::http::StatusCode;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct PredictModel {
    team_one: String,
    team_two: String,
    over_under: f32,
    team_one_odds: f32,
    team_two_odds: f32
}

pub async fn predict(
    model: web::Json<PredictModel>
) -> HttpResponse {
    HttpResponse::new(StatusCode::OK)
}